import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatInr } from '@/data/catalog'
import { adminFetchOrders, deriveCustomers, downloadCsv, orderShortId } from '@/services/admin'
import { EmptyState, PageHeader, Pagination, SearchField } from '@/components/admin/AdminUi'

const PER_PAGE = 10

export default function AdminCustomers() {
  const [orders, setOrders] = useState([])
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [selectedEmail, setSelectedEmail] = useState('')

  useEffect(() => {
    adminFetchOrders().then(setOrders)
  }, [])

  const customers = useMemo(() => deriveCustomers(orders), [orders])
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return customers.filter((c) => `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(query))
  }, [customers, q])

  useEffect(() => {
    if (!filtered.length) {
      setSelectedEmail('')
      return
    }
    setSelectedEmail((current) => (filtered.some((c) => c.email === current) ? current : filtered[0].email))
  }, [filtered])

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, pages)
  const rows = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)
  const selectedCustomer = filtered.find((c) => c.email === selectedEmail) || filtered[0] || null
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return []
    return (orders || [])
      .filter((order) => String(order.email || '').trim().toLowerCase() === selectedCustomer.email)
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  }, [orders, selectedCustomer])

  return (
    <div>
      <PageHeader
        eyebrow="CRM"
        title="Customers"
        subtitle="Built from checkout emails — spend, order count and last purchase."
        actions={
          <button
            type="button"
            disabled={!filtered.length}
            onClick={() =>
              downloadCsv('apna-packaging-customers.csv', [
                ['Name', 'Email', 'Phone', 'Orders', 'Spend', 'Last order'],
                ...filtered.map((c) => [c.name, c.email, c.phone, c.orders, c.spend, c.last ? new Date(c.last).toLocaleString('en-IN') : '']),
              ])
            }
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40"
          >
            Export CSV
          </button>
        }
      />
      <div className="mt-6">
        <SearchField
          value={q}
          onChange={(v) => {
            setQ(v)
            setPage(1)
          }}
          placeholder="Search customers"
        />
      </div>
      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No customers yet" hint="Customers appear after the first paid or COD order." />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Orders</th>
                  <th className="px-4 py-3 font-medium">Spend</th>
                  <th className="px-4 py-3 font-medium">Last order</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr
                    key={c.email}
                    className={`cursor-pointer border-b border-slate-100 last:border-0 transition ${selectedCustomer?.email === c.email ? 'bg-emerald-50/60' : 'hover:bg-slate-50'}`}
                    onClick={() => setSelectedEmail(c.email)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold">{c.name || '—'}</p>
                      <p className="text-xs text-slate-400">{c.email}</p>
                      <p className="text-xs text-slate-400">{c.phone}</p>
                    </td>
                    <td className="px-4 py-3">{c.orders}</td>
                    <td className="px-4 py-3 tabular-nums">{formatInr(c.spend)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {c.last ? new Date(c.last).toLocaleString('en-IN') : '—'}
                      <div>
                        <Link to={`/admin/orders?q=${encodeURIComponent(c.email)}`} className="text-emerald-700" onClick={(e) => e.stopPropagation()}>
                          View orders
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={safePage} pages={pages} total={filtered.length} onPage={setPage} />
          </div>

          {selectedCustomer && (
            <aside className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-700 uppercase">Customer info</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">{selectedCustomer.name || 'Unnamed customer'}</h2>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">Email</p>
                  <p>{selectedCustomer.email}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">Phone</p>
                  <p>{selectedCustomer.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">Address</p>
                  <p>
                    {selectedCustomer.address || 'No address saved'}
                    {selectedCustomer.city || selectedCustomer.state || selectedCustomer.pincode ? (
                      <>
                        <br />
                        {[selectedCustomer.city, selectedCustomer.state].filter(Boolean).join(', ')}
                        {selectedCustomer.pincode ? ` - ${selectedCustomer.pincode}` : ''}
                      </>
                    ) : null}
                  </p>
                </div>
                {selectedCustomer.gstin && (
                  <div>
                    <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">GSTIN</p>
                    <p>{selectedCustomer.gstin}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Total orders</span>
                  <strong>{selectedCustomer.orders}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Total spend</span>
                  <strong>{formatInr(selectedCustomer.spend)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Last order</span>
                  <strong className="text-right">
                    {selectedCustomer.last ? new Date(selectedCustomer.last).toLocaleDateString('en-IN') : '—'}
                  </strong>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">Ordered products</p>
                <div className="mt-3 space-y-3">
                  {customerOrders.length === 0 ? (
                    <p className="text-sm text-slate-500">No orders found for this customer.</p>
                  ) : (
                    customerOrders.slice(0, 4).map((order) => (
                      <div key={order.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <Link to={`/admin/orders/${order.id}`} className="text-sm font-semibold text-emerald-700">
                            Order #{orderShortId(order.id)}
                          </Link>
                          <span className="text-xs font-medium text-slate-500">{formatInr(order.total || 0)}</span>
                        </div>
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-600">
                          {(order.items || []).length === 0 ? (
                            <li>No item details saved</li>
                          ) : (
                            (order.items || []).slice(0, 4).map((item, index) => (
                              <li key={`${order.id}-${item.slug || item.name || index}`}>
                                {item.name}
                                {item.qty > 1 ? ` × ${item.qty}` : ''}
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Link
                to={`/admin/orders?q=${encodeURIComponent(selectedCustomer.email)}`}
                className="mt-5 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                View all orders
              </Link>
            </aside>
          )}
        </div>
      )}
    </div>
  )
}
