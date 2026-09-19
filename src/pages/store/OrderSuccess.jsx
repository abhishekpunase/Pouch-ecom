import { CheckCircle2 } from 'lucide-react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { formatInr } from '@/data/catalog'

export default function OrderSuccess() {
  const order = useLocation().state?.order
  if (!order) return <Navigate to="/" replace />

  const paid = order.payment_status === 'paid'
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-16 text-center">
      <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" />
      <h1 className="mt-4 text-3xl font-bold">{paid ? 'Payment successful' : 'Order placed'}</h1>
      <p className="mt-2 text-slate-600">
        {paid
          ? 'Thank you! We have received your payment and are preparing your order.'
          : 'Thank you! Please keep the amount ready for Cash on Delivery.'}
      </p>
      <div className="mt-8 space-y-2 rounded-[1.5rem] bg-white p-6 text-left text-sm shadow-sm">
        <Row label="Order ID" value={order.id} />
        <Row label="Amount" value={formatInr(order.total)} />
        <Row label="Payment" value={paid ? `Paid online (${order.razorpay_payment_id})` : 'Cash on Delivery'} />
        <Row label="Confirmation sent to" value={order.email} />
      </div>
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/account" className="rounded-full border px-6 py-2.5 text-sm font-semibold">
          View my orders
        </Link>
        <Link to="/products" className="gradient-btn rounded-full px-6 py-2.5 text-sm font-semibold text-white">
          Continue shopping
        </Link>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="break-all text-right font-medium">{value}</span>
    </div>
  )
}
