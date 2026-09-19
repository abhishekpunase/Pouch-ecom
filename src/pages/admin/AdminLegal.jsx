import { useState } from 'react'
import { toast } from 'sonner'
import { getLegalPageData, LEGAL_PAGE_KEYS, saveLegalPageData } from '@/data/legalContent'
import { PageHeader, SectionCard } from '@/components/admin/AdminUi'

const LEGAL_PAGE_LABELS = {
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
  shipping: 'Shipping Policy',
  refund: 'Refund Policy',
  return: 'Return Policy',
}

export default function AdminLegal() {
  const [legalContent, setLegalContent] = useState({
    terms: getLegalPageData(LEGAL_PAGE_KEYS.terms),
    privacy: getLegalPageData(LEGAL_PAGE_KEYS.privacy),
    shipping: getLegalPageData(LEGAL_PAGE_KEYS.shipping),
    refund: getLegalPageData(LEGAL_PAGE_KEYS.refund),
    return: getLegalPageData(LEGAL_PAGE_KEYS.return),
  })

  function updateLegalPage(pageKey, field, value) {
    setLegalContent((prev) => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        [field]: value,
      },
    }))
  }

  function onSave() {
    Object.entries(legalContent).forEach(([key, page]) => {
      saveLegalPageData(LEGAL_PAGE_KEYS[key], {
        title: page.title,
        updated: page.updated,
        body: page.body,
      })
    })
    toast.success('Legal pages saved successfully')
  }

  return (
    <div className="max-w-5xl space-y-5">
      <PageHeader
        eyebrow="Legal"
        title="Website pages"
        subtitle="Manage public policy pages content here. Each page is edited separately."
      />

      <SectionCard title="Policy pages">
        <div className="space-y-5">
          {Object.entries(legalContent).map(([key, page]) => (
            <div key={key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-lg font-semibold text-slate-800">{LEGAL_PAGE_LABELS[key] || key}</p>
              <label className="block text-sm text-slate-600">
                <span className="mb-1 block font-medium">Page title</span>
                <input
                  value={page.title || ''}
                  onChange={(e) => updateLegalPage(key, 'title', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </label>
              <label className="mt-3 block text-sm text-slate-600">
                <span className="mb-1 block font-medium">Last updated</span>
                <input
                  type="date"
                  value={page.updated || ''}
                  onChange={(e) => updateLegalPage(key, 'updated', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </label>
              <label className="mt-3 block text-sm text-slate-600">
                <span className="mb-1 block font-medium">HTML content</span>
                <textarea
                  rows={8}
                  value={page.body || ''}
                  onChange={(e) => updateLegalPage(key, 'body', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                />
              </label>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button type="button" onClick={onSave} className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
          Save legal pages
        </button>
      </div>
    </div>
  )
}
