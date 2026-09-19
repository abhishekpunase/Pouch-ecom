import { SITE } from '@/data/catalog'

export default function PolicyPage({ title, updated, contentHtml }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          Last updated: {updated ? new Date(updated).toLocaleDateString('en-IN') : '—'}
        </p>
        <div
          className="prose-headings:font-semibold mt-8 space-y-6 rounded-[2rem] bg-white p-8 text-slate-600 shadow-sm [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:text-slate-900"
          dangerouslySetInnerHTML={{ __html: contentHtml || '' }}
        />
        <p className="mt-6 text-sm text-slate-500">
          Questions? Email {SITE.email} or call {SITE.phone}.
        </p>
      </div>
    </div>
  )
}
