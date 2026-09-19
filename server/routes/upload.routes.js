import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { Router } from 'express'
import multer from 'multer'
import { UPLOAD_DIR } from '../config/env.js'
import { requireAdmin } from '../middleware/auth.js'

fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'])

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase()
      const safeExt = IMAGE_EXTS.has(ext) ? ext : '.png'
      cb(null, `pouch-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${safeExt}`)
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (IMAGE_TYPES.has(file.mimetype)) cb(null, true)
    else cb(new Error('Only JPG, PNG, WebP, GIF or AVIF images are allowed'))
  },
})

const router = Router()

router.post('/', requireAdmin, (req, res) => {
  upload.array('files', 8)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Upload failed' })
    }
    const files = (req.files || []).map((f) => ({
      url: `/uploads/${f.filename}`,
      name: f.originalname,
    }))
    if (!files.length) {
      return res.status(400).json({ error: 'Choose at least one image' })
    }
    res.json({ files })
  })
})

export default router
