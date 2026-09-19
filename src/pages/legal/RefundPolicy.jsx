import PolicyPage from '@/pages/legal/PolicyPage'
import { getLegalPageData, LEGAL_PAGE_KEYS } from '@/data/legalContent'

export default function RefundPolicy() {
  const content = getLegalPageData(LEGAL_PAGE_KEYS.refund)

  return <PolicyPage title={content.title} updated={content.updated} contentHtml={content.body} />
}
