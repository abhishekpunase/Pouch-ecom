import { createClient } from '@supabase/supabase-js'
import { PRODUCTS, CATEGORIES, mergeCatalog } from '@/data/catalog'
import { hasValidSupabaseConfig } from '@/lib/supabase-config'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
const key = hasValidSupabaseConfig(url, anonKey) ? anonKey : publishableKey

export const isSupabaseConfigured = hasValidSupabaseConfig(url, key)

export const supabase = isSupabaseConfigured ? createClient(url, key) : null

function localCatalog() {
  try {
    const parsed = JSON.parse(localStorage.getItem('pi-admin-products') || 'null')
    if (Array.isArray(parsed) && parsed.length) {
      const merged = mergeCatalog(parsed)
      if (merged.length !== parsed.length) {
        localStorage.setItem('pi-admin-products', JSON.stringify(merged))
      }
      return merged
    }
  } catch {
    /* ignore */
  }
  return PRODUCTS
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

export async function fetchProducts() {
  if (supabase) {
    const { data, error } = await supabase.from('products').select('*').order('name')
    if (!error && data?.length) {
      return data.map(mapProduct)
    }
  }
  return localCatalog()
}

export async function fetchProductBySlug(slug) {
  if (supabase) {
    const { data, error } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle()
    if (!error && data) return mapProduct(data)
  }
  return localCatalog().find((p) => p.slug === slug) || PRODUCTS.find((p) => p.slug === slug) || null
}

export async function fetchCategories() {
  if (supabase) {
    const { data, error } = await supabase.from('categories').select('*')
    if (!error && data?.length) return data
  }
  return CATEGORIES
}

export async function placeOrder(order) {
  const saved = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    status: order.status || 'confirmed',
    payment_status: order.payment_status || (order.payment_method === 'cod' ? 'cod' : 'paid'),
    ...order,
  }
  if (!supabase) {
    const local = JSON.parse(localStorage.getItem('pi-orders') || '[]')
    local.unshift(saved)
    localStorage.setItem('pi-orders', JSON.stringify(local))
    return saved
  }
  const { data, error } = await supabase.from('orders').insert(saved).select().single()
  if (error) {
    const local = JSON.parse(localStorage.getItem('pi-orders') || '[]')
    local.unshift(saved)
    localStorage.setItem('pi-orders', JSON.stringify(local))
    return saved
  }
  const local = JSON.parse(localStorage.getItem('pi-orders') || '[]')
  local.unshift(data)
  localStorage.setItem('pi-orders', JSON.stringify(local))
  return data
}

export async function fetchOrders(userId, email) {
  if (!supabase) {
    const local = JSON.parse(localStorage.getItem('pi-orders') || '[]')
    return local.filter((o) => o.user_id === userId || o.email === email)
  }
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (userId) query = query.eq('user_id', userId)
  else if (email) query = query.eq('email', email)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function sendContactMessage(payload) {
  if (!supabase) {
    const local = JSON.parse(localStorage.getItem('pi-contacts') || '[]')
    local.unshift({ id: crypto.randomUUID(), created_at: new Date().toISOString(), ...payload })
    localStorage.setItem('pi-contacts', JSON.stringify(local))
    return { ok: true }
  }
  const { error } = await supabase.from('contact_messages').insert(payload)
  if (error) throw error
  return { ok: true }
}
