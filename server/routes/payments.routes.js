import crypto from 'node:crypto'
import { Router } from 'express'
import Razorpay from 'razorpay'
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, razorpayReady } from '../config/env.js'

const router = Router()
const razorpay = razorpayReady ? new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET }) : null

const NOT_CONFIGURED =
  'Online payment is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env and restart the API.'

function razorpayMessage(err, fallback) {
  return err?.error?.description || err?.message || fallback
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a || ''), 'utf8')
  const y = Buffer.from(String(b || ''), 'utf8')
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}

router.get('/payments/config', (_req, res) => {
  res.json({
    keyId: razorpayReady ? RAZORPAY_KEY_ID : '',
    ready: razorpayReady,
    provider: 'razorpay',
  })
})

// Step 1: create a Razorpay order (amount comes in rupees, Razorpay needs paise).
router.post('/razorpay/order', async (req, res) => {
  if (!razorpay) return res.status(503).json({ error: NOT_CONFIGURED })
  try {
    const rupees = Number(req.body?.amount)
    if (!Number.isFinite(rupees) || rupees < 1) {
      return res.status(400).json({ error: 'Invalid amount' })
    }
    const order = await razorpay.orders.create({
      amount: Math.round(rupees * 100),
      currency: 'INR',
      receipt: String(req.body?.receipt || `pi_${Date.now()}`).slice(0, 40),
    })
    res.json({ id: order.id, amount: order.amount, currency: order.currency, keyId: RAZORPAY_KEY_ID })
  } catch (err) {
    res.status(502).json({ error: razorpayMessage(err, 'Could not create Razorpay order') })
  }
})

// Step 2: after the popup reports success, prove the payment is real.
//   a) HMAC signature must match  b) Razorpay must confirm the payment itself.
router.post('/razorpay/verify', async (req, res) => {
  if (!razorpay) return res.status(503).json({ error: NOT_CONFIGURED })
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {}
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment details' })
  }

  const expected = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')
  if (!safeEqual(expected, razorpay_signature)) {
    return res.status(400).json({ error: 'Payment verification failed (signature mismatch)' })
  }

  try {
    let payment = await razorpay.payments.fetch(razorpay_payment_id)
    if (payment.order_id !== razorpay_order_id) {
      return res.status(400).json({ error: 'Payment does not belong to this order' })
    }
    if (payment.status === 'authorized') {
      payment = await razorpay.payments.capture(razorpay_payment_id, payment.amount, payment.currency)
    }
    if (payment.status !== 'captured') {
      return res.status(402).json({ error: `Payment not completed (status: ${payment.status})` })
    }
    res.json({
      ok: true,
      status: payment.status,
      method: payment.method,
      amount: payment.amount / 100,
      payment_id: payment.id,
    })
  } catch (err) {
    res.status(502).json({ error: razorpayMessage(err, 'Could not confirm payment with Razorpay') })
  }
})

export default router
