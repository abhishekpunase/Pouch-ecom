function hash(value) {
  let h = 2166136261
  const str = String(value)
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function istDayKey() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
}

export function msUntilMidnightIst() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(new Date())
  const n = (type) => Number(parts.find((p) => p.type === type)?.value || 0)
  const elapsed = ((n('hour') % 24) * 3600 + n('minute') * 60 + n('second')) * 1000
  return Math.max(0, 24 * 60 * 60 * 1000 - elapsed)
}

export function formatCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = String(Math.floor(total / 3600)).padStart(2, '0')
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

export function productUrgency(product) {
  if (!product || product.isSample) return null
  const seed = hash(`${product.id}:${istDayKey()}`)
  const left = 3 + (seed % 10)
  const soldToday = 11 + (seed % 37)
  const viewing = 4 + (seed % 8)
  return {
    left,
    soldToday,
    viewing,
    low: left <= 8,
    hot: soldToday >= 28,
  }
}
