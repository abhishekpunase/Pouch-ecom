import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { ADMIN_EMAIL, ADMIN_PASSWORD, COUPONS, getEnvSnapshot, updateEnvFile } from '../config/env.js'
import { clearLoginHits, loginRateLimited, requireAdmin, signAdminToken, timingEqual, verifyAdminToken } from '../middleware/auth.js'

const router = Router()

function readCoupons() {
  try {
    const parsed = JSON.parse(COUPONS || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

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

router.get('/coupons', requireAdmin, (_req, res) => {
  res.json({ coupons: readCoupons() })
})

router.post('/coupons', requireAdmin, (req, res) => {
  const body = req.body || {}
  const code = String(body.code || '').trim().toUpperCase()
  const type = body.type === 'fixed' ? 'fixed' : 'percent'
  const value = Number(body.value)
  const minSubtotal = Math.max(0, Number(body.minSubtotal || 0))
  const expiryDate = body.expiresAt ? new Date(body.expiresAt) : null

  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) return res.status(400).json({ error: 'Code must be 3-32 letters, numbers, _ or -' })
  if (!Number.isFinite(value) || value <= 0 || (type === 'percent' && value > 100)) {
    return res.status(400).json({ error: type === 'percent' ? 'Percentage must be between 1 and 100' : 'Discount must be greater than 0' })
  }
  if (expiryDate && Number.isNaN(expiryDate.getTime())) return res.status(400).json({ error: 'Expiry date is invalid' })

  const coupons = readCoupons()
  const existing = coupons.find((coupon) => coupon.id === body.id)
  const duplicate = coupons.find((coupon) => coupon.code === code && coupon.id !== body.id)
  if (duplicate) return res.status(400).json({ error: 'That coupon code already exists' })

  const coupon = {
    id: existing?.id || randomUUID(),
    code,
    type,
    value: Math.round(value * 100) / 100,
    minSubtotal: Math.round(minSubtotal * 100) / 100,
    expiresAt: expiryDate ? expiryDate.toISOString() : '',
    active: body.active !== false,
  }
  const next = existing ? coupons.map((item) => (item.id === coupon.id ? coupon : item)) : [coupon, ...coupons]

  try {
    updateEnvFile({ COUPONS: JSON.stringify(next) })
    res.json({ ok: true, coupon })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Could not save coupon' })
  }
})

router.delete('/coupons/:id', requireAdmin, (req, res) => {
  const next = readCoupons().filter((coupon) => coupon.id !== req.params.id)
  try {
    updateEnvFile({ COUPONS: JSON.stringify(next) })
    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Could not delete coupon' })
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
