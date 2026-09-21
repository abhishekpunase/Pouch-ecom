import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAdminSettings } from '@/services/api'

const defaultMarqueeItems = [
  'Free shipping above ₹8,000',
  'Bulk packs · 50 to 1000 pcs',
  'Pouches · Boxes · Labels',
]

function normalizeMarqueeItems(raw) {
  if (!raw) return defaultMarqueeItems

  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      const items = parsed.map((item) => String(item || '').trim()).filter(Boolean)
      if (items.length) return items
    }
  } catch {
    // fall through to line-based parsing
  }

  return String(raw)
    .split(/\r?\n|\|/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function Track({ items, copy }) {
  return (
    <div className="flex shrink-0 items-center py-2" aria-hidden={copy > 0}>
      {items.map((item, index) => (
        <Link
          key={`${copy}-${item}-${index}`}
          to="/products"
          className="inline-flex items-center whitespace-nowrap text-xs font-medium text-white/95 hover:text-white md:text-sm"
        >
          <span>{item}</span>
          <span className="mx-4 text-white/40" aria-hidden>
            •
          </span>
        </Link>
      ))}
    </div>
  )
}

export default function TopbarMarquee() {
  const [items, setItems] = useState(defaultMarqueeItems)

  useEffect(() => {
    let active = true

    fetchAdminSettings()
      .then((settings) => {
        if (!active) return
        setItems(normalizeMarqueeItems(settings?.MARQUEE_ITEMS))
      })
      .catch(() => {
        if (active) setItems(defaultMarqueeItems)
      })

    return () => {
      active = false
    }
  }, [])

  const marqueeItems = useMemo(() => items.length ? items : defaultMarqueeItems, [items])

  return (
    <div className="gradient-btn overflow-hidden">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        <Track items={marqueeItems} copy={0} />
        <Track items={marqueeItems} copy={1} />
      </div>
    </div>
  )
}
