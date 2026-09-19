import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import ScrollToTop from '@/components/layout/ScrollToTop'
import TopbarMarquee from '@/components/layout/TopbarMarquee'

export default function StoreLayout() {
  return (
    <div className="flex min-h-screen flex-col antialiased">
      <ScrollToTop />
      <div className="sticky top-0 z-40">
        <TopbarMarquee />
        <Navbar />
      </div>
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <Toaster richColors position="bottom-center" />
    </div>
  )
}
