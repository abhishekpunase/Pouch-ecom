const API = '/api'
const TOKEN_KEY = 'pi-admin-token'

export function getAdminToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export function setAdminToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token)
  else sessionStorage.removeItem(TOKEN_KEY)
}

export function adminAuthHeaders(extra = {}) {
  const token = getAdminToken()
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra
}

async function readJson(r) {
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error || `Request failed (${r.status})`)
  return data
}

export async function apiHealth() {
  try {
    const r = await fetch(`${API}/health`)
    if (!r.ok) return { ok: false }
    return r.json()
  } catch {
    return { ok: false }
  }
}

export async function adminApiLogin(email, password) {
  const r = await fetch(`${API}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return readJson(r)
}

export async function adminApiSession() {
  try {
    const r = await fetch(`${API}/admin/session`, { headers: adminAuthHeaders() })
    if (!r.ok) return { ok: false }
    return r.json()
  } catch {
    return { ok: false, unreachable: true }
  }
}

export async function fetchAdminSettings() {
  const r = await fetch(`${API}/admin/settings`, { headers: adminAuthHeaders() })
  return readJson(r)
}

export async function updateAdminSettings(payload) {
  const r = await fetch(`${API}/admin/settings`, {
    method: 'POST',
    headers: adminAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  })
  return readJson(r)
}

export async function adminSupportRequest(path = '', options = {}) {
  const r = await fetch(`${API}/admin/support${path}`, {
    ...options,
    headers: adminAuthHeaders({ 'Content-Type': 'application/json', ...(options.headers || {}) }),
  })
  return readJson(r)
}

export async function fetchPaymentConfig() {
  try {
    const r = await fetch(`${API}/payments/config`)
    if (!r.ok) return { ready: false, keyId: '' }
    return r.json()
  } catch {
    return { ready: false, keyId: '' }
  }
}

export async function createRazorpayOrder(amount, receipt) {
  const r = await fetch(`${API}/razorpay/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, receipt }),
  })
  return readJson(r)
}

export async function verifyRazorpayPayment(payload) {
  const r = await fetch(`${API}/razorpay/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return readJson(r)
}

export async function fetchShipRates({ pincode, weight, cod }) {
  const r = await fetch(`${API}/shiprocket/rates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pincode, weight, cod }),
  })
  return readJson(r)
}

export async function createShipment(order) {
  const r = await fetch(`${API}/shiprocket/create`, {
    method: 'POST',
    headers: adminAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ order }),
  })
  return readJson(r)
}

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

export async function uploadProductImages(fileList) {
  const files = Array.from(fileList || []).filter(Boolean)
  if (!files.length) throw new Error('Choose at least one image')
  const body = new FormData()
  files.forEach((file) => body.append('files', file))
  const r = await fetch(`${API}/upload`, { method: 'POST', headers: adminAuthHeaders(), body })
  return (await readJson(r)).files || []
}

export function cartWeight(items) {
  const w = (items || []).reduce((n, i) => {
    const unit = i.packId === 'pcs' ? 0.008 : 0.35
    return n + unit * (i.qty || 1)
  }, 0)
  return Math.max(0.5, Number(w.toFixed(2)))
}
