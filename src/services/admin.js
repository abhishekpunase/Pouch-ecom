import { PRODUCTS, mergeCatalog } from '@/data/catalog'
import { adminApiLogin, adminApiSession, adminSupportRequest, setAdminToken } from './api'
import { isSupabaseConfigured, supabase } from './supabase'

const ORDERS_KEY = 'pi-orders'
const CONTACTS_KEY = 'pi-contacts'
const PRODUCTS_KEY = 'pi-admin-products'
const ADMIN_KEY = 'pi-admin'
const EMAIL_KEY = 'pi-admin-email'
const READ_KEY = 'pi-message-reads'

export const DEFAULT_ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@apnapackagingsolution.com'

export function getAdminEmail() {
  try {
    return sessionStorage.getItem(EMAIL_KEY) || DEFAULT_ADMIN_EMAIL
  } catch {
    return DEFAULT_ADMIN_EMAIL
  }
}

export function isAdminSession() {
  try {
    return Boolean(sessionStorage.getItem('pi-admin-token'))
  } catch {
    return false
  }
}

export async function adminLogin(email, password) {
  const data = await adminApiLogin(email, password)
  sessionStorage.setItem(ADMIN_KEY, '1')
  sessionStorage.setItem(EMAIL_KEY, data.email)
  setAdminToken(data.token)
  return data
}

export async function verifyAdminSession() {
  const token = sessionStorage.getItem('pi-admin-token')
  if (!token) {
    adminLogout()
    return false
  }
  const result = await adminApiSession()
  if (result.ok) return true
  if (result.unreachable) return true
  adminLogout()
  return false
}

export function adminLogout() {
  sessionStorage.removeItem(ADMIN_KEY)
  sessionStorage.removeItem(EMAIL_KEY)
  setAdminToken('')
}

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback))
  } catch {
    return fallback
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadAdminProducts() {
  const local = read(PRODUCTS_KEY, null)
  const merged = mergeCatalog(Array.isArray(local) ? local : [])
  write(PRODUCTS_KEY, merged)
  return merged
}

export function saveAdminProducts(list) {
  write(PRODUCTS_KEY, list)
  window.dispatchEvent(new Event('pi-catalog-updated'))
}

export function loadAllOrders() {
  return read(ORDERS_KEY, [])
}

export function saveAllOrders(list) {
  write(ORDERS_KEY, list)
}

export function updateLocalOrder(id, patch) {
  const list = loadAllOrders().map((o) => (o.id === id ? { ...o, ...patch } : o))
  saveAllOrders(list)
  return list.find((o) => o.id === id)
}

export function loadMessages() {
  return read(CONTACTS_KEY, [])
}

function mapProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    featured: row.featured,
    badge: row.badge,
    rating: Number(row.rating ?? 0),
    reviews: row.reviews ?? 0,
    basePrice: Number(row.base_price ?? row.basePrice),
    inStock: row.in_stock ?? row.inStock ?? true,
    isSample: row.is_sample ?? row.isSample ?? false,
    shortDescription: row.short_description ?? row.shortDescription,
    description: row.description,
    images: row.images || [],
    sizes: row.sizes || [],
    colours: row.colours || [],
    packs: row.packs || [],
    features: row.features || [],
  }
}

export async function adminFetchProducts() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('products').select('*').order('name')
    if (!error && data?.length) return data.map(mapProduct)
  }
  return loadAdminProducts()
}

export async function adminSaveProduct(product) {
  if (isSupabaseConfigured) {
    const row = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category || 'pouches',
      featured: product.featured || false,
      badge: product.badge || null,
      rating: product.rating || 0,
      reviews: product.reviews || 0,
      base_price: product.basePrice,
      in_stock: product.inStock !== false,
      is_sample: product.isSample || false,
      short_description: product.shortDescription,
      description: product.description,
      images: product.images || [],
      sizes: product.sizes || [],
      colours: product.colours || [],
      packs: product.packs || [],
      features: product.features || [],
    }
    const { error } = await supabase.from('products').upsert(row)
    if (error) throw error
  }
  const list = loadAdminProducts()
  const idx = list.findIndex((p) => p.id === product.id)
  if (idx >= 0) list[idx] = { ...list[idx], ...product }
  else list.push(product)
  saveAdminProducts(list)
  return product
}

