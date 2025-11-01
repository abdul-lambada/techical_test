import { type Request, type Response, type NextFunction } from 'express'
import { verifyToken } from '../lib/jwt.js'

export interface AuthRequest extends Request {
  user?: { id: string; email: string; name: string }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  const token = header.slice('Bearer '.length)
  const payload = verifyToken<{ id: string; email: string; name: string }>(token)
  if (!payload) return res.status(401).json({ error: 'Unauthorized' })
  req.user = payload
  next()
}
