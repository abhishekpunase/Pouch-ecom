import { Link } from 'react-router-dom'
import { formatPiece } from '@/data/catalog'
import { productUrgency } from '@/utils/urgency'

export default function ProductCard({ product }) {
  const urgency = productUrgency(product)

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-neutral-50">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-emerald-700/90 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-white">
            {product.badge}
          </span>
        )}
        {urgency?.low && (
          <span className="absolute right-3 top-3 rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
            Only {urgency.left} left
          </span>
        )}
        {urgency && !urgency.low && urgency.hot && (
          <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
            Selling fast
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[10px] font-semibold tracking-wider text-emerald-600 uppercase">{product.category}</p>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-bold uppercase leading-snug text-emerald-800">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-1 text-xs text-gray-500">{product.shortDescription}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">Starts from</p>
            <p className="text-sm font-bold text-slate-900">
              {product.isSample ? `${formatPiece(product.basePrice)} / Kit` : `${formatPiece(product.basePrice)} / Piece`}
            </p>
          </div>
          <span className="rounded-full border border-emerald-200 px-3 py-1 text-[11px] font-semibold text-emerald-700 group-hover:bg-emerald-50">
            Bulk Rates
          </span>
        </div>
      </div>
    </Link>
  )
}
