import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Download } from 'lucide-react'
import { formatInr } from '@/data/catalog'
import { adminFetchOrders, downloadCsv, orderShortId } from '@/services/admin'
import { EmptyState, PageHeader, Pagination, SearchField, SkeletonRows, StatusBadge } from '@/components/admin/AdminUi'

const PER_PAGE = 10

export default function AdminOrders() {
  const [params] = useSearchParams()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState(params.get('q') || '')
  const [status, setStatus] = useState('all')
  const [pay, setPay] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    adminFetchOrders().then((data) => {
      setOrders(data)
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return orders.filter((o) => {
      const hay = `${o.email} ${o.shipping_address?.name || ''} ${o.awb || ''} ${o.id}`.toLowerCase()
      const match = !query || hay.includes(query)
      const st = status === 'all' || o.status === status
      const py = pay === 'all' || o.payment_method === pay
      return match && st && py
    })
  }, [orders, q, status, pay])

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, pages)
  const rows = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  function exportCsv() {
    downloadCsv('apna-packaging-orders.csv', [
      ['Order', 'Date', 'Customer', 'Email', 'Phone', 'Total', 'Payment', 'Status', 'AWB'],
      ...filtered.map((o) => [
        orderShortId(o.id),
        o.created_at ? new Date(o.created_at).toLocaleString('en-IN') : '',
        o.shipping_address?.name || '',
        o.email || '',
        o.shipping_address?.phone || '',
        o.total,
        o.payment_method,
        o.status,
        o.awb || '',
      ]),
    ])
  }

  return (
    <div>
      <PageHeader
        eyebrow="Fulfilment"
        title="Orders"
        subtitle="Filter by payment or status, export CSV, then book Shiprocket from the order file."
        actions={
          <button
            type="button"
            onClick={exportCsv}
            disabled={!filtered.length}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <SearchField
          value={q}
          onChange={(v) => {
            setQ(v)
            setPage(1)
          }}
          placeholder="Search name, email, AWB, order id"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="all">All statuses</option>
          {['confirmed', 'packed', 'shipped', 'delivered', 'cancelled'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={pay}
          onChange={(e) => {
            setPay(e.target.value)
            setPage(1)
          }}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="all">All payments</option>
          <option value="razorpay">Razorpay</option>
          <option value="cod">COD</option>
        </select>
      </div>

      {!loading && filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No orders found" hint="Place a checkout on the store, or clear the filters." />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Products</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">AWB</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            {loading ? (
              <SkeletonRows cols={8} />
            ) : (
              <tbody>
                {rows.map((o) => {
                  const items = o.items?.length ? o.items : [{ name: 'Order item', qty: 1, image: '/products/pouch-gold-glossy.png' }]
                  return (
                    <tr key={o.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs font-semibold">#{orderShortId(o.id)}</p>
                        <p className="text-[11px] text-slate-400">
                          {o.created_at ? new Date(o.created_at).toLocaleString('en-IN') : '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          {items.slice(0, 3).map((item, idx) => (
                            <div key={`${o.id}-${item.slug || item.name || idx}`} className="flex items-center gap-2">
                              <img
                                src={item.image || item.images?.[0] || '/products/pouch-gold-glossy.png'}
                                alt={item.name || 'Product'}
                                className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
                              />
                              <div className="min-w-0">
                                <p className="truncate text-xs font-medium text-slate-800">{item.name || 'Product'}</p>
                                <p className="text-[11px] text-slate-500">Qty {item.qty || 1}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {o.shipping_address?.name || o.email}
                        <span className="block text-xs text-slate-400">{o.email}</span>
                      </td>
                      <td className="px-4 py-3 tabular-nums">{formatInr(o.total)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge value={o.payment_method} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge value={o.status} />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{o.awb || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/admin/orders/${o.id}`} className="font-semibold text-emerald-700">
                          Open
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            )}
          </table>
          <Pagination page={safePage} pages={pages} total={filtered.length} onPage={setPage} />
        </div>
      )}
    </div>
  )
}
