import jwt from 'jsonwebtoken'

const ACCESS_TTL = '15m'
const REFRESH_TTL = '7d'

export function signAccessToken(payload: object) {
  const secret = process.env.JWT_SECRET || 'change-me'
  return jwt.sign(payload, secret, { expiresIn: ACCESS_TTL })
}

export function signRefreshToken(payload: object) {
  const secret = process.env.JWT_SECRET || 'change-me'
  return jwt.sign(payload, secret, { expiresIn: REFRESH_TTL })
}

export function verifyToken<T = any>(token: string): T | null {
  try {
    const secret = process.env.JWT_SECRET || 'change-me'
    return jwt.verify(token, secret) as T
  } catch {
    return null
  }
}
