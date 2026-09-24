import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { fetchAdminSettings, sendAdminTestEmail, updateAdminSettings } from '@/services/api'
import { getAdminEmail } from '@/services/admin'
import { PageHeader, SectionCard } from '@/components/admin/AdminUi'

export default function AdminSettings() {
  const [email, setEmail] = useState(getAdminEmail())
  const [password, setPassword] = useState('')
  const [smtp, setSmtp] = useState({ host: '', port: '587', username: '', password: '', encryption: 'TLS', from: '', fromName: '' })
  const [smtpConfigured, setSmtpConfigured] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [marqueeText, setMarqueeText] = useState('Free shipping above ₹8,000\nBulk packs · 50 to 1000 pcs\nPouches · Boxes · Labels')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAdminSettings()
      .then((settings) => {
        setEmail(settings.ADMIN_EMAIL || '')
        setSmtp({ host: settings.SMTP_HOST || '', port: settings.SMTP_PORT || '587', username: settings.SMTP_USER || '', password: '', encryption: settings.SMTP_ENCRYPTION || 'TLS', from: settings.MAIL_FROM || '', fromName: settings.MAIL_FROM_NAME || '' })
        setSmtpConfigured(Boolean(settings.SMTP_CONFIGURED))
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
    event?.preventDefault()
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
        SMTP_HOST: smtp.host.trim(),
        SMTP_PORT: smtp.port.trim(),
        SMTP_USER: smtp.username.trim(),
        ...(smtp.password.trim() ? { SMTP_PASSWORD: smtp.password.trim() } : {}),
        SMTP_ENCRYPTION: smtp.encryption,
        MAIL_FROM: smtp.from.trim(),
        MAIL_FROM_NAME: smtp.fromName.trim(),
        MARQUEE_ITEMS: JSON.stringify(nextItems),
      }

      const result = await updateAdminSettings(payload)
      setSmtpConfigured(Boolean(result.settings?.SMTP_CONFIGURED))
      if (nextPassword) setPassword('')
      setSmtp((current) => ({ ...current, password: '' }))
      toast.success('Marquee content and admin settings updated successfully.')
    } catch (error) {
      toast.error(error.message || 'Could not update admin settings')
    } finally {
      setSaving(false)
    }
  }

  async function onTestEmail() {
    setTestingEmail(true)
    try {
      await sendAdminTestEmail()
      toast.success('Test email sent. Check the admin inbox.')
    } catch (error) {
      toast.error(error.message || 'Could not send test email')
    } finally {
      setTestingEmail(false)
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

      <SectionCard title="Email (SMTP)">
        <div className="space-y-4">
          <div className={`rounded-xl px-3 py-2.5 text-sm ${smtpConfigured ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
            {smtpConfigured ? 'SMTP is configured. Website contact and order emails are enabled.' : 'SMTP is not configured. Add the mail server details to enable website emails.'}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-slate-600"><span className="mb-1 block font-medium">SMTP host</span><input value={smtp.host} onChange={(event) => setSmtp({ ...smtp, host: event.target.value })} placeholder="smtp.gmail.com" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500" /></label>
            <label className="block text-sm text-slate-600"><span className="mb-1 block font-medium">SMTP port</span><input type="number" value={smtp.port} onChange={(event) => setSmtp({ ...smtp, port: event.target.value })} placeholder="587" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500" /></label>
            <label className="block text-sm text-slate-600"><span className="mb-1 block font-medium">Username</span><input value={smtp.username} onChange={(event) => setSmtp({ ...smtp, username: event.target.value })} placeholder="name@example.com" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500" /></label>
            <label className="block text-sm text-slate-600"><span className="mb-1 block font-medium">Password</span><input type="password" value={smtp.password} onChange={(event) => setSmtp({ ...smtp, password: event.target.value })} placeholder="Leave blank to keep saved password" autoComplete="new-password" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500" /></label>
            <label className="block text-sm text-slate-600"><span className="mb-1 block font-medium">Encryption</span><select value={smtp.encryption} onChange={(event) => setSmtp({ ...smtp, encryption: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"><option value="TLS">TLS</option><option value="SSL">SSL</option><option value="NONE">None</option></select></label>
            <label className="block text-sm text-slate-600"><span className="mb-1 block font-medium">Sender email</span><input type="email" value={smtp.from} onChange={(event) => setSmtp({ ...smtp, from: event.target.value })} placeholder="Leave blank to use username" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500" /></label>
          </div>
          <label className="block text-sm text-slate-600"><span className="mb-1 block font-medium">Sender name</span><input value={smtp.fromName} onChange={(event) => setSmtp({ ...smtp, fromName: event.target.value })} placeholder="Apna Packaging" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500" /></label>
          <p className="text-xs text-slate-400">For Gmail, use smtp.gmail.com, port 587, TLS, and a Google App Password.</p>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button type="button" disabled={testingEmail || !smtpConfigured} onClick={onTestEmail} className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              {testingEmail ? 'Sending...' : 'Send test email'}
            </button>
            <button type="button" onClick={onSave} disabled={saving} className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
              {saving ? 'Saving...' : 'Save SMTP settings'}
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
