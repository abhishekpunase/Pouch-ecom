import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Lock,
  Minus,
  Package,
  Plus,
  Star,
  Truck,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  BULK_MIN_QTY,
  BULK_QTY_STEP,
  BULK_TIERS,
  SITE,
  bulkTier,
  formatInr,
  formatPiece,
  nextBulkTier,
  piecePriceExcl,
  withGst,
} from '@/data/catalog'
import { fetchProductBySlug, fetchProducts } from '@/services/supabase'
import { useCart } from '@/context/CartContext'
import { whatsappUrl } from '@/utils/whatsapp'
import ProductCard from '@/components/catalog/ProductCard'

const DEFAULT_FEATURES = [
  'Food Grade',
  'Leak Proof',
  'Airtight Zipper',
  'Heat Sealable',
  'High Barrier',
  'Moisture Free',
]

const TRUST = [
  { title: 'In stock', sub: 'Ready to ship' },
  { title: 'Premium Quality', sub: 'High grade material' },
  { title: 'Fast Delivery', sub: 'Across India' },
]

const PERKS = [
  { icon: Lock, title: 'Secure Payments', sub: '100% secure payments' },
  { icon: FileText, title: 'GST Invoicing', sub: 'Business invoices' },
  { icon: Package, title: 'Bulk Discounts', sub: 'Save more on bulk' },
  { icon: Truck, title: 'All India Shipping', sub: 'Fast all India shipping' },
]

