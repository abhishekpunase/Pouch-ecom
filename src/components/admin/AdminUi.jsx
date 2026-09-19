export const fieldClass =
  'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'

export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow && <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-700 uppercase">{eyebrow}</p>}
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

const STATUS_STYLES = {
  confirmed: 'bg-sky-50 text-sky-800 ring-sky-100',
  packed: 'bg-indigo-50 text-indigo-800 ring-indigo-100',
  shipped: 'bg-amber-50 text-amber-900 ring-amber-100',
  delivered: 'bg-emerald-50 text-emerald-800 ring-emerald-100',
  cancelled: 'bg-rose-50 text-rose-800 ring-rose-100',
  pending_payment: 'bg-slate-100 text-slate-600 ring-slate-200',
  paid: 'bg-emerald-50 text-emerald-800 ring-emerald-100',
  cod: 'bg-orange-50 text-orange-800 ring-orange-100',
  razorpay: 'bg-violet-50 text-violet-800 ring-violet-100',
  in_stock: 'bg-emerald-50 text-emerald-800 ring-emerald-100',
  out_of_stock: 'bg-rose-50 text-rose-800 ring-rose-100',
  online: 'bg-emerald-50 text-emerald-800 ring-emerald-100',
  offline: 'bg-rose-50 text-rose-800 ring-rose-100',
  live: 'bg-emerald-50 text-emerald-800 ring-emerald-100',
  demo: 'bg-slate-100 text-slate-600 ring-slate-200',
}

export function StatusBadge({ value }) {
  const key = String(value || 'confirmed').toLowerCase()
  const cls = STATUS_STYLES[key] || 'bg-slate-100 text-slate-700 ring-slate-200'
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset ${cls}`}>
      {key.replaceAll('_', ' ')}
    </span>
  )
}

export function EmptyState({ title, hint, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
      <p className="font-semibold text-slate-800">{title}</p>
      {hint && <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function SkeletonRows({ rows = 6, cols = 5 }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100">
          {Array.from({ length: cols }).map((__, j) => (
            <td key={j} className="px-4 py-4">
              <div className="h-3 max-w-[180px] animate-pulse rounded bg-slate-100" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}

export function SearchField({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-full min-w-[200px] rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 md:w-72"
    />
  )
}

export function Pagination({ page, pages, total, onPage }) {
  if (!total) return null
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
      <span>
        {total} record{total === 1 ? '' : 's'}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
        >
          Prev
        </button>
        <span className="tabular-nums">
          {page} / {pages}
        </span>
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, title, body, confirmLabel = 'Delete', onClose, onConfirm }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">{body}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export function SectionCard({ title, hint, children, actions }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div>
            {title && <h2 className="text-sm font-bold tracking-wide text-slate-900 uppercase">{title}</h2>}
            {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}
