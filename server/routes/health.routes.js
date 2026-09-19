import { Router } from 'express'
import { PICKUP_PIN, razorpayReady, shiprocketReady } from '../config/env.js'

const router = Router()

router.get('/health', (_req, res) => {
  res.json({
    ok: true,
    razorpay: razorpayReady,
    shiprocket: shiprocketReady,
    pickupPincode: PICKUP_PIN,
  })
})

export default router
