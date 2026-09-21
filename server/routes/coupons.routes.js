import { Router } from 'express'
import { COUPONS } from '../config/env.js'

const router = Router()

function readCoupons() {
  try {
    const parsed = JSON.parse(COUPONS || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

router.post('/apply', (req, res) => {
  const code = String(req.body?.code || '').trim().toUpperCase()
  const subtotal = Number(req.body?.subtotal)
  if (!code || !Number.isFinite(subtotal) || subtotal < 0) {
    return res.status(400).json({ error: 'Enter a valid coupon code' })
  }

  const coupon = readCoupons().find((item) => item.code === code && item.active !== false)
  if (!coupon) return res.status(404).json({ error: 'Invalid or expired coupon code' })
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return res.status(400).json({ error: 'This coupon has expired' })
  }
  if (subtotal < Number(coupon.minSubtotal || 0)) {
    return res.status(400).json({ error: `Minimum order value is ₹${Number(coupon.minSubtotal).toLocaleString('en-IN')}` })
  }

  const rawDiscount = coupon.type === 'fixed' ? Number(coupon.value) : subtotal * Number(coupon.value) / 100
  const discount = Math.min(subtotal, Math.max(0, Math.round(rawDiscount * 100) / 100))
  if (!discount) return res.status(400).json({ error: 'This coupon cannot be applied to this order' })

  res.json({ code, discount, type: coupon.type, value: Number(coupon.value) })
})

export default router
