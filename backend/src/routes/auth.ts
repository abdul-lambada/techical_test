import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { signAccessToken, signRefreshToken, verifyToken } from '../lib/jwt.js'

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1)
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

function setRefreshCookie(res: Response, token: string) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
  })
}

router.post('/register', async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { email, password, name } = parsed.data
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return res.status(409).json({ error: 'Email already registered' })

  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { email, name, password: hash } })
  res.status(201).json({ id: user.id, email: user.email, name: user.name })
})

router.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

  const payload = { id: user.id, email: user.email, name: user.name }
  const accessToken = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)

  const refreshHash = await bcrypt.hash(refreshToken, 10)
  await prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash: refreshHash } })

  setRefreshCookie(res, refreshToken)
  res.json({ accessToken, user: payload })
})

router.post('/refresh', async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken as string | undefined
  if (!token) return res.status(401).json({ error: 'No refresh token' })
  const payload = verifyToken<{ id: string; email: string; name: string }>(token)
  if (!payload) return res.status(401).json({ error: 'Invalid refresh token' })

  const user = await prisma.user.findUnique({ where: { id: payload.id } })
  if (!user?.refreshTokenHash) return res.status(401).json({ error: 'No session' })
  const valid = await bcrypt.compare(token, user.refreshTokenHash)
  if (!valid) return res.status(401).json({ error: 'Invalid session' })

  const newPayload = { id: user.id, email: user.email, name: user.name }
  const accessToken = signAccessToken(newPayload)
  const newRefresh = signRefreshToken(newPayload)
  await prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash: await bcrypt.hash(newRefresh, 10) } })
  setRefreshCookie(res, newRefresh)
  res.json({ accessToken })
})

router.post('/logout', async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken as string | undefined
  if (token) {
    const payload = verifyToken<{ id: string }>(token)
    if (payload) {
      await prisma.user.update({ where: { id: payload.id }, data: { refreshTokenHash: null } }).catch(() => {})
    }
  }
  res.clearCookie('refreshToken')
  res.json({ ok: true })
})

router.get('/me', async (req: Request, res: Response) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  const token = header.slice('Bearer '.length)
  const payload = verifyToken<{ id: string }>(token)
  if (!payload) return res.status(401).json({ error: 'Unauthorized' })
  const user = await prisma.user.findUnique({ where: { id: payload.id }, select: { id: true, email: true, name: true } })
  if (!user) return res.status(404).json({ error: 'Not found' })
  res.json(user)
})

export default router
