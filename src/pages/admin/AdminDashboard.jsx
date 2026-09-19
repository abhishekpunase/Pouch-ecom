import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, IndianRupee, Package, Truck, Users } from 'lucide-react'
import { formatInr } from '@/data/catalog'
import { adminFetchMessages, adminFetchOrders, adminFetchProducts, orderShortId, unreadMessageCount } from '@/services/admin'
import { apiHealth } from '@/services/api'
import { PageHeader, SectionCard, StatusBadge } from '@/components/admin/AdminUi'

function last7Days(orders) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - (6 - i))
    const start = d.getTime()
    const dayOrders = orders.filter((o) => {
      const t = new Date(o.created_at || 0)
      t.setHours(0, 0, 0, 0)
      return t.getTime() === start && o.status !== 'cancelled'
    })
    return {
      label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      total: dayOrders.reduce((n, o) => n + Number(o.total || 0), 0),
      count: dayOrders.length,
    }
  })
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [messages, setMessages] = useState([])
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminFetchOrders(), adminFetchProducts(), adminFetchMessages(), apiHealth()]).then(
      ([o, p, m, h]) => {
        setOrders(o)
        setProducts(p)
        setMessages(m)
        setHealth(h)
        setLoading(false)
      },
    )
  }, [])

  const stats = useMemo(() => {
    const active = orders.filter((o) => o.status !== 'cancelled')
    const revenue = active.reduce((n, o) => n + Number(o.total || 0), 0)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const today = active.filter((o) => new Date(o.created_at) >= todayStart)
    const pendingShip = orders.filter((o) => !o.awb && o.status !== 'cancelled' && o.status !== 'delivered').length
    const out = products.filter((p) => p.inStock === false).length
    const razorpay = orders.filter((o) => o.payment_method === 'razorpay').length
    const cod = orders.filter((o) => o.payment_method === 'cod').length
    return {
      revenue,
      todayRev: today.reduce((n, o) => n + Number(o.total || 0), 0),
      todayCount: today.length,
      pendingShip,
      skus: products.length,
      out,
      razorpay,
      cod,
      unread: unreadMessageCount(messages),
    }
  }, [orders, products, messages])

  const series = last7Days(orders)
  const max = Math.max(1, ...series.map((d) => d.total))

  const kpis = [
    { label: 'Gross revenue', value: formatInr(stats.revenue), hint: `${formatInr(stats.todayRev)} today`, icon: IndianRupee },
    { label: 'Orders', value: orders.length, hint: `${stats.todayCount} today`, icon: Package },
    { label: 'Awaiting AWB', value: stats.pendingShip, hint: 'Shiprocket pending', icon: Truck },
    { label: 'Catalogue', value: stats.skus, hint: stats.out ? `${stats.out} out of stock` : 'All in stock', icon: Users },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        subtitle="Live snapshot of store revenue, fulfilment and catalogue health."
        actions={
          <Link to="/admin/orders" className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Fulfil orders <ArrowUpRight className="h-4 w-4" />
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">{k.label}</p>
              <span className="rounded-lg bg-emerald-50 p-1.5 text-emerald-700">
                <k.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold tabular-nums">{loading ? '—' : k.value}</p>
            <p className="mt-1 text-xs text-slate-500">{k.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard title="Revenue · last 7 days" hint="Cancelled orders excluded" className="">
          <div className="flex h-40 items-end gap-2">
            {series.map((d) => (
              <div key={d.label} className="flex flex-1 flex-col items-center justify-end gap-2">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-emerald-700 to-emerald-400"
                  style={{ height: `${Math.max(6, (d.total / max) * 100)}%` }}
                  title={formatInr(d.total)}
                />
                <span className="text-[10px] font-medium text-slate-400">{d.label}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Integrations">
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
              <span>API server</span>
              <StatusBadge value={health?.ok ? 'online' : 'offline'} />
            </li>
            <li className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
              <span>Razorpay</span>
              <span className="text-xs font-semibold">{health?.razorpay ? 'Live keys' : 'Demo mode'}</span>
            </li>
            <li className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
              <span>Shiprocket</span>
              <span className="text-xs font-semibold">{health?.shiprocket ? 'Connected' : 'Demo rates'}</span>
            </li>
            <li className="text-xs text-slate-400">Pickup PIN {health?.pickupPincode || '110020'}</li>
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            Payments: {stats.razorpay} Razorpay · {stats.cod} COD
            {stats.unread ? ` · ${stats.unread} unread messages` : ''}
          </p>
        </SectionCard>

        <SectionCard
          title="Needs attention"
          actions={
            <Link to="/admin/orders" className="text-xs font-semibold text-emerald-700">
              View all
            </Link>
          }
        >
          {stats.pendingShip === 0 && stats.out === 0 && stats.unread === 0 ? (
            <p className="text-sm text-slate-500">Queue is clear. No open shipments or stock alerts.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {stats.pendingShip > 0 && (
                <li className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-amber-900">
                  {stats.pendingShip} order{stats.pendingShip === 1 ? '' : 's'} waiting for Shiprocket AWB
                </li>
              )}
              {stats.out > 0 && (
                <li className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-rose-900">
                  {stats.out} SKU{stats.out === 1 ? '' : 's'} marked out of stock
                </li>
              )}
              {stats.unread > 0 && (
                <li className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-sky-900">
                  {stats.unread} unread contact message{stats.unread === 1 ? '' : 's'}
                </li>
              )}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Latest orders">
        {orders.length === 0 ? (
          <p className="text-sm text-slate-500">No orders yet. They appear here after checkout.</p>
        ) : (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs tracking-wide text-slate-400 uppercase">
                <tr>
                  <th className="px-2 py-2 font-medium">Order</th>
                  <th className="px-2 py-2 font-medium">Customer</th>
                  <th className="px-2 py-2 font-medium">Total</th>
                  <th className="px-2 py-2 font-medium">Payment</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map((o) => (
                  <tr key={o.id} className="border-t border-slate-100">
                    <td className="px-2 py-3">
                      <Link to={`/admin/orders/${o.id}`} className="font-mono text-xs font-semibold text-emerald-800">
                        #{orderShortId(o.id)}
                      </Link>
                    </td>
                    <td className="px-2 py-3">{o.shipping_address?.name || o.email}</td>
                    <td className="px-2 py-3 tabular-nums">{formatInr(o.total)}</td>
                    <td className="px-2 py-3">
                      <StatusBadge value={o.payment_method} />
                    </td>
                    <td className="px-2 py-3">
                      <StatusBadge value={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
