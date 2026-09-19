import { useState } from 'react'
import { toast } from 'sonner'
import { SITE } from '@/data/catalog'
import { PageHeader, SectionCard } from '@/components/admin/AdminUi'

const initial = {
  name: SITE.name,
  gst: SITE.gst,
  address: SITE.address,
  email: SITE.email,
  phone: SITE.phone,
  freeShippingFrom: SITE.freeShippingFrom,
}

export default function AdminWebsite() {
  const [form, setForm] = useState(initial)

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function onSave() {
    toast.success('Website details saved successfully')
  }

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader
        eyebrow="Website"
        title="Store details"
        subtitle="Manage public storefront details shown on the website and legal pages."
      />

      <SectionCard title="Store information">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-600 md:col-span-2">
            <span className="mb-1 block font-medium">Business name</span>
            <input value={form.name} onChange={(e) => updateField('name', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block font-medium">GST number</span>
            <input value={form.gst} onChange={(e) => updateField('gst', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block font-medium">Free shipping from</span>
            <input value={form.freeShippingFrom} onChange={(e) => updateField('freeShippingFrom', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
          </label>
          <label className="text-sm text-slate-600 md:col-span-2">
            <span className="mb-1 block font-medium">Address</span>
            <textarea rows={3} value={form.address} onChange={(e) => updateField('address', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block font-medium">Email</span>
            <input value={form.email} onChange={(e) => updateField('email', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block font-medium">Phone</span>
            <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
          </label>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button type="button" onClick={onSave} className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
          Save website details
        </button>
      </div>
    </div>
  )
}
