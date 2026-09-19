import { createApp } from './app.js'
import { ADMIN_EMAIL, PORT, razorpayReady, shiprocketReady } from './config/env.js'

const app = createApp()

const server = app.listen(PORT, () => {
  console.log(`Apna Packaging Solution API on http://127.0.0.1:${PORT}`)
  console.log(`Razorpay: ${razorpayReady ? 'keys loaded' : 'NOT CONFIGURED — add keys to .env (not .env.example)'} · Shiprocket: ${shiprocketReady ? 'connected' : 'demo rates'}`)
  console.log(`Admin: ${ADMIN_EMAIL}`)
})

server.on('error', (err) => {
  console.error('API failed to start:', err.message)
  process.exit(1)
})
