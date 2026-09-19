import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { fetchAdminSettings, updateAdminSettings } from '@/services/api'
import { PageHeader, SectionCard, StatusBadge } from '@/components/admin/AdminUi'

const emptySettings = {
  SHIPROCKET_EMAIL: '',
  SHIPROCKET_PASSWORD: '',
  SHIPROCKET_PICKUP_PINCODE: '',
  SHIPROCKET_PICKUP_LOCATION: '',
}

export default function AdminShipping() {
  const [settings, setSettings] = useState(emptySettings)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAdminSettings()
      .then((next) => setSettings({
        SHIPROCKET_EMAIL: next.SHIPROCKET_EMAIL || '',
        SHIPROCKET_PASSWORD: next.SHIPROCKET_PASSWORD || '',
        SHIPROCKET_PICKUP_PINCODE: next.SHIPROCKET_PICKUP_PINCODE || '',
        SHIPROCKET_PICKUP_LOCATION: next.SHIPROCKET_PICKUP_LOCATION || '',
      }))
      .catch(() => toast.error('Could not load Shiprocket credentials'))
  }, [])

  async function onSave(event) {
    event.preventDefault()
    setSaving(true)
    try {
      await updateAdminSettings(settings)
      toast.success('Shiprocket credentials updated')
    } catch (error) {
      toast.error(error.message || 'Could not update Shiprocket credentials')
    } finally {
      setSaving(false)
    }
  }

  function updateField(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader
        eyebrow="Logistics"
        title="Shipping"
        subtitle="View and update Shiprocket credentials used for courier rates and AWB creation."
        actions={<Link to="/admin/orders" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Open orders</Link>}
      />
      <SectionCard title="Shiprocket connection">
        <form onSubmit={onSave} className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3 text-sm">
            <span>Shiprocket login</span>
            <StatusBadge value={settings.SHIPROCKET_EMAIL && settings.SHIPROCKET_PASSWORD ? 'configured' : 'missing credentials'} />
          </div>
          <label className="block text-sm text-slate-600"><span className="mb-1 block font-medium">Shiprocket email</span><input type="email" value={settings.SHIPROCKET_EMAIL} onChange={(e) => updateField('SHIPROCKET_EMAIL', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500" /></label>
          <label className="block text-sm text-slate-600"><span className="mb-1 block font-medium">Shiprocket password</span><input type="password" value={settings.SHIPROCKET_PASSWORD} onChange={(e) => updateField('SHIPROCKET_PASSWORD', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500" /></label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-slate-600"><span className="mb-1 block font-medium">Pickup pincode</span><input value={settings.SHIPROCKET_PICKUP_PINCODE} onChange={(e) => updateField('SHIPROCKET_PICKUP_PINCODE', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500" /></label>
            <label className="block text-sm text-slate-600"><span className="mb-1 block font-medium">Pickup location</span><input value={settings.SHIPROCKET_PICKUP_LOCATION} onChange={(e) => updateField('SHIPROCKET_PICKUP_LOCATION', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500" /></label>
          </div>
          <div className="flex justify-end"><button type="submit" disabled={saving} className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Updating...' : 'Update Shiprocket'}</button></div>
        </form>
      </SectionCard>
    </div>
  )
}
