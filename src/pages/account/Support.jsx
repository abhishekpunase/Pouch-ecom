import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LifeBuoy, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { fetchOrders } from '@/services/supabase'
import { createSupportTicket, fetchMySupportTickets, SUPPORT_CATEGORIES, SUPPORT_PRIORITIES } from '@/services/support'

const input = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500'

export default function Support() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [tickets, setTickets] = useState([])
  const [filter, setFilter] = useState('All')
  const [form, setForm] = useState({ subject: '', category: SUPPORT_CATEGORIES[0], orderId: '', description: '', priority: 'Normal', attachment: null })
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (!loading && !user) navigate('/sign-in') }, [loading, user, navigate])
  useEffect(() => {
    if (!user || user.id === 'local') return
    Promise.all([fetchOrders(user.id, user.email), fetchMySupportTickets(user.id)]).then(([nextOrders, nextTickets]) => { setOrders(nextOrders); setTickets(nextTickets) }).catch((error) => toast.error(error.message || 'Could not load support'))
  }, [user])

  const visible = useMemo(() => filter === 'All' ? tickets : tickets.filter((ticket) => ticket.status === filter), [filter, tickets])
  if (!user) return null

  async function submit(event) {
    event.preventDefault()
    if (!form.subject.trim() || !form.description.trim()) return toast.error('Subject and description are required')
    setSaving(true)
    try {
      const ticket = await createSupportTicket({ user, ...form, orderId: form.orderId || null })
      setTickets((current) => [ticket, ...current])
      setForm({ subject: '', category: SUPPORT_CATEGORIES[0], orderId: '', description: '', priority: 'Normal', attachment: null })
      toast.success(`Ticket ${ticket.ticket_number} created`)
    } catch (error) { toast.error(error.message || 'Could not create ticket') } finally { setSaving(false) }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold tracking-[0.2em] text-emerald-700 uppercase">Customer care</p><h1 className="mt-1 text-3xl font-bold">Support tickets</h1><p className="mt-1 text-sm text-slate-500">Raise an issue about an order and continue the conversation here.</p></div><Link to="/account" className="text-sm font-semibold text-emerald-700">Back to account</Link></div>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><span className="rounded-xl bg-emerald-50 p-2 text-emerald-700"><LifeBuoy className="h-5 w-5" /></span><div><h2 className="font-bold">Raise Support Ticket</h2><p className="text-xs text-slate-500">Our support team will respond here.</p></div></div>
        <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm md:col-span-2"><span className="mb-1 block font-medium">Subject</span><input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={input} placeholder="What do you need help with?" /></label>
          <label className="text-sm"><span className="mb-1 block font-medium">Category</span><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={input}>{SUPPORT_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-sm"><span className="mb-1 block font-medium">Order</span><select value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} className={input}><option value="">General question</option>{orders.map((order) => <option key={order.id} value={order.id}>#{String(order.id).slice(0, 8)} · ₹{Number(order.total || 0).toLocaleString('en-IN')}</option>)}</select></label>
          <label className="text-sm"><span className="mb-1 block font-medium">Priority</span><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={input}>{SUPPORT_PRIORITIES.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-sm"><span className="mb-1 block font-medium">Attachment</span><input type="file" accept="image/*,.pdf,application/pdf" onChange={(e) => setForm({ ...form, attachment: e.target.files?.[0] || null })} className="w-full text-sm" /></label>
          <label className="text-sm md:col-span-2"><span className="mb-1 block font-medium">Description</span><textarea required rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={input} placeholder="Describe the issue in detail" /></label>
          <div className="flex justify-end md:col-span-2"><button disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><Plus className="h-4 w-4" />{saving ? 'Creating...' : 'Create ticket'}</button></div>
        </form>
      </section>
      <section><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">My Tickets</h2><div className="flex flex-wrap gap-2">{['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter === item ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>{item}</button>)}</div></div>
        <div className="space-y-3">{visible.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No tickets in this view.</p> : visible.map((ticket) => <Link key={ticket.id} to={`/account/support/${ticket.id}`} className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-300"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-xs font-bold text-emerald-700">{ticket.ticket_number}</p><h3 className="mt-1 font-semibold">{ticket.subject}</h3><p className="mt-1 text-xs text-slate-500">{ticket.category} {ticket.order_id ? `· Order #${String(ticket.order_id).slice(0, 8)}` : '· General'}</p></div><div className="text-right"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">{ticket.status}</span><p className="mt-2 text-xs text-slate-400">Updated {new Date(ticket.updated_at).toLocaleString('en-IN')}</p></div></div></Link>)}</div>
      </section>
    </div>
  )
}
