import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { fetchAdminSettings, updateAdminSettings } from '@/services/api'
import { getAdminEmail } from '@/services/admin'
import { PageHeader, SectionCard } from '@/components/admin/AdminUi'

export default function AdminSettings() {
  const [email, setEmail] = useState(getAdminEmail())
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAdminSettings()
      .then((settings) => setEmail(settings.ADMIN_EMAIL || ''))
      .catch(() => {})
  }, [])

  async function onSave(event) {
    event.preventDefault()
    const nextPassword = password.trim()
    if (nextPassword.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }

    setSaving(true)
    try {
      await updateAdminSettings({ ADMIN_PASSWORD: nextPassword })
      setPassword('')
      toast.success('Admin password updated. Use the new password on your next login.')
    } catch (error) {
      toast.error(error.message || 'Could not update admin password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader
        eyebrow="Security"
        title="Admin login"
        subtitle="Only the admin password can be changed here. Email and all store data stay unchanged."
      />

      <SectionCard title="Admin credentials">
        <form onSubmit={onSave} className="space-y-4">
          <label className="block text-sm text-slate-600">
            <span className="mb-1 block font-medium">Admin email (fixed)</span>
            <input
              value={email}
              readOnly
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500"
            />
          </label>
          <label className="block text-sm text-slate-600">
            <span className="mb-1 block font-medium">New admin password</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter a new password"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
            />
            <span className="mt-1 block text-xs text-slate-400">Minimum 8 characters. The current password is never shown.</span>
          </label>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving} className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
              {saving ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  )
}
