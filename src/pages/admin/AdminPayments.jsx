import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { fetchAdminSettings, updateAdminSettings } from '@/services/api'
import { PageHeader, SectionCard, StatusBadge } from '@/components/admin/AdminUi'

const emptySettings = { RAZORPAY_KEY_ID: '', RAZORPAY_KEY_SECRET: '' }

export default function AdminPayments() {
  const [settings, setSettings] = useState(emptySettings)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAdminSettings()
      .then((next) => setSettings({
        RAZORPAY_KEY_ID: next.RAZORPAY_KEY_ID || '',
        RAZORPAY_KEY_SECRET: next.RAZORPAY_KEY_SECRET || '',
      }))
      .catch(() => toast.error('Could not load Razorpay credentials'))
  }, [])

  async function onSave(event) {
    event.preventDefault()
    setSaving(true)
    try {
      await updateAdminSettings(settings)
      toast.success('Razorpay credentials updated')
    } catch (error) {
      toast.error(error.message || 'Could not update Razorpay credentials')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader eyebrow="Payments" title="Razorpay" subtitle="View and update the payment gateway credentials used at checkout." />
      <SectionCard title="Payment gateway">
        <form onSubmit={onSave} className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3 text-sm">
            <span>Checkout gateway</span>
            <StatusBadge value={settings.RAZORPAY_KEY_ID && settings.RAZORPAY_KEY_SECRET ? 'configured' : 'missing keys'} />
          </div>
          <label className="block text-sm text-slate-600">
            <span className="mb-1 block font-medium">Razorpay key ID</span>
            <input value={settings.RAZORPAY_KEY_ID} onChange={(e) => setSettings((prev) => ({ ...prev, RAZORPAY_KEY_ID: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
          </label>
          <label className="block text-sm text-slate-600">
            <span className="mb-1 block font-medium">Razorpay key secret</span>
            <input type="password" value={settings.RAZORPAY_KEY_SECRET} onChange={(e) => setSettings((prev) => ({ ...prev, RAZORPAY_KEY_SECRET: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
          </label>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Updating...' : 'Update Razorpay'}</button>
          </div>
        </form>
      </SectionCard>
    </div>
  )
}
