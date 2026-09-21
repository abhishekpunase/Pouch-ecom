import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { fetchAdminSettings, updateAdminSettings } from '@/services/api'
import { getAdminEmail } from '@/services/admin'
import { PageHeader, SectionCard } from '@/components/admin/AdminUi'

export default function AdminSettings() {
  const [email, setEmail] = useState(getAdminEmail())
  const [password, setPassword] = useState('')
  const [marqueeText, setMarqueeText] = useState('Free shipping above ₹8,000\nBulk packs · 50 to 1000 pcs\nPouches · Boxes · Labels')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAdminSettings()
      .then((settings) => {
        setEmail(settings.ADMIN_EMAIL || '')
        const rawMarquee = settings.MARQUEE_ITEMS || ''
        if (rawMarquee) {
          try {
            const parsed = JSON.parse(rawMarquee)
            if (Array.isArray(parsed)) {
              setMarqueeText(parsed.join('\n'))
              return
            }
          } catch {
            // fall through to raw string parsing
          }
          setMarqueeText(String(rawMarquee).split(/\r?\n|\|/).map((item) => item.trim()).filter(Boolean).join('\n'))
        }
      })
      .catch(() => {})
  }, [])

  async function onSave(event) {
    event.preventDefault()
    const nextPassword = password.trim()
    if (nextPassword && nextPassword.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }

    setSaving(true)
    try {
      const nextItems = marqueeText
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean)

      const payload = {
        ...(nextPassword ? { ADMIN_PASSWORD: nextPassword } : {}),
        MARQUEE_ITEMS: JSON.stringify(nextItems),
      }

      await updateAdminSettings(payload)
      if (nextPassword) setPassword('')
      toast.success('Marquee content and admin settings updated successfully.')
    } catch (error) {
      toast.error(error.message || 'Could not update admin settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader
        eyebrow="Security"
        title="Admin login"
        subtitle="Manage the admin password and the marquee text shown across the storefront."
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
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Leave blank to keep current password"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
            />
            <span className="mt-1 block text-xs text-slate-400">Minimum 8 characters if you change the password.</span>
          </label>

          <label className="block text-sm text-slate-600">
            <span className="mb-1 block font-medium">Marquee content</span>
            <textarea
              rows={5}
              value={marqueeText}
              onChange={(event) => setMarqueeText(event.target.value)}
              placeholder={'Free shipping above ₹8,000\nBulk packs · 50 to 1000 pcs\nPouches · Boxes · Labels'}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
            />
            <span className="mt-1 block text-xs text-slate-400">Add one item per line. The storefront marquee will show these lines in sequence.</span>
          </label>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving} className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  )
}
