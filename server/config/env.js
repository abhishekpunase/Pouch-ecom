import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const envPath = path.join(root, '.env')

const DEFAULTS = {
  ROOT: root,
  PORT: '8787',
  ADMIN_EMAIL: 'admin@apnapackagingsolution.com',
  ADMIN_PASSWORD: 'change-this-password',
  ADMIN_SESSION_SECRET: 'apna-packaging-change-me-in-production',
  MARQUEE_ITEMS: '["Free shipping above ₹8,000","Bulk packs · 50 to 1000 pcs","Pouches · Boxes · Labels"]',
  COUPONS: '[]',
  SUPABASE_SERVICE_ROLE_KEY: '',
  SUPABASE_SECRET_KEY: '',
  SUPABASE_URL: '',
  RAZORPAY_KEY_ID: '',
  RAZORPAY_KEY_SECRET: '',
  SHIPROCKET_EMAIL: '',
  SHIPROCKET_PASSWORD: '',
  GMAIL_USER: '',
  GMAIL_APP_PASSWORD: '',
  SMTP_HOST: '',
  SMTP_PORT: '587',
  SMTP_USER: '',
  SMTP_PASSWORD: '',
  SMTP_ENCRYPTION: 'TLS',
  MAIL_FROM: '',
  MAIL_FROM_NAME: 'Apna Packaging',
  SHIPROCKET_PICKUP_PINCODE: '110020',
  SHIPROCKET_PICKUP_LOCATION: 'Home',
}

function normalizeEnvValue(value) {
  const str = String(value ?? '').trim()
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    return str.slice(1, -1)
  }
  return str
}

function parseEnvFile(file) {
  const entries = {}
  if (!fs.existsSync(file)) return entries

  for (const rawLine of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const idx = line.indexOf('=')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const value = normalizeEnvValue(line.slice(idx + 1).trim())
    entries[key] = value
  }

  return entries
}

function makeValue(key, value) {
  if (key === 'PORT') return Number(value || DEFAULTS.PORT)
  if (key === 'ADMIN_EMAIL' || key === 'ADMIN_SESSION_SECRET' || key === 'ADMIN_PASSWORD') {
    return String(value || DEFAULTS[key]).trim()
  }
  return String(value ?? DEFAULTS[key] ?? '').trim()
}

