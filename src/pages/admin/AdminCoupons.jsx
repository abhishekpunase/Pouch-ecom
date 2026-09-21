import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteAdminCoupon, fetchAdminCoupons, saveAdminCoupon } from '@/services/api'
import { fieldClass, PageHeader, SectionCard } from '@/components/admin/AdminUi'

const emptyForm = {
  code: '',
  type: 'percent',
  value: '',
  minSubtotal: '0',
  expiresAt: '',
  active: true,
}

function formatDiscount(coupon) {
  return coupon.type === 'percent' ? `${coupon.value}%` : `₹${Number(coupon.value).toLocaleString('en-IN')}`
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      const result = await fetchAdminCoupons()
      setCoupons(result.coupons || [])
    } catch (error) {
      toast.error(error.message || 'Could not load coupons')
    }
  }

  useEffect(() => {
    load()
  }, [])

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function onSubmit(event) {
    event.preventDefault()
    setSaving(true)
    try {
      await saveAdminCoupon(form)
      setForm(emptyForm)
      await load()
      toast.success('Coupon created')
    } catch (error) {
      toast.error(error.message || 'Could not create coupon')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id) {
    try {
      await deleteAdminCoupon(id)
      setCoupons((current) => current.filter((coupon) => coupon.id !== id))
      toast.success('Coupon deleted')
    } catch (error) {
      toast.error(error.message || 'Could not delete coupon')
    }
  }

  return (
    <div className="max-w-4xl space-y-5">
      <PageHeader
        eyebrow="Sales tools"
        title="Coupons"
        subtitle="Create private discount codes. Customers only see the benefit after entering a valid code at checkout."
      />

      <SectionCard title="Create coupon">
        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-600">
            <span className="mb-1 block font-medium">Coupon code</span>
            <input required value={form.code} onChange={(event) => update('code', event.target.value.toUpperCase())} placeholder="WELCOME10" className={fieldClass} />
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block font-medium">Discount type</span>
            <select value={form.type} onChange={(event) => update('type', event.target.value)} className={fieldClass}>
              <option value="percent">Percentage</option>
              <option value="fixed">Fixed amount</option>
            </select>
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block font-medium">Discount value</span>
            <input required type="number" min="0.01" step="0.01" value={form.value} onChange={(event) => update('value', event.target.value)} placeholder={form.type === 'percent' ? '10' : '500'} className={fieldClass} />
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block font-medium">Minimum order value (₹)</span>
            <input type="number" min="0" step="0.01" value={form.minSubtotal} onChange={(event) => update('minSubtotal', event.target.value)} className={fieldClass} />
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block font-medium">Expiry (optional)</span>
            <input type="datetime-local" value={form.expiresAt} onChange={(event) => update('expiresAt', event.target.value)} className={fieldClass} />
          </label>
          <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.active} onChange={(event) => update('active', event.target.checked)} />
            Active coupon
          </label>
          <div className="flex justify-end md:col-span-2">
            <button type="submit" disabled={saving} className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {saving ? 'Creating...' : 'Create coupon'}
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Private coupon codes" hint="Codes are not displayed on the storefront. Share them directly with customers.">
        {coupons.length === 0 ? (
          <p className="text-sm text-slate-500">No coupons created yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="font-mono font-semibold text-slate-900">{coupon.code}</p>
                  <p className="text-xs text-slate-500">
                    {formatDiscount(coupon)} off · Min ₹{Number(coupon.minSubtotal || 0).toLocaleString('en-IN')}
                    {coupon.expiresAt ? ` · Expires ${new Date(coupon.expiresAt).toLocaleString('en-IN')}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold ${coupon.active === false ? 'text-slate-400' : 'text-emerald-700'}`}>{coupon.active === false ? 'Inactive' : 'Active'}</span>
                  <button type="button" onClick={() => remove(coupon.id)} className="rounded-full p-2 text-rose-600 hover:bg-rose-50" aria-label={`Delete ${coupon.code}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