function WhatsAppMark({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addItem, items } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [related, setRelated] = useState([])
  const [sizeId, setSizeId] = useState('')
  const [colourId, setColourId] = useState('')
  const [qty, setQty] = useState(BULK_MIN_QTY)
  const [img, setImg] = useState(0)

  useEffect(() => {
    setLoading(true)
    setProduct(null)
    fetchProductBySlug(slug).then((p) => {
      if (p?.isSample) {
        navigate('/sample-kit', { replace: true })
        return
      }
      setProduct(p)
      setLoading(false)
      if (p) {
        setSizeId(p.sizes[0]?.id || '')
        setColourId(p.colours[0]?.id || '')
        setQty(BULK_MIN_QTY)
        setImg(0)
      }
    })
    fetchProducts().then((all) => {
      const others = all.filter((x) => x.slug !== slug && !x.isSample)
      const current = all.find((x) => x.slug === slug)
      const sameCat = others.filter((x) => x.category === current?.category)
      setRelated((sameCat.length ? sameCat : others).slice(0, 4))
    })
  }, [slug, navigate])

  const size = product?.sizes?.find((s) => s.id === sizeId)
  const colour = product?.colours?.find((c) => c.id === colourId)
  const tier = bulkTier(qty)
  const nextTier = nextBulkTier(qty)
  const perPiece = useMemo(
    () => (product && size ? piecePriceExcl(product, size, qty) : 0),
    [product, size, qty],
  )
  const perPieceGst = withGst(perPiece)
  const lineTotal = Math.round(perPiece * qty * 100) / 100
  const inCartSame = items
    .filter((i) => i.productId === product?.id && i.sizeId === sizeId && i.colourId === colourId && i.packId === 'pcs')
    .reduce((n, i) => n + i.qty, 0)

  const features = product?.features?.length >= 4 ? product.features.slice(0, 6) : DEFAULT_FEATURES

  function clampQty(value) {
    const n = Math.round(Number(value) || BULK_MIN_QTY)
    return Math.max(BULK_MIN_QTY, n)
  }

  function cartPayload() {
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      sizeId: size.id,
      sizeLabel: `${size.label} · ${size.dim}`,
      colourId: colour?.id || 'default',
      colourLabel: colour?.label || 'Standard',
      packId: 'pcs',
      pieces: qty,
      packLabel: `${qty} pcs`,
      price: perPiece,
      qty,
    }
  }

  function addToCart() {
    addItem(cartPayload())
    toast.success(`${qty} pcs added to cart`)
  }

  function buyNow() {
    addItem(cartPayload())
    navigate('/checkout')
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-600" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link to="/products" className="mt-4 inline-block text-emerald-700">
          Browse products
        </Link>
      </div>
    )
  }

  const stickerHref = whatsappUrl(
    `Hi, I want custom stickers / print on ${product.name} (${size?.label || ''}). Reaching out from ${SITE.name}.`,
  )
  const helpHref = whatsappUrl(`Hi, I need help with ${product.name}. Reaching out from ${SITE.name}.`)

  return (
    <div className="bg-[#f7f8f6]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:py-10">
        <Link to="/products" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>

        <div className="grid items-start gap-8 lg:grid-cols-2">
          <div className="lg:sticky lg:top-28">
            <div className="relative overflow-hidden rounded-3xl bg-white p-3 shadow-sm">
              <img
                src={product.images[img] || product.images[0]}
                alt={`${product.name} view ${img + 1}`}
                className="aspect-square w-full rounded-2xl object-contain bg-neutral-50"
              />
              <span className="absolute left-6 top-6 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow">
                <Star className="h-3 w-3 fill-white" /> New look
              </span>
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {product.images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setImg(i)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white md:h-20 md:w-20 ${
                      img === i ? 'border-emerald-600' : 'border-transparent'
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <span className="inline-flex rounded-md bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-white uppercase">
              {product.category}
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 uppercase">{product.name}</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">{product.shortDescription}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">#Trending</span>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-slate-500">
                ( {(product.reviews || 0).toLocaleString('en-IN')} reviews )
              </span>
            </div>

            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-6 grid grid-cols-3 gap-2">
              {TRUST.map((t) => (
                <div key={t.title} className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-2 py-3 text-center md:px-3">
                  <p className="text-[11px] font-bold text-emerald-800 md:text-sm">{t.title}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500 md:text-xs">{t.sub}</p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <p className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                {formatPiece(perPiece)}
                <span className="ml-2 text-base font-semibold text-slate-500 md:text-lg">per piece (excl. GST)</span>
              </p>
              <p className="mt-1 text-sm text-slate-500">{formatPiece(perPieceGst)} per piece (incl. GST)</p>
            </div>

            <Link to="/sample-kit" className="mt-4 inline-block text-sm font-semibold text-emerald-700 underline underline-offset-2">
              Want a sample kit? Click here to order
            </Link>

            <a
              href={stickerHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-2 text-sm font-medium text-sky-800 hover:text-sky-950"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#25D366] text-white">
                <WhatsAppMark className="h-3.5 w-3.5" />
              </span>
              Custom stickers also available! Contact us on WhatsApp to get it!
            </a>

            <div className="mt-8">
              <p className="text-sm font-bold text-slate-900">Select Size</p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {product.sizes.map((s) => {
                  const active = sizeId === s.id
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSizeId(s.id)}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left ${
                        active ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-bold text-slate-900">{s.label}</span>
                        <span className="block text-xs text-slate-500">{s.dim}</span>
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700">In Stock</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {product.colours?.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-bold text-slate-900">Select Colour</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.colours.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColourId(c.id)}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                        colourId === c.id ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <span className="h-5 w-5 rounded-full border border-slate-200" style={{ background: c.hex }} />
                      {c.label}
                      {colourId === c.id && <Check className="h-3.5 w-3.5 text-emerald-700" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <p className="text-lg font-bold text-slate-900">
                Quantity {inCartSame > 0 ? `(${inCartSame} in cart)` : ''}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {BULK_TIERS.map((t) => {
                  const active = tier.min === t.min
                  const samplePrice = piecePriceExcl(product, size, t.min)
                  const range =
                    t.max === Infinity
                      ? `${t.min.toLocaleString('en-IN')} - ∞`
                      : `${t.min.toLocaleString('en-IN')} - ${t.max.toLocaleString('en-IN')} PCS`
                  return (
                    <button
                      key={t.min}
                      type="button"
                      onClick={() => setQty(t.min)}
                      className={`relative rounded-2xl border bg-white px-3 py-4 text-left transition ${
                        active
                          ? 'border-emerald-500 ring-1 ring-emerald-500'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {active && (
                        <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                      )}
                      <span className={`block pr-6 text-[11px] font-semibold tracking-wide uppercase ${active ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {range}
                      </span>
                      <span className="mt-2 block text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                        {formatPiece(samplePrice)} <span className="text-sm font-semibold text-slate-500">/ pc</span>
                      </span>
                      <span
                        className={`mt-3 inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                          t.off ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {t.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {nextTier && (
              <p className="mt-3 text-sm font-medium text-emerald-600">
                💡 Buy {(nextTier.min - qty).toLocaleString('en-IN')} more units to save {nextTier.off}% instantly!
              </p>
            )}

            <div className="mt-5 flex items-center gap-3">
              <div className="flex items-center rounded-xl border border-slate-200 bg-white">
                <button
                  type="button"
                  className="p-3"
                  onClick={() => setQty((n) => clampQty(n - BULK_QTY_STEP))}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  min={BULK_MIN_QTY}
                  step={BULK_QTY_STEP}
                  value={qty}
                  onChange={(e) => setQty(clampQty(e.target.value))}
                  className="w-24 border-x border-slate-200 py-2.5 text-center text-sm font-semibold outline-none"
                />
                <button
                  type="button"
                  className="p-3"
                  onClick={() => setQty((n) => clampQty(n + BULK_QTY_STEP))}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm text-slate-500">pieces</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-800">
              Line total {formatInr(lineTotal)} <span className="font-normal text-slate-500">(excl. GST)</span>
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <button
                type="button"
                onClick={addToCart}
                className="w-full rounded-xl bg-[#16a34a] py-3.5 text-base font-semibold text-white shadow-sm hover:bg-[#15803d]"
              >
                Add to Cart
              </button>
              <button
                type="button"
                onClick={buyNow}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f172a] py-3.5 text-base font-semibold text-white hover:bg-[#1e293b]"
              >
                <Zap className="h-4 w-4 fill-white" /> Buy Now
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-slate-500">
              *Free Shipping on all orders above Rs.{SITE.freeShippingFrom}*
            </p>
            <p className="text-center text-xs text-slate-500">*Enter your GST details on the Cart Page.*</p>

            <a
              href={helpHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-between rounded-xl bg-sky-50 px-4 py-3 text-sm font-medium text-sky-900 hover:bg-sky-100"
            >
              <span className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white">
                  <WhatsAppMark className="h-4 w-4" />
                </span>
                Need help? Chat with us on WhatsApp
              </span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 rounded-2xl bg-white px-4 py-6 shadow-sm md:grid-cols-4 md:px-8">
          {PERKS.map((p) => (
            <div key={p.title} className="flex items-start gap-3">
              <p.icon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">{p.title}</p>
                <p className="text-xs text-slate-500">{p.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-bold">You may also like</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
