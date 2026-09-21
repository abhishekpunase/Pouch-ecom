import { Link } from 'react-router-dom'
import { Infinity, Mail, Phone } from 'lucide-react'
import { SITE } from '@/data/catalog'
import Container from '@/components/layout/Container'

export default function Footer() {
  return (
    <footer className="mt-auto bg-gray-900 py-8 text-white">
      <Container>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="max-w-xs">
            <Link to="/" className="mb-4 flex items-center gap-3 text-left">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-sm">
                <Infinity className="h-5 w-5" />
              </span>
              <span className="text-xl font-bold tracking-tight text-white">
                Apna <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Packaging</span>
              </span>
            </Link>
            <p className="text-gray-400">Pouches, boxes and labels for D2C and wholesale brands.</p>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link className="text-gray-400 transition hover:text-white" to="/">
                  Home
                </Link>
              </li>
              <li>
                <Link className="text-gray-400 transition hover:text-white" to="/category/pouches">
                  Pouches
                </Link>
              </li>
              <li>
                <Link className="text-gray-400 transition hover:text-white" to="/category/boxes">
                  Boxes
                </Link>
              </li>
              <li>
                <Link className="text-gray-400 transition hover:text-white" to="/category/labels">
                  Labels
                </Link>
              </li>
              <li>
                <Link className="text-gray-400 transition hover:text-white" to="/products">
                  All Products
                </Link>
              </li>
              <li>
                <Link className="text-gray-400 transition hover:text-white" to="/bulk-order">
                  Bulk Order
                </Link>
              </li>
              <li>
                <Link className="text-gray-400 transition hover:text-white" to="/about">
                  About
                </Link>
              </li>
              <li>
                <Link className="text-gray-400 transition hover:text-white" to="/contact">
                  Contact
                </Link>
              </li>
              <li>
                <Link className="text-gray-400 transition hover:text-white" to="/cart">
                  Cart
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Policies</h3>
            <ul className="space-y-2">
              <li>
                <Link className="text-gray-400 transition hover:text-white" to="/privacy-policy">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link className="text-gray-400 transition hover:text-white" to="/terms-and-conditions">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link className="text-gray-400 transition hover:text-white" to="/shipping-policy">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link className="text-gray-400 transition hover:text-white" to="/refund-policy">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link className="text-gray-400 transition hover:text-white" to="/return-policy">
                  Return Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-emerald-400" />
                <span>{SITE.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-emerald-400" />
                <span>{SITE.phone}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 space-y-2 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>GST: {SITE.gst}</p>
        </div>
      </Container>
    </footer>
  )
}
