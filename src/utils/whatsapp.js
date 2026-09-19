import { SITE } from '@/data/catalog'

export function whatsappNumber() {
  return import.meta.env.VITE_WHATSAPP_NUMBER || SITE.whatsapp
}

export function whatsappUrl(text) {
  return `https://wa.me/${whatsappNumber()}?text=${encodeURIComponent(text)}`
}
