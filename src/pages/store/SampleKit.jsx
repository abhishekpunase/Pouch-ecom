import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Lock,
  Package,
  Star,
  Truck,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatInr, formatPiece, SITE, withGst } from '@/data/catalog'
import { whatsappUrl } from '@/utils/whatsapp'
import { useCart } from '@/context/CartContext'

const FEATURES = [
  'Food Grade',
  'Heat Sealable',
  'Leak Proof',
  'High Barrier',
  'Airtight Zipper',
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

function whatsappHref() {
  return whatsappUrl(`Hi, reaching out from ${SITE.name}. I want to order the Sample Kit.`)
}

export default function SampleKit() {
  const { items, addItem } = useCart()
  const navigate = useNavigate()

  const kitPrice = 99

  const payload = {
    productId: 'sample-kit',
    slug: 'sample-kit',
    name: 'Sample Kit',
    image: '/products/pouch-sample-kit.png',
    sizeId: 'kit',
    sizeLabel: 'Assorted samples',
    colourId: 'mixed',
    colourLabel: 'All colours',
    packId: '1',
    pieces: 1,
    packLabel: '1 kit',
    price: kitPrice,
    qty: 1,
    isSample: true,
  }

  const alreadyInCart = items.some((i) => i.productId === 'sample-kit')

  function addToCart() {
    const ok = addItem(payload)
    if (ok === false) {
      toast.error('Limit 1 sample kit per customer')
      return
    }
    toast.success('Sample Kit added to cart')
  }

  function buyNow() {
    const ok = addItem(payload)
    if (ok === false && !alreadyInCart) {
      toast.error('Limit 1 sample kit per customer')
      return
    }
    navigate('/checkout')
  }

  return (
    <div className="bg-[#f7f8f6]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:py-10">
        <Link to="/products" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>

        <div className="grid items-start gap-8 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl bg-white p-3 shadow-sm">
            <img
              src="/products/pouch-sample-kit.png"
              alt="Sample Kit — all pouch types and colours"
              className="aspect-square w-full rounded-2xl object-cover"
            />
            <span className="absolute left-6 top-6 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow">
              <Star className="h-3 w-3 fill-white" /> New look
            </span>
          </div>

          <div>
            <span className="inline-flex rounded-md bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-white uppercase">
              General
            </span>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">Sample Kit</h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">
              Explore our complete range of high-quality stand-up pouches designed for food, dry fruits, spices, tea,
              coffee, pulses, pet food, and retail packaging applications.
            </p>
            <div className="mt-3 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-sm text-slate-500">(1,783 reviews)</span>
            </div>

            <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2.5">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-6 grid grid-cols-3 gap-2">
              {TRUST.map((t) => (
                <div key={t.title} className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-3 text-center">
                  <p className="text-xs font-bold text-emerald-800 md:text-sm">{t.title}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500 md:text-xs">{t.sub}</p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <p className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                {formatInr(kitPrice)}
                <span className="ml-2 text-base font-semibold text-slate-500">per kit (excl. GST)</span>
              </p>
              <p className="mt-1 text-sm text-slate-500">{formatPiece(withGst(kitPrice))} per kit (incl. GST)</p>
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
              <p className="text-xs font-bold tracking-wider text-emerald-800 uppercase">
                What&apos;s included in the sample kit
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  All types and colour pouches
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  You can add a note or inform over WhatsApp for size specific samples.
                </li>
              </ul>
              <p className="mt-3 text-xs text-slate-500">* Limit 1 sample kit per business/customer.</p>
            </div>

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
                className="w-full rounded-xl bg-[#0f172a] py-3.5 text-base font-semibold text-white hover:bg-[#1e293b]"
              >
                Buy Now
              </button>
            </div>

            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-between rounded-xl bg-sky-50 px-4 py-3 text-sm font-medium text-sky-900 hover:bg-sky-100"
            >
              <span className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
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
      </div>
    </div>
  )
}
