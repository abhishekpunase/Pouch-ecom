import { useState } from 'react'
import { BadgeCheck, Boxes, Factory, FileText, MessageCircle, Truck } from 'lucide-react'
import { CATEGORIES, SITE } from '@/data/catalog'
import { whatsappUrl } from '@/utils/whatsapp'
import Container from '@/components/layout/Container'

const QUANTITIES = ['500+', '1,000+', '5,000+', '10,000+', '25,000+', '50,000+']

const PERKS = [
  { icon: Boxes, title: 'Volume pricing', text: 'Better per-piece rates as quantity goes up.' },
  { icon: Factory, title: 'Custom print', text: 'Your brand on pouches, boxes and labels.' },
  { icon: FileText, title: 'GST invoice', text: 'Business billing for every bulk dispatch.' },
  { icon: Truck, title: 'All India shipping', text: 'Tracked cartons to any pincode.' },
]

const empty = {
  name: '',
  phone: '',
  business: '',
  category: 'pouches',
  quantity: '5,000+',
  city: '',
  notes: '',
}

function buildMessage(form) {
  const category = CATEGORIES.find((c) => c.slug === form.category)?.name || form.category
  return [
    `Hi, I want a bulk order from ${SITE.name}.`,
    '',
    `Name: ${form.name}`,
    `Phone: ${form.phone}`,
    form.business ? `Business: ${form.business}` : null,
    `Product: ${category}`,
    `Quantity: ${form.quantity}`,
    form.city ? `City: ${form.city}` : null,
    form.notes ? `Notes: ${form.notes}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

export default function BulkOrder() {
  const [form, setForm] = useState(empty)

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function onWhatsApp(e) {
    e.preventDefault()
    window.open(whatsappUrl(buildMessage(form)), '_blank', 'noopener,noreferrer')
  }

  const fieldClass =
    'mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-400'

  return (
    <div className="bg-gray-50/50">
      <div className="bg-slate-950 text-white">
        <Container className="py-12 md:py-16">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-emerald-300 uppercase">Wholesale desk</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
            Bulk orders for pouches, boxes and labels
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 md:text-base">
            Share your quantity and we will reply on WhatsApp with pricing, lead time and packing options.
          </p>
        </Container>
      </div>

      <Container className="py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={onWhatsApp} className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-xl font-bold">Tell us what you need</h2>
            <p className="mt-1 text-sm text-slate-500">Contact button opens WhatsApp with this enquiry filled in.</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                Name
                <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={fieldClass} />
              </label>
              <label className="block text-sm font-medium">
                WhatsApp number
                <input
                  required
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="98xxxxxxxx"
                  className={fieldClass}
                />
              </label>
              <label className="block text-sm font-medium">
                Business name
                <input value={form.business} onChange={(e) => set('business', e.target.value)} className={fieldClass} />
              </label>
              <label className="block text-sm font-medium">
                City
                <input value={form.city} onChange={(e) => set('city', e.target.value)} className={fieldClass} />
              </label>
              <label className="block text-sm font-medium">
                Product
                <select value={form.category} onChange={(e) => set('category', e.target.value)} className={fieldClass}>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                  <option value="mixed">Mixed (pouches + boxes + labels)</option>
                </select>
              </label>
              <label className="block text-sm font-medium">
                Quantity
                <select value={form.quantity} onChange={(e) => set('quantity', e.target.value)} className={fieldClass}>
                  {QUANTITIES.map((q) => (
                    <option key={q} value={q}>
                      {q} pieces
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-4 block text-sm font-medium">
              Notes
              <textarea
                rows={4}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Size, colour, print, delivery date…"
                className={fieldClass}
              />
            </label>

            <button
              type="submit"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#128C7E] md:w-auto md:px-8"
            >
              <MessageCircle className="h-5 w-5" />
              Contact on WhatsApp
            </button>
          </form>

          <div className="space-y-4">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-[11px] font-semibold tracking-widest text-emerald-600 uppercase">Why bulk with us</p>
              <div className="mt-4 space-y-4">
                {PERKS.map((perk) => (
                  <div key={perk.title} className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <perk.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold">{perk.title}</p>
                      <p className="text-sm text-slate-500">{perk.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] bg-slate-950 p-6 text-white">
              <p className="text-sm font-semibold">Prefer to talk first?</p>
              <p className="mt-1 text-sm text-slate-300">We reply on WhatsApp during business hours.</p>
              <a
                href={whatsappUrl(`Hi, reaching out from ${SITE.name}. I want to discuss a bulk order.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#128C7E]"
              >
                <MessageCircle className="h-4 w-4" />
                Contact on WhatsApp
              </a>
              <p className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <BadgeCheck className="h-4 w-4 text-emerald-300" />
                {SITE.phone}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
