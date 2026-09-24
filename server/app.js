import express from 'express'
import cors from 'cors'
import { UPLOAD_DIR } from './config/env.js'
import adminRoutes from './routes/admin.routes.js'
import healthRoutes from './routes/health.routes.js'
import paymentsRoutes from './routes/payments.routes.js'
import shippingRoutes from './routes/shipping.routes.js'
import uploadRoutes from './routes/upload.routes.js'
import supportRoutes from './routes/support.routes.js'
import couponsRoutes from './routes/coupons.routes.js'
import mailRoutes from './routes/mail.routes.js'

export function createApp() {
  const app = express()
  app.use(cors())
  app.use(express.json({ limit: '1mb' }))
  app.use('/uploads', express.static(UPLOAD_DIR))

  app.use('/api', healthRoutes)
  app.use('/api/admin', adminRoutes)
  app.use('/api/admin/support', supportRoutes)
  app.use('/api/coupons', couponsRoutes)
  app.use('/api/upload', uploadRoutes)
  app.use('/api/shiprocket', shippingRoutes)
  app.use('/api', paymentsRoutes)
  app.use('/api/mail', mailRoutes)

  return app
}
