import { Router } from 'express'
import { sendContactEmail, sendOrderEmail } from '../services/mailer.service.js'

const router = Router()

router.post('/contact', async (req, res) => {
  const payload = req.body || {}
  if (!payload.name || !payload.email || !payload.message) return res.status(400).json({ error: 'Name, email, and message are required' })
  try {
    await sendContactEmail(payload)
    res.json({ ok: true })
  } catch (error) {
    res.status(503).json({ error: error.message || 'Could not send email' })
  }
})

router.post('/order', async (req, res) => {
  if (!req.body?.id || !req.body?.email) return res.status(400).json({ error: 'Order id and email are required' })
  try {
    await sendOrderEmail(req.body)
    res.json({ ok: true })
  } catch (error) {
    res.status(503).json({ error: error.message || 'Could not send order email' })
  }
})

export default router