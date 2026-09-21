import { createClient } from '@supabase/supabase-js'

export function hasValidSupabaseConfig(url = '', key = '') {
  const cleanUrl = String(url || '').trim()
  const cleanKey = String(key || '').trim()

  if (!cleanUrl || !cleanKey) return false
  if (!cleanUrl.startsWith('https://')) return false
  if (cleanUrl.includes('your-project') || cleanUrl.includes('example.com')) return false

  const placeholderPattern = /(your-project|anon-key|placeholder|example|xxxxx|xxxx)/i
  if (placeholderPattern.test(cleanUrl) || placeholderPattern.test(cleanKey)) return false

  return cleanKey.length > 20
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = hasValidSupabaseConfig(supabaseUrl, supabasePublishableKey)
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null