import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Printer, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { formatInr, SITE } from '@/data/catalog'
import { adminFetchOrders, adminUpdateOrder, orderShortId } from '@/services/admin'
import { createShipment } from '@/services/api'
import { fieldClass, PageHeader, SectionCard, StatusBadge } from '@/components/admin/AdminUi'

const FLOW = ['confirmed', 'packed', 'shipped', 'delivered', 'cancelled']

export default function AdminOrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [busy, setBusy] = useState(false)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminFetchOrders().then((list) => {
      const found = list.find((o) => String(o.id) === String(id)) || null
      setOrder(found)
      setNotes(found?.notes || '')
      setLoading(false)
    })
  }, [id])

  async function setStatus(status) {
    const next = await adminUpdateOrder(order.id, { status })
    setOrder(next)
    toast.success('Status updated')
  }

  async function saveNotes() {
    const next = await adminUpdateOrder(order.id, { notes })
    setOrder(next)
    toast.success('Note saved')
  }

  async function ship() {
    setBusy(true)
    try {
      const result = await createShipment(order)
      const next = await adminUpdateOrder(order.id, {
        status: 'shipped',
        awb: result.awb,
        shipment_id: result.shipment_id,
        shiprocket_order_id: result.shiprocket_order_id,
        courier: result.courier,
        tracking_url: result.tracking_url,
        shiprocket_demo: result.demo,
      })
      setOrder(next)
      toast.success(result.demo ? 'Demo Shiprocket AWB created' : 'Shipment created on Shiprocket')
    } catch (err) {
      toast.error(err.message || 'Shiprocket failed')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading order…</p>
  if (!order) {
    return (
      <p className="text-slate-500">
        Order not found.{' '}
        <Link to="/admin/orders" className="text-emerald-700">
          Back
        </Link>
      </p>
    )
  }

  const addr = order.shipping_address || {}

  return (
    <div className="max-w-5xl">
      <PageHeader
        eyebrow="Fulfilment"
        title={`Order #${orderShortId(order.id)}`}
        subtitle={order.created_at ? new Date(order.created_at).toLocaleString('en-IN') : ''}
        actions={
          <div className="flex gap-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold"
            >
              <Printer className="h-4 w-4" /> Print invoice
            </button>
            <Link to="/admin/orders" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium">
              All orders
            </Link>
          </div>
        }
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <SectionCard title="Invoice">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-lg font-bold">{SITE.name}</p>
                <p className="text-xs text-slate-500">{SITE.address}</p>
                <p className="text-xs text-slate-500">GST {SITE.gst}</p>
              </div>
              <div className="text-right text-sm">
                <StatusBadge value={order.status} />
                <p className="mt-2 font-mono text-xs text-slate-400">#{orderShortId(order.id)}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Bill to</p>
                <p className="mt-1 font-semibold">{addr.name}</p>
                <p className="text-slate-600">{order.email}</p>
                <p className="text-slate-600">{addr.phone}</p>
                <p className="mt-1 text-slate-600">
                  {addr.address}, {addr.city}, {addr.state} — {addr.pincode}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Payment</p>
                <p className="mt-1 capitalize">{order.payment_method}</p>
                <p className="text-slate-600">{order.payment_status || '—'}</p>
                {order.razorpay_payment_id && <p className="break-all font-mono text-[11px] text-slate-400">{order.razorpay_payment_id}</p>}
              </div>
            </div>
            <table className="mt-5 w-full text-left text-sm">
              <thead className="border-y border-slate-100 text-xs text-slate-400 uppercase">
                <tr>
                  <th className="py-2 font-medium">Item</th>
                  <th className="py-2 font-medium">Qty</th>
                  <th className="py-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((i) => (
                  <tr key={i.key || i.slug} className="border-b border-slate-50">
                    <td className="py-2">
                      {i.name}
                      <span className="block text-[11px] text-slate-400">
                        {[i.sizeLabel, i.colourLabel, i.packLabel].filter(Boolean).join(' · ')}
                      </span>
                    </td>
                    <td className="py-2">{i.qty}</td>
                    <td className="py-2 text-right">{i.price === 0 ? 'Free' : formatInr(i.price * i.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
              <p className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatInr(order.subtotal)}</span>
              </p>
              <p className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span>{Number(order.shipping) === 0 ? 'Free' : formatInr(order.shipping)}</span>
              </p>
              <p className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{formatInr(order.total)}</span>
              </p>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-5 print:hidden">
          <SectionCard title="Status">
            <div className="flex flex-wrap gap-2">
              {FLOW.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    order.status === s ? 'bg-emerald-600 text-white' : 'border border-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Shiprocket">
            <p className="text-sm">
              Courier: <strong>{order.courier || order.courier_name || '—'}</strong>
            </p>
            <p className="text-sm">
              AWB: <strong className="font-mono">{order.awb || 'Not created'}</strong>
            </p>
            {order.tracking_url && (
              <a href={order.tracking_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-emerald-700 underline">
                Track shipment
              </a>
            )}
            <button
              type="button"
              disabled={busy || Boolean(order.awb) || order.status === 'cancelled'}
              onClick={ship}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Truck className="h-4 w-4" />
              {order.awb ? 'Already shipped' : busy ? 'Creating…' : 'Create shipment'}
            </button>
          </SectionCard>

          <SectionCard title="Internal note">
            <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} className={fieldClass} placeholder="Packing instructions, COD remarks…" />
            <button type="button" onClick={saveNotes} className="mt-3 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold">
              Save note
            </button>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
