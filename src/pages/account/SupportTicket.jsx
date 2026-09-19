import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Send } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { fetchMySupportTicket, sendSupportMessage, createSupportSignedUrl } from '@/services/support'

export default function SupportTicket() {
  const { id } = useParams()
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [message, setMessage] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [sending, setSending] = useState(false)
  useEffect(() => { if (!loading && !user) navigate('/sign-in') }, [loading, user, navigate])
  useEffect(() => { if (user && user.id !== 'local') fetchMySupportTicket(id, user.id).then(setData).catch((error) => toast.error(error.message || 'Ticket not found')) }, [id, user])
  if (!user || !data) return <div className="mx-auto max-w-3xl px-4 py-12 text-center text-sm text-slate-500">Loading ticket...</div>
  async function submit(event) { event.preventDefault(); if (!message.trim()) return; setSending(true); try { const item = await sendSupportMessage({ user, ticketId: id, message, attachment }); setData((current) => ({ ...current, messages: [...current.messages, item] })); setMessage(''); setAttachment(null) } catch (error) { toast.error(error.message || 'Could not send message') } finally { setSending(false) } }
  return <div className="mx-auto w-full max-w-4xl space-y-5 px-4 py-8"><Link to="/account/support" className="text-sm font-semibold text-emerald-700">← Back to tickets</Link><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-mono text-xs font-bold text-emerald-700">{data.ticket.ticket_number}</p><h1 className="mt-1 text-2xl font-bold">{data.ticket.subject}</h1><p className="mt-1 text-sm text-slate-500">{data.ticket.category} · {data.ticket.order_id ? `Order #${String(data.ticket.order_id).slice(0, 8)}` : 'General question'}</p></div><span className="h-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">{data.ticket.status}</span></div><div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4">{data.messages.map((item) => <Message key={item.id} item={item} />)}</div><form onSubmit={submit} className="mt-5"><textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" placeholder="Write a reply..." /><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><input type="file" accept="image/*,.pdf,application/pdf" onChange={(e) => setAttachment(e.target.files?.[0] || null)} className="text-xs" /><button disabled={sending || data.ticket.status === 'Closed'} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Send className="h-4 w-4" />{sending ? 'Sending...' : 'Send message'}</button></div></form></section></div>
}

function Message({ item }) { const [url, setUrl] = useState(''); useEffect(() => { if (item.attachment_url) createSupportSignedUrl(item.attachment_url).then(setUrl).catch(() => {}) }, [item.attachment_url]); return <div className={`flex ${item.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${item.sender_type === 'customer' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-800 ring-1 ring-slate-200'}`}><p className="mb-1 text-[10px] font-semibold uppercase opacity-70">{item.sender_type === 'customer' ? 'You' : 'Support team'}</p><p className="whitespace-pre-wrap">{item.message}</p>{url && <a href={url} target="_blank" rel="noreferrer" className="mt-2 block text-xs underline">{item.attachment_name || 'View attachment'}</a>}<p className="mt-2 text-[10px] opacity-60">{new Date(item.created_at).toLocaleString('en-IN')}</p></div></div> }
