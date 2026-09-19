import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { formatInr, formatPiece, SITE } from '@/data/catalog'
import { useCart } from '@/context/CartContext'

const GSTIN_KEY = 'pi-gstin'

export default function Cart() {
  const { items, subtotal, gst, shipping, total, updateQty, remove } = useCart()
  const [gstin, setGstin] = useState(() => localStorage.getItem(GSTIN_KEY) || '')

  useEffect(() => {
    localStorage.setItem(GSTIN_KEY, gstin)
  }, [gstin])

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-slate-500">Add pouches, boxes or labels to get started.</p>
        <Link to="/products" className="mt-6 inline-flex rounded-full bg-[#16a34a] px-8 py-3 text-sm font-semibold text-white">
          Shop products
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">Cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => {
            const step = item.packId === 'pcs' ? 100 : 1
            return (
              <div key={item.key} className="flex gap-4 rounded-[1.5rem] bg-white p-4 shadow-sm">
                <img src={item.image} alt="" className="h-24 w-24 rounded-xl object-cover" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    to={item.isSample ? '/sample-kit' : `/products/${item.slug}`}
                    className="font-semibold hover:text-emerald-700"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sm text-slate-500">
                    {item.isSample
                      ? 'Assorted pouch samples · Limit 1 per customer'
                      : `Size: ${item.sizeLabel} · Colour: ${item.colourLabel}`}
                  </p>
                  <p className="mt-1 font-semibold">
                    {item.price === 0
                      ? 'Free'
                      : item.packId === 'pcs'
                        ? `${formatPiece(item.price)} / pc`
                        : formatInr(item.price)}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-3">
                    {item.isSample ? (
                      <span className="text-xs text-slate-500">Qty 1</span>
                    ) : (
                      <div className="flex items-center rounded-full border">
                        <button type="button" className="p-1.5" onClick={() => updateQty(item.key, item.qty - step)}>
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-10 px-1 text-center text-sm">{item.qty}</span>
                        <button type="button" className="p-1.5" onClick={() => updateQty(item.key, item.qty + step)}>
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <button type="button" onClick={() => remove(item.key)} className="text-slate-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
          <div className="rounded-[1.5rem] bg-white p-4 shadow-sm">
            <label className="text-sm font-semibold">GSTIN (optional)</label>
            <input
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="Enter GST details for business invoice"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
            />
            <p className="mt-2 text-xs text-slate-500">*Enter your GST details on the Cart Page for a GST invoice.</p>
          </div>
        </div>
        <aside className="h-fit rounded-[2rem] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal (excl. GST)</span>
              <span>{subtotal === 0 ? 'Free' : formatInr(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span>{gst === 0 ? '—' : formatInr(gst)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatInr(shipping)}</span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-emerald-700">
                Add {formatInr(SITE.freeShippingFrom - subtotal)} more for free shipping.
              </p>
            )}
            <div className="flex justify-between border-t pt-3 text-base font-bold">
              <span>Total</span>
              <span>{total === 0 ? 'Free' : formatInr(total)}</span>
            </div>
          </div>
          <Link to="/checkout" className="mt-6 block rounded-full bg-[#16a34a] py-3 text-center text-sm font-semibold text-white">
            Checkout
          </Link>
        </aside>
      </div>
    </div>
  )
}
