import PolicyPage from '@/pages/legal/PolicyPage'
import { getLegalPageData, LEGAL_PAGE_KEYS } from '@/data/legalContent'

export default function ShippingPolicy() {
  const content = getLegalPageData(LEGAL_PAGE_KEYS.shipping)

  return <PolicyPage title={content.title} updated={content.updated} contentHtml={content.body} />
}