export async function adminDeleteProduct(id) {
  if (isSupabaseConfigured) {
    await supabase.from('products').delete().eq('id', id)
  }
  saveAdminProducts(loadAdminProducts().filter((p) => p.id !== id))
}

export async function adminDuplicateProduct(id) {
  const list = await adminFetchProducts()
  const src = list.find((p) => p.id === id)
  if (!src) throw new Error('Product not found')
  const stamp = Date.now()
  return adminSaveProduct({
    ...JSON.parse(JSON.stringify(src)),
    id: `${src.id}-copy-${stamp}`,
    slug: `${src.slug}-copy`,
    name: `${src.name} (Copy)`,
    featured: false,
  })
}

export async function adminFetchOrders() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (!error && data) return data
  }
  return loadAllOrders()
}

export async function adminUpdateOrder(id, patch) {
  if (isSupabaseConfigured) {
    await supabase.from('orders').update(patch).eq('id', id)
  }
  return updateLocalOrder(id, patch)
}

export async function adminFetchMessages() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
    if (!error && data) return data
  }
  return loadMessages()
}

export async function adminFetchSupportTickets() {
  try {
    return await adminSupportRequest()
  } catch {
    return []
  }
}

export async function adminDeleteMessage(id) {
  if (isSupabaseConfigured) {
    await supabase.from('contact_messages').delete().eq('id', id)
  }
  write(
    CONTACTS_KEY,
    loadMessages().filter((m) => m.id !== id),
  )
}

export function getReadMessageIds() {
  return new Set(read(READ_KEY, []))
}

export function markMessageRead(id) {
  const ids = read(READ_KEY, [])
  if (!ids.includes(id)) write(READ_KEY, [...ids, id])
}

export function unreadMessageCount(messages) {
  const ids = getReadMessageIds()
  return (messages || []).filter((m) => m.id && !ids.has(m.id)).length
}

export function deriveCustomers(orders) {
  const map = new Map()
  for (const o of orders || []) {
    const email = String(o.email || '').trim().toLowerCase()
    if (!email) continue
    const shipping = o.shipping_address || {}
    const prev = map.get(email) || {
      email,
      name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      gstin: '',
      orders: 0,
      spend: 0,
      last: o.created_at,
      lastOrderId: o.id || null,
    }
    prev.orders += 1
    if (o.status !== 'cancelled') prev.spend += Number(o.total || 0)
    prev.name = shipping.name || o.email || prev.name
    prev.phone = shipping.phone || prev.phone
    prev.address = shipping.address || prev.address
    prev.city = shipping.city || prev.city
    prev.state = shipping.state || prev.state
    prev.pincode = shipping.pincode || prev.pincode
    prev.gstin = shipping.gstin || prev.gstin
    if (new Date(o.created_at || 0) > new Date(prev.last || 0)) {
      prev.last = o.created_at
      prev.lastOrderId = o.id || prev.lastOrderId
      prev.name = shipping.name || prev.name
      prev.phone = shipping.phone || prev.phone
      prev.address = shipping.address || prev.address
      prev.city = shipping.city || prev.city
      prev.state = shipping.state || prev.state
      prev.pincode = shipping.pincode || prev.pincode
      prev.gstin = shipping.gstin || prev.gstin
    }
    map.set(email, prev)
  }
  return [...map.values()].sort((a, b) => b.spend - a.spend)
}

export function downloadCsv(filename, rows) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function orderShortId(id) {
  return String(id || '').replace(/-/g, '').slice(0, 8).toUpperCase()
}
