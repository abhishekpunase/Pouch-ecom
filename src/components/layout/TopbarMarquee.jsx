import { Link } from 'react-router-dom'
import { PRODUCTS, SITE, formatPiece } from '@/data/catalog'

const promoItems = [
  { key: 'ship', to: '/products', label: `Free shipping above ₹${SITE.freeShippingFrom.toLocaleString('en-IN')}` },
  { key: 'bulk', to: '/products', label: 'Bulk packs · 50 to 1000 pcs' },
  { key: 'cats', to: '/products', label: 'Pouches · Boxes · Labels' },
]

const productItems = PRODUCTS.filter((p) => !p.isSample).map((p) => ({
  key: p.id,
  to: `/products/${p.slug}`,
  label: `Bulk ${p.name} · from ${formatPiece(p.basePrice)}/pc`,
}))

const items = [...promoItems, ...productItems]

function Track({ copy }) {
  return (
    <div className="flex shrink-0 items-center py-2" aria-hidden={copy > 0}>
      {items.map((item) => (
        <Link
          key={`${copy}-${item.key}`}
          to={item.to}
          className="inline-flex items-center whitespace-nowrap text-xs font-medium text-white/95 hover:text-white md:text-sm"
        >
          <span>{item.label}</span>
          <span className="mx-4 text-white/40" aria-hidden>
            •
          </span>
        </Link>
      ))}
    </div>
  )
}

export default function TopbarMarquee() {
  return (
    <div className="gradient-btn overflow-hidden">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        <Track copy={0} />
        <Track copy={1} />
      </div>
    </div>
  )
}
