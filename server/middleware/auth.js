import crypto from 'node:crypto'
import { ADMIN_EMAIL, SESSION_SECRET } from '../config/env.js'

export function timingEqual(a, b) {
  const left = Buffer.from(String(a))
  const right = Buffer.from(String(b))

  if (left.length !== right.length) return false

  try {
    return crypto.timingSafeEqual(left, right)
  } catch {
    return false
  }
}

export function signAdminToken(email, exp) {
  const payload = Buffer.from(JSON.stringify({ email, exp })).toString('base64url')
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export function verifyAdminToken(token) {
  const [payload, sig] = String(token || '').split('.')
  if (!payload || !sig) return null
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url')
  if (!timingEqual(sig, expected)) return null
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (!data?.exp || data.exp < Date.now()) return null
    if (data.email !== ADMIN_EMAIL) return null
    return data
  } catch {
    return null
  }
}

export function requireAdmin(req, res, next) {
  const header = String(req.headers.authorization || '')
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  const session = verifyAdminToken(token)
  if (!session) return res.status(401).json({ error: 'Admin session required. Please sign in again.' })
  req.admin = session
  next()
}

const loginHits = new Map()

export function loginRateLimited(ip) {
  const now = Date.now()
  const rec = loginHits.get(ip) || { n: 0, start: now }
  if (now - rec.start > 15 * 60 * 1000) {
    loginHits.set(ip, { n: 1, start: now })
    return false
  }
  rec.n += 1
  loginHits.set(ip, rec)
  return rec.n > 8
}

export function clearLoginHits(ip) {
  loginHits.delete(ip)
}
