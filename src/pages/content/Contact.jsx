import { useState } from 'react'
import { Mail, MapPin, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { SITE } from '@/data/catalog'
import { sendContactMessage } from '@/services/supabase'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [sending, setSending] = useState(false)

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSending(true)
    try {
      await sendContactMessage(form)
      toast.success('Message sent. We will get back to you shortly.')
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch (err) {
      toast.error(err.message || 'Could not send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight">Contact</h1>
      <p className="mt-2 max-w-xl text-slate-500">
        Questions about pouches, boxes, labels or bulk pieces? Write to us — we typically reply within one business day.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="rounded-[2rem] bg-white p-8 shadow-sm">
          <label className="block text-sm font-medium">Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            className="mt-1 mb-4 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-400"
          />
          <label className="block text-sm font-medium">Email</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            className="mt-1 mb-4 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-400"
          />
          <label className="block text-sm font-medium">Phone</label>
          <input
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            className="mt-1 mb-4 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-400"
          />
          <label className="block text-sm font-medium">Message</label>
          <textarea
            required
            rows={5}
            value={form.message}
            onChange={(e) => set('message', e.target.value)}
            className="mt-1 mb-6 w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-emerald-400"
          />
          <button
            type="submit"
            disabled={sending}
            className="gradient-btn w-full rounded-full py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {sending ? 'Sending…' : 'Send message'}
          </button>
        </form>

        <div className="space-y-4">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <Phone className="h-5 w-5 text-emerald-600" />
            <p className="mt-2 font-semibold">Phone</p>
            <p className="text-slate-600">{SITE.phone}</p>
          </div>
          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <Mail className="h-5 w-5 text-blue-600" />
            <p className="mt-2 font-semibold">Email</p>
            <p className="text-slate-600">{SITE.email}</p>
          </div>
          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <MapPin className="h-5 w-5 text-green-600" />
            <p className="mt-2 font-semibold">Address</p>
            <p className="text-slate-600">{SITE.address}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