export function loadEnvFromFile() {
  const fileValues = parseEnvFile(envPath)
  const fallbackValues = {
    ...DEFAULTS,
    ...Object.fromEntries(Object.entries(process.env).filter(([key]) => key in DEFAULTS || key.startsWith('RAZORPAY_') || key.startsWith('SHIPROCKET_') || key.startsWith('ADMIN_'))),
    ...fileValues,
  }

  for (const key of Object.keys(DEFAULTS)) {
    const envKey = key === 'ROOT' ? 'ROOT' : key
    if (key === 'PORT') {
      process.env.API_PORT = String(fallbackValues.PORT)
      continue
    }
    if (key === 'ADMIN_EMAIL') {
      process.env.ADMIN_EMAIL = String(fallbackValues.ADMIN_EMAIL || DEFAULTS.ADMIN_EMAIL)
    }
    if (key === 'ADMIN_PASSWORD') {
      process.env.ADMIN_PASSWORD = String(fallbackValues.ADMIN_PASSWORD || DEFAULTS.ADMIN_PASSWORD)
    }
    if (key === 'ADMIN_SESSION_SECRET') {
      process.env.ADMIN_SESSION_SECRET = String(fallbackValues.ADMIN_SESSION_SECRET || DEFAULTS.ADMIN_SESSION_SECRET)
    }
    if (key === 'SUPABASE_SERVICE_ROLE_KEY') process.env.SUPABASE_SERVICE_ROLE_KEY = String(fallbackValues.SUPABASE_SERVICE_ROLE_KEY || fallbackValues.SUPABASE_SECRET_KEY || '')
    if (key === 'SUPABASE_SECRET_KEY') process.env.SUPABASE_SECRET_KEY = String(fallbackValues.SUPABASE_SECRET_KEY || fallbackValues.SUPABASE_SERVICE_ROLE_KEY || '')
    if (key === 'SUPABASE_URL') process.env.SUPABASE_URL = String(fallbackValues.SUPABASE_URL || '')
    if (key === 'RAZORPAY_KEY_ID') process.env.RAZORPAY_KEY_ID = String(fallbackValues.RAZORPAY_KEY_ID || '')
    if (key === 'RAZORPAY_KEY_SECRET') process.env.RAZORPAY_KEY_SECRET = String(fallbackValues.RAZORPAY_KEY_SECRET || '')
    if (key === 'SHIPROCKET_EMAIL') process.env.SHIPROCKET_EMAIL = String(fallbackValues.SHIPROCKET_EMAIL || '')
    if (key === 'SHIPROCKET_PASSWORD') process.env.SHIPROCKET_PASSWORD = String(fallbackValues.SHIPROCKET_PASSWORD || '')
    if (key === 'GMAIL_USER') process.env.GMAIL_USER = String(fallbackValues.GMAIL_USER || '')
    if (key === 'GMAIL_APP_PASSWORD') process.env.GMAIL_APP_PASSWORD = String(fallbackValues.GMAIL_APP_PASSWORD || '')
    if (key === 'SMTP_HOST') process.env.SMTP_HOST = String(fallbackValues.SMTP_HOST || '')
    if (key === 'SMTP_PORT') process.env.SMTP_PORT = String(fallbackValues.SMTP_PORT || DEFAULTS.SMTP_PORT)
    if (key === 'SMTP_USER') process.env.SMTP_USER = String(fallbackValues.SMTP_USER || '')
    if (key === 'SMTP_PASSWORD') process.env.SMTP_PASSWORD = String(fallbackValues.SMTP_PASSWORD || '')
    if (key === 'SMTP_ENCRYPTION') process.env.SMTP_ENCRYPTION = String(fallbackValues.SMTP_ENCRYPTION || DEFAULTS.SMTP_ENCRYPTION)
    if (key === 'MAIL_FROM') process.env.MAIL_FROM = String(fallbackValues.MAIL_FROM || '')
    if (key === 'MAIL_FROM_NAME') process.env.MAIL_FROM_NAME = String(fallbackValues.MAIL_FROM_NAME || DEFAULTS.MAIL_FROM_NAME)
    if (key === 'SHIPROCKET_PICKUP_PINCODE') process.env.SHIPROCKET_PICKUP_PINCODE = String(fallbackValues.SHIPROCKET_PICKUP_PINCODE || DEFAULTS.SHIPROCKET_PICKUP_PINCODE)
    if (key === 'SHIPROCKET_PICKUP_LOCATION') process.env.SHIPROCKET_PICKUP_LOCATION = String(fallbackValues.SHIPROCKET_PICKUP_LOCATION || DEFAULTS.SHIPROCKET_PICKUP_LOCATION)
  }

  RAZORPAY_KEY_ID = makeValue('RAZORPAY_KEY_ID', process.env.RAZORPAY_KEY_ID || fileValues.RAZORPAY_KEY_ID || '')
  RAZORPAY_KEY_SECRET = makeValue('RAZORPAY_KEY_SECRET', process.env.RAZORPAY_KEY_SECRET || fileValues.RAZORPAY_KEY_SECRET || '')
  SHIPROCKET_EMAIL = makeValue('SHIPROCKET_EMAIL', process.env.SHIPROCKET_EMAIL || fileValues.SHIPROCKET_EMAIL || '')
  SHIPROCKET_PASSWORD = makeValue('SHIPROCKET_PASSWORD', process.env.SHIPROCKET_PASSWORD || fileValues.SHIPROCKET_PASSWORD || '')
  GMAIL_USER = makeValue('GMAIL_USER', process.env.GMAIL_USER || fileValues.GMAIL_USER || '')
  GMAIL_APP_PASSWORD = makeValue('GMAIL_APP_PASSWORD', process.env.GMAIL_APP_PASSWORD || fileValues.GMAIL_APP_PASSWORD || '')
  SMTP_HOST = makeValue('SMTP_HOST', process.env.SMTP_HOST || fileValues.SMTP_HOST || (GMAIL_USER ? 'smtp.gmail.com' : ''))
  SMTP_PORT = makeValue('SMTP_PORT', process.env.SMTP_PORT || fileValues.SMTP_PORT || DEFAULTS.SMTP_PORT)
  SMTP_USER = makeValue('SMTP_USER', process.env.SMTP_USER || fileValues.SMTP_USER || GMAIL_USER)
  SMTP_PASSWORD = makeValue('SMTP_PASSWORD', process.env.SMTP_PASSWORD || fileValues.SMTP_PASSWORD || GMAIL_APP_PASSWORD)
  SMTP_ENCRYPTION = makeValue('SMTP_ENCRYPTION', process.env.SMTP_ENCRYPTION || fileValues.SMTP_ENCRYPTION || DEFAULTS.SMTP_ENCRYPTION).toUpperCase()
  MAIL_FROM = makeValue('MAIL_FROM', process.env.MAIL_FROM || fileValues.MAIL_FROM || SMTP_USER)
  MAIL_FROM_NAME = makeValue('MAIL_FROM_NAME', process.env.MAIL_FROM_NAME || fileValues.MAIL_FROM_NAME || DEFAULTS.MAIL_FROM_NAME)
  PICKUP_PIN = makeValue('SHIPROCKET_PICKUP_PINCODE', process.env.SHIPROCKET_PICKUP_PINCODE || fileValues.SHIPROCKET_PICKUP_PINCODE || DEFAULTS.SHIPROCKET_PICKUP_PINCODE)
  PICKUP_LOCATION = makeValue('SHIPROCKET_PICKUP_LOCATION', process.env.SHIPROCKET_PICKUP_LOCATION || fileValues.SHIPROCKET_PICKUP_LOCATION || DEFAULTS.SHIPROCKET_PICKUP_LOCATION)
  MARQUEE_ITEMS = makeValue('MARQUEE_ITEMS', process.env.MARQUEE_ITEMS || fileValues.MARQUEE_ITEMS || DEFAULTS.MARQUEE_ITEMS)
  COUPONS = makeValue('COUPONS', process.env.COUPONS || fileValues.COUPONS || DEFAULTS.COUPONS)
  SUPABASE_SERVICE_ROLE_KEY = makeValue('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || fileValues.SUPABASE_SERVICE_ROLE_KEY || fileValues.SUPABASE_SECRET_KEY || '')
  SUPABASE_SECRET_KEY = makeValue('SUPABASE_SECRET_KEY', process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || fileValues.SUPABASE_SECRET_KEY || fileValues.SUPABASE_SERVICE_ROLE_KEY || '')
  ADMIN_EMAIL = makeValue('ADMIN_EMAIL', process.env.ADMIN_EMAIL || fileValues.ADMIN_EMAIL || DEFAULTS.ADMIN_EMAIL).toLowerCase()
  ADMIN_PASSWORD = makeValue('ADMIN_PASSWORD', process.env.ADMIN_PASSWORD || fileValues.ADMIN_PASSWORD || DEFAULTS.ADMIN_PASSWORD)
  SESSION_SECRET = makeValue('ADMIN_SESSION_SECRET', process.env.ADMIN_SESSION_SECRET || fileValues.ADMIN_SESSION_SECRET || DEFAULTS.ADMIN_SESSION_SECRET)
  PORT = Number(process.env.API_PORT || fileValues.API_PORT || DEFAULTS.PORT)
  ROOT = root
  UPLOAD_DIR = path.join(root, 'public', 'uploads')

  return { ...DEFAULTS, ...fileValues }
}

dotenv.config({ path: path.join(root, '.env') })
dotenv.config({ path: path.join(root, '.env.local') })

export let ROOT = root
export let PORT = Number(process.env.API_PORT || 8787)
export let UPLOAD_DIR = path.join(root, 'public', 'uploads')

export let RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || ''
export let RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || ''
export let razorpayReady = Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET)

