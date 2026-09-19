import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { adminDeleteMessage, adminFetchMessages, getReadMessageIds, markMessageRead, unreadMessageCount } from '@/services/admin'
import { ConfirmDialog, EmptyState, PageHeader, SearchField } from '@/components/admin/AdminUi'

export default function AdminMessages() {
  const [list, setList] = useState([])
  const [q, setQ] = useState('')
  const [pending, setPending] = useState(null)
  const [tick, setTick] = useState(0)

  async function refresh() {
    setList(await adminFetchMessages())
  }

  useEffect(() => {
    refresh()
  }, [])

  const reads = getReadMessageIds()
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return list.filter((m) => {
      const hay = `${m.name} ${m.email} ${m.phone} ${m.message}`.toLowerCase()
      return !query || hay.includes(query)
    })
  }, [list, q])

  function open(m) {
    markMessageRead(m.id)
    setTick((n) => n + 1)
  }

  async function remove() {
    if (!pending) return
    await adminDeleteMessage(pending.id)
    toast.success('Message deleted')
    setPending(null)
    refresh()
  }

  return (
    <div>
      <PageHeader
        eyebrow="Inbox"
        title="Messages"
        subtitle={`${unreadMessageCount(list)} unread · contact form submissions from the storefront.`}
      />
      <div className="mt-6">
        <SearchField value={q} onChange={setQ} placeholder="Search name, email, message" />
      </div>
      <div className="mt-6 space-y-3">
        {filtered.length === 0 ? (
          <EmptyState title="No messages" hint="When a customer submits Contact, it lands here." />
        ) : (
          filtered.map((m) => {
            const unread = m.id && !reads.has(m.id)
            return (
              <article
                key={m.id || m.email}
                className={`rounded-2xl border bg-white p-5 shadow-sm ${unread ? 'border-emerald-200' : 'border-slate-200/80'}`}
                onClick={() => open(m)}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {m.name} · {m.email}
                      {unread && <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">NEW</span>}
                    </p>
                    <p className="text-xs text-slate-400">
                      {m.phone} · {m.created_at && new Date(m.created_at).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="flex gap-2 print:hidden">
                    <a href={`mailto:${m.email}`} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold">
                      Reply
                    </a>
                    <button type="button" onClick={() => setPending(m)} className="rounded-full px-3 py-1 text-xs font-semibold text-rose-600">
                      Delete
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm whitespace-pre-wrap text-slate-700">{m.message}</p>
              </article>
            )
          })
        )}
      </div>
      <span className="hidden">{tick}</span>
      <ConfirmDialog
        open={Boolean(pending)}
        title="Delete message?"
        body="This contact enquiry will be removed."
        onClose={() => setPending(null)}
        onConfirm={remove}
      />
    </div>
  )
}
