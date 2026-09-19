import { Award, Clock, IndianRupee, Package } from 'lucide-react'
import { SITE } from '@/data/catalog'

const reasons = [
  { icon: Award, title: 'Premium Quality', text: 'We use only the best materials to ensure durability and reliability.' },
  { icon: IndianRupee, title: 'Competitive Pricing', text: 'Get the best rates in the market without compromising on quality.' },
  { icon: Clock, title: 'Timely Delivery', text: 'We understand the importance of time and ensure prompt delivery.' },
  { icon: Package, title: 'Wide Range', text: 'Pouches, shipping boxes and product labels — every size, colour and piece pack.' },
]

export default function About() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12">
      <p className="text-sm font-medium text-emerald-700">{SITE.name}</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">About {SITE.name}</h1>
      <p className="mt-2 text-slate-500">by {SITE.company}</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold uppercase tracking-wide">{SITE.company}</h2>
          <p className="mt-4 leading-relaxed text-slate-600">
            {SITE.name} is a brand built for D2C and wholesale brands that need complete packaging — standup pouches,
            shipping boxes and product labels. Size, colour and piece options sit on every product page.
          </p>
          <p className="mt-4 leading-relaxed text-slate-600">
            Based in New Delhi, we ship across India with a focus on consistent quality, competitive pricing and
            responsive support.
          </p>
        </div>
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold">Contact Us</h2>
          <div className="mt-4 space-y-3 text-slate-600">
            <p>
              <span className="font-semibold text-slate-900">Phone</span>
              <br />
              {SITE.phone}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Address</span>
              <br />
              {SITE.address}
            </p>
            <p>
              <span className="font-semibold text-slate-900">GST</span>
              <br />
              {SITE.gst}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-3 gap-4">
        {[
          ['4+', 'Years of Experience'],
          ['500+', 'Happy Clients'],
          ['100%', 'Quality Assurance'],
        ].map(([n, l]) => (
          <div key={l} className="rounded-[2rem] bg-white p-6 text-center shadow-sm">
            <p className="text-3xl font-bold text-emerald-600">{n}</p>
            <p className="mt-1 text-sm text-slate-500">{l}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-2xl font-bold">Why Choose Us?</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reasons.map((r) => (
          <div key={r.title} className="rounded-[2rem] bg-white p-6 shadow-sm">
            <r.icon className="h-8 w-8 text-emerald-600" />
            <h3 className="mt-3 font-bold">{r.title}</h3>
            <p className="mt-2 text-sm text-slate-500">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
