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
  SUPABASE_SERVICE_ROLE_KEY: '',
  SUPABASE_SECRET_KEY: '',
  RAZORPAY_KEY_ID: '',
  RAZORPAY_KEY_SECRET: '',
  SHIPROCKET_EMAIL: '',
  SHIPROCKET_PASSWORD: '',
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
    if (key === 'RAZORPAY_KEY_ID') process.env.RAZORPAY_KEY_ID = String(fallbackValues.RAZORPAY_KEY_ID || '')
    if (key === 'RAZORPAY_KEY_SECRET') process.env.RAZORPAY_KEY_SECRET = String(fallbackValues.RAZORPAY_KEY_SECRET || '')
    if (key === 'SHIPROCKET_EMAIL') process.env.SHIPROCKET_EMAIL = String(fallbackValues.SHIPROCKET_EMAIL || '')
    if (key === 'SHIPROCKET_PASSWORD') process.env.SHIPROCKET_PASSWORD = String(fallbackValues.SHIPROCKET_PASSWORD || '')
    if (key === 'SHIPROCKET_PICKUP_PINCODE') process.env.SHIPROCKET_PICKUP_PINCODE = String(fallbackValues.SHIPROCKET_PICKUP_PINCODE || DEFAULTS.SHIPROCKET_PICKUP_PINCODE)
    if (key === 'SHIPROCKET_PICKUP_LOCATION') process.env.SHIPROCKET_PICKUP_LOCATION = String(fallbackValues.SHIPROCKET_PICKUP_LOCATION || DEFAULTS.SHIPROCKET_PICKUP_LOCATION)
  }

  RAZORPAY_KEY_ID = makeValue('RAZORPAY_KEY_ID', process.env.RAZORPAY_KEY_ID || fileValues.RAZORPAY_KEY_ID || '')
  RAZORPAY_KEY_SECRET = makeValue('RAZORPAY_KEY_SECRET', process.env.RAZORPAY_KEY_SECRET || fileValues.RAZORPAY_KEY_SECRET || '')
  SHIPROCKET_EMAIL = makeValue('SHIPROCKET_EMAIL', process.env.SHIPROCKET_EMAIL || fileValues.SHIPROCKET_EMAIL || '')
  SHIPROCKET_PASSWORD = makeValue('SHIPROCKET_PASSWORD', process.env.SHIPROCKET_PASSWORD || fileValues.SHIPROCKET_PASSWORD || '')
  PICKUP_PIN = makeValue('SHIPROCKET_PICKUP_PINCODE', process.env.SHIPROCKET_PICKUP_PINCODE || fileValues.SHIPROCKET_PICKUP_PINCODE || DEFAULTS.SHIPROCKET_PICKUP_PINCODE)
  PICKUP_LOCATION = makeValue('SHIPROCKET_PICKUP_LOCATION', process.env.SHIPROCKET_PICKUP_LOCATION || fileValues.SHIPROCKET_PICKUP_LOCATION || DEFAULTS.SHIPROCKET_PICKUP_LOCATION)
  MARQUEE_ITEMS = makeValue('MARQUEE_ITEMS', process.env.MARQUEE_ITEMS || fileValues.MARQUEE_ITEMS || DEFAULTS.MARQUEE_ITEMS)
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
export let PICKUP_PIN = process.env.SHIPROCKET_PICKUP_PINCODE || '110020'
export let PICKUP_LOCATION = process.env.SHIPROCKET_PICKUP_LOCATION || 'Home'
export let MARQUEE_ITEMS = process.env.MARQUEE_ITEMS || '["Free shipping above ₹8,000","Bulk packs · 50 to 1000 pcs","Pouches · Boxes · Labels"]'
export let shiprocketReady = Boolean(SHIPROCKET_EMAIL && SHIPROCKET_PASSWORD)

export let ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL || 'admin@apnapackagingsolution.com')
  .trim()
  .toLowerCase()
export let ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || 'admin123'
export let SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'apna-packaging-change-me-in-production'
export let SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
export let SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || ''

export function refreshEnvConfig() {
  loadEnvFromFile()
  razorpayReady = Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET)
  shiprocketReady = Boolean(SHIPROCKET_EMAIL && SHIPROCKET_PASSWORD)
  SUPABASE_SERVICE_ROLE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '')
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