export let SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL || ''
export let SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD || ''
export let GMAIL_USER = process.env.GMAIL_USER || ''
export let GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || ''
export let SMTP_HOST = process.env.SMTP_HOST || ''
export let SMTP_PORT = process.env.SMTP_PORT || '587'
export let SMTP_USER = process.env.SMTP_USER || process.env.GMAIL_USER || ''
export let SMTP_PASSWORD = process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD || ''
export let SMTP_ENCRYPTION = process.env.SMTP_ENCRYPTION || 'TLS'
export let MAIL_FROM = process.env.MAIL_FROM || process.env.SMTP_USER || process.env.GMAIL_USER || ''
export let MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || 'Apna Packaging'
export let PICKUP_PIN = process.env.SHIPROCKET_PICKUP_PINCODE || '110020'
export let PICKUP_LOCATION = process.env.SHIPROCKET_PICKUP_LOCATION || 'Home'
export let MARQUEE_ITEMS = process.env.MARQUEE_ITEMS || '["Free shipping above ₹8,000","Bulk packs · 50 to 1000 pcs","Pouches · Boxes · Labels"]'
export let COUPONS = process.env.COUPONS || '[]'
export let shiprocketReady = Boolean(SHIPROCKET_EMAIL && SHIPROCKET_PASSWORD)

