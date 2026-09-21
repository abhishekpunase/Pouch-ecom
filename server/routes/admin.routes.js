import { Router } from 'express'
import { ADMIN_EMAIL, ADMIN_PASSWORD, getEnvSnapshot, updateEnvFile } from '../config/env.js'
import { clearLoginHits, loginRateLimited, requireAdmin, signAdminToken, timingEqual, verifyAdminToken } from '../middleware/auth.js'

const router = Router()

router.get('/settings', requireAdmin, (_req, res) => {
  res.json(getEnvSnapshot())
})

router.post('/settings', requireAdmin, (req, res) => {
  const patch = req.body || {}
  const requestedKeys = Object.keys(patch)
  const allowedKeys = new Set([
    'ADMIN_PASSWORD',
    'MARQUEE_ITEMS',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'SHIPROCKET_EMAIL',
    'SHIPROCKET_PASSWORD',
    'SHIPROCKET_PICKUP_PINCODE',
    'SHIPROCKET_PICKUP_LOCATION',
  ])
  if (!requestedKeys.length || requestedKeys.some((key) => !allowedKeys.has(key))) {
    return res.status(400).json({ error: 'Only password, marquee, Razorpay, and Shiprocket settings can be updated' })
  }

  const next = Object.fromEntries(requestedKeys.map((key) => [key, String(patch[key] ?? '').trim()]))
  if ('ADMIN_PASSWORD' in next && next.ADMIN_PASSWORD.length < 8) {
    return res.status(400).json({ error: 'Admin password must be at least 8 characters' })
  }

  try {
    const saved = updateEnvFile(next)
    res.json({ ok: true, settings: saved })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Could not update settings' })
  }
})

router.post('/login', (req, res) => {
  const ip = req.ip || req.socket?.remoteAddress || 'local'
  if (loginRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' })
  }
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  if (!timingEqual(email, ADMIN_EMAIL) || !timingEqual(password, ADMIN_PASSWORD)) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  clearLoginHits(ip)
  const exp = Date.now() + 12 * 60 * 60 * 1000
  res.json({ token: signAdminToken(email, exp), email, expiresAt: exp })
})

router.get('/session', (req, res) => {
  const header = String(req.headers.authorization || '')
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  const session = verifyAdminToken(token)
  if (!session) return res.status(401).json({ ok: false })
  res.json({ ok: true, email: session.email, expiresAt: session.exp })
})

export default router
