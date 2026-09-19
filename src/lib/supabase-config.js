export function hasValidSupabaseConfig(url = '', key = '') {
  const cleanUrl = String(url || '').trim()
  const cleanKey = String(key || '').trim()

  if (!cleanUrl || !cleanKey) return false
  if (!cleanUrl.startsWith('https://')) return false
  if (cleanUrl.includes('your-project') || cleanUrl.includes('example.com')) return false

  const placeholderPattern = /(your-(?:project|anon-key)|placeholder|example|changeme|replace-me|xxxxx|xxxx)/i
  if (placeholderPattern.test(cleanUrl) || placeholderPattern.test(cleanKey)) return false

  return cleanKey.length > 20
}