export let ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL || 'admin@apnapackagingsolution.com')
  .trim()
  .toLowerCase()
export let ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || 'admin123'
export let SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'apna-packaging-change-me-in-production'
export let SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
export let SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || ''
export let SUPABASE_URL = process.env.SUPABASE_URL || ''

export function refreshEnvConfig() {
  loadEnvFromFile()
  razorpayReady = Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET)
  shiprocketReady = Boolean(SHIPROCKET_EMAIL && SHIPROCKET_PASSWORD)
  GMAIL_USER = String(process.env.GMAIL_USER || '')
  GMAIL_APP_PASSWORD = String(process.env.GMAIL_APP_PASSWORD || '')
  SMTP_HOST = String(process.env.SMTP_HOST || (GMAIL_USER ? 'smtp.gmail.com' : ''))
  SMTP_PORT = String(process.env.SMTP_PORT || '587')
  SMTP_USER = String(process.env.SMTP_USER || GMAIL_USER)
  SMTP_PASSWORD = String(process.env.SMTP_PASSWORD || GMAIL_APP_PASSWORD)
  SMTP_ENCRYPTION = String(process.env.SMTP_ENCRYPTION || 'TLS').toUpperCase()
  MAIL_FROM = String(process.env.MAIL_FROM || SMTP_USER)
  MAIL_FROM_NAME = String(process.env.MAIL_FROM_NAME || 'Apna Packaging')
  SUPABASE_SERVICE_ROLE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '')
  SUPABASE_URL = String(process.env.SUPABASE_URL || '')
}

export function getEnvSnapshot() {
  return {
    ADMIN_EMAIL,
    ADMIN_PASSWORD: '',
    ADMIN_SESSION_SECRET: SESSION_SECRET,
    MARQUEE_ITEMS,
    RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET,
    SHIPROCKET_EMAIL,
    SHIPROCKET_PASSWORD,
    GMAIL_USER,
    GMAIL_APP_PASSWORD: '',
    GMAIL_CONFIGURED: Boolean(GMAIL_USER && GMAIL_APP_PASSWORD),
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD: '',
    SMTP_ENCRYPTION,
    MAIL_FROM,
    MAIL_FROM_NAME,
    SMTP_CONFIGURED: Boolean(SMTP_HOST && SMTP_USER && SMTP_PASSWORD),
    SUPABASE_URL,
    SHIPROCKET_PICKUP_PINCODE: PICKUP_PIN,
    SHIPROCKET_PICKUP_LOCATION: PICKUP_LOCATION,
    API_PORT: PORT,
  }
}

export function updateEnvFile(patch = {}) {
  const current = parseEnvFile(envPath)
  const merged = { ...current, ...Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined && value !== null).map(([key, value]) => [key, String(value)])) }

  const lines = Object.entries(merged)
    .filter(([key]) => key !== 'ROOT')
    .map(([key, value]) => `${key}=${String(value)}`)

  fs.writeFileSync(envPath, `${lines.join('\n')}\n`, 'utf8')
  loadEnvFromFile()
  refreshEnvConfig()
  return getEnvSnapshot()
}

loadEnvFromFile()
refreshEnvConfig()
