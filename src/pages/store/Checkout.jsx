import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { GST_RATE, SITE, formatInr } from '@/data/catalog'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { placeOrder } from '@/services/supabase'
import {
  cartWeight,
  createRazorpayOrder,
  applyCoupon,
  fetchShipRates,
  loadRazorpayScript,
  verifyRazorpayPayment,
  sendOrderEmail,
} from '@/services/api'

export default function Checkout() {
  const { items, subtotal, shipping, quote, setShippingQuote, clear } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [placing, setPlacing] = useState(false)
  const [payError, setPayError] = useState('')
  const [rates, setRates] = useState([])
  const [ratesMeta, setRatesMeta] = useState(null)
  const [loadingRates, setLoadingRates] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const meta = user?.user_metadata || {}
  const saved = (meta.addresses || []).find((a) => a.isDefault) || meta.addresses?.[0]
  const [form, setForm] = useState({
    name: saved?.name || meta.full_name || '',
    email: user?.email || '',
    phone: saved?.phone || meta.phone || '',
    address: saved?.address || '',
    city: saved?.city || '',
    pincode: saved?.pincode || '',
    state: saved?.state || '',
    gstin: localStorage.getItem('pi-gstin') || '',
    payment: 'razorpay',
  })

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  useEffect(() => {
    const pin = form.pincode.trim()
    if (!/^\d{6}$/.test(pin)) {
      setRates([])
      return
    }
    let cancelled = false
    setLoadingRates(true)
    fetchShipRates({
      pincode: pin,
      weight: cartWeight(items),
      cod: form.payment === 'cod',
    })
      .then((data) => {
        if (cancelled) return
        setRates(data.rates || [])
        setRatesMeta(data)
        if (data.rates?.[0]) setShippingQuote(data.rates[0])
      })
      .catch((err) => {
        if (!cancelled) toast.error(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoadingRates(false)
      })
    return () => {
      cancelled = true
    }
  }, [form.pincode, form.payment, items])

  // Opens the Razorpay popup. Resolves ONLY when Razorpay reports a successful payment.
  // Rejects with a readable message if the user closes the popup or every attempt fails.
  function openRazorpay(order) {
    return new Promise((resolve, reject) => {
      let lastFailure = ''
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: SITE.name,
        description: 'Packaging order',
        order_id: order.id,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        notes: { pincode: form.pincode },
        theme: { color: '#16a34a' },
        handler(response) {
          resolve(response)
        },
        modal: {
          confirm_close: true,
          ondismiss() {
            reject(new Error(lastFailure || 'Payment cancelled. You have not been charged.'))
          },
        },
      })
      // A failed attempt keeps the popup open so the customer can retry with another method.
      rzp.on('payment.failed', (resp) => {
        lastFailure = resp?.error?.description || 'Payment failed. Please try another method.'
        toast.error(lastFailure)
      })
      rzp.open()
    })
  }

  async function payWithRazorpay(amount) {
    const loaded = await loadRazorpayScript()
    if (!loaded || !window.Razorpay) {
      throw new Error('Could not load Razorpay. Check your internet connection and try again.')
    }
    const order = await createRazorpayOrder(amount, `pi_${Date.now()}`)
    const response = await openRazorpay(order)
    // Never trust the popup alone: the server checks signature + payment status with Razorpay.
    const check = await verifyRazorpayPayment({
      razorpay_order_id: response.razorpay_order_id || order.id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    })
    return { ...response, razorpay_order_id: response.razorpay_order_id || order.id, method: check.method }
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (!items.length || placing) return
    setPlacing(true)
    setPayError('')
    try {
      let payment = {
        payment_method: 'cod',
        payment_status: 'cod',
        status: 'confirmed',
      }
      if (form.payment === 'razorpay' && totalAmount > 0) {
        const rz = await payWithRazorpay(totalAmount)
        payment = {
          payment_method: 'razorpay',
          payment_status: 'paid',
          status: 'confirmed',
          razorpay_order_id: rz.razorpay_order_id,
          razorpay_payment_id: rz.razorpay_payment_id,
        }
      } else if (form.payment === 'razorpay') {
        payment = { payment_method: 'free', payment_status: 'paid', status: 'confirmed' }
      }
      const order = await placeOrder({
        user_id: user?.id && user.id !== 'local' ? user.id : null,
        email: form.email,
        items,
        subtotal,
        discount,
        coupon_code: coupon?.code || null,
        gst: discountedGst,
        shipping,
        total: totalAmount,
        courier_name: quote?.courier_name,
        courier_company_id: quote?.courier_company_id,
        weight: cartWeight(items),
        shipping_address: {
          name: form.name,
          phone: form.phone,
          address: form.address,
          city: form.city,
          pincode: form.pincode,
          state: form.state,
          gstin: form.gstin,
        },
        ...payment,
      })
      sendOrderEmail(order).catch(() => {})
      clear()
      navigate('/order-success', { replace: true, state: { order } })
    } catch (err) {
      const msg = err.message || 'Checkout failed'
      setPayError(msg)
      toast.error(msg)
    } finally {
      setPlacing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Nothing to checkout</h1>
        <Link to="/products" className="mt-4 inline-block text-emerald-700">
          Continue shopping
        </Link>
      </div>
    )
  }

  const discount = Math.min(subtotal, Number(coupon?.discount || 0))
  const discountedSubtotal = Math.max(0, subtotal - discount)
  const discountedGst = Math.round(discountedSubtotal * GST_RATE)
  const totalAmount = discountedSubtotal + discountedGst + shipping
  const freeShip = subtotal >= SITE.freeShippingFrom || subtotal === 0

  async function onApplyCoupon(event) {
    event.preventDefault()
    setCouponError('')
    setCoupon(null)
    try {
      const result = await applyCoupon(couponCode, subtotal)
      setCoupon(result)
      toast.success(`Coupon applied: ${formatInr(result.discount)} off`)
    } catch (error) {
      setCouponError(error.message || 'Could not apply coupon')
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 rounded-[2rem] bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="font-bold">Shipping details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input required placeholder="Full name" value={form.name} onChange={(e) => set('name', e.target.value)} className="rounded-xl border px-4 py-2.5" />
            <input required type="email" placeholder="Email" value={form.email} onChange={(e) => set('email', e.target.value)} className="rounded-xl border px-4 py-2.5" />
            <input required placeholder="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} className="rounded-xl border px-4 py-2.5" />
            <input required placeholder="Pincode" maxLength={6} value={form.pincode} onChange={(e) => set('pincode', e.target.value.replace(/\D/g, ''))} className="rounded-xl border px-4 py-2.5" />
          </div>
          <input required placeholder="Address" value={form.address} onChange={(e) => set('address', e.target.value)} className="w-full rounded-xl border px-4 py-2.5" />
          <div className="grid gap-4 md:grid-cols-2">
            <input required placeholder="City" value={form.city} onChange={(e) => set('city', e.target.value)} className="rounded-xl border px-4 py-2.5" />
            <input required placeholder="State" value={form.state} onChange={(e) => set('state', e.target.value)} className="rounded-xl border px-4 py-2.5" />
          </div>
          <input
            placeholder="GSTIN (optional — for business invoice)"
            value={form.gstin}
            onChange={(e) => set('gstin', e.target.value.toUpperCase())}
            className="w-full rounded-xl border px-4 py-2.5"
          />

          <h2 className="pt-2 font-bold">Shiprocket courier</h2>
          {loadingRates && <p className="text-sm text-slate-500">Checking serviceability…</p>}
          {ratesMeta?.demo && (
            <p className="text-xs text-amber-700">Demo Shiprocket rates — add SHIPROCKET_EMAIL in .env for live couriers.</p>
          )}
          {freeShip ? (
            <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">Free shipping on this order.</p>
          ) : rates.length === 0 && /^\d{6}$/.test(form.pincode) && !loadingRates ? (
            <p className="text-sm text-slate-500">No couriers found for this pincode.</p>
          ) : (
            <div className="space-y-2">
              {rates.map((r) => (
                <label key={r.courier_company_id} className="flex cursor-pointer items-center justify-between rounded-xl border p-3">
                  <span className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="courier"
                      checked={quote?.courier_company_id === r.courier_company_id}
                      onChange={() => setShippingQuote(r)}
                    />
                    {r.courier_name}
                    <span className="text-xs text-slate-400">{r.etd}</span>
                  </span>
                  <span className="text-sm font-semibold">{formatInr(r.rate)}</span>
                </label>
              ))}
            </div>
          )}

          <h2 className="pt-2 font-bold">Payment</h2>
          <label className="flex items-center gap-2 rounded-xl border p-3">
            <input type="radio" name="pay" checked={form.payment === 'razorpay'} onChange={() => set('payment', 'razorpay')} />
            Pay online with Razorpay (UPI / card / netbanking)
          </label>
          <label className="flex items-center gap-2 rounded-xl border p-3">
            <input type="radio" name="pay" checked={form.payment === 'cod'} onChange={() => set('payment', 'cod')} />
            Cash on Delivery
          </label>
        </div>
        <aside className="h-fit rounded-[2rem] bg-white p-6 shadow-sm">
          <h2 className="font-bold">Order</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((i) => (
              <li key={i.key} className="flex justify-between gap-2">
                <span>
                  {i.name} × {i.qty}
                  <span className="block text-xs text-slate-500">
                    {i.isSample ? i.packLabel : `${i.sizeLabel} · ${i.colourLabel}`}
                  </span>
                </span>
                <span>{i.price === 0 ? 'Free' : formatInr(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatInr(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span>{discountedGst ? formatInr(discountedGst) : '—'}</span>
            </div>
            {coupon && (
              <div className="flex justify-between text-emerald-700">
                <span>Coupon ({coupon.code})</span>
                <span>-{formatInr(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatInr(shipping)}</span>
            </div>
          </div>
          <form onSubmit={onApplyCoupon} className="mt-4 flex gap-2">
            <input
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
              placeholder="Coupon code"
              className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm uppercase"
              aria-label="Coupon code"
            />
            <button type="submit" disabled={!couponCode.trim()} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50">
              Apply
            </button>
          </form>
          {couponError && <p className="mt-2 text-xs text-rose-600">{couponError}</p>}
          <div className="mt-3 flex justify-between border-t pt-3 font-bold">
            <span>Total</span>
            <span>{totalAmount === 0 ? 'Free' : formatInr(totalAmount)}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Shipping: {shipping === 0 ? 'Free' : formatInr(shipping)}
            {quote?.courier_name ? ` · ${quote.courier_name}` : ''}
          </p>
          {payError && (
            <div role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <p className="font-semibold">Payment not completed</p>
              <p className="mt-0.5">{payError}</p>
              <p className="mt-1 text-xs text-red-600">Your cart is safe. Press the button below to try again.</p>
            </div>
          )}
          <button type="submit" disabled={placing} className="gradient-btn mt-6 w-full rounded-full py-3 text-sm font-semibold text-white disabled:opacity-60">
            {placing ? 'Processing…' : payError && form.payment === 'razorpay' ? 'Retry payment' : form.payment === 'razorpay' && totalAmount > 0 ? 'Pay with Razorpay' : 'Place order'}
          </button>
        </aside>
      </form>
    </div>
  )
}
