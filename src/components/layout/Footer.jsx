import { Link } from 'react-router-dom'
import { SITE } from '@/data/catalog'
import Container from '@/components/layout/Container'

export default function Footer() {
  return (
    <footer className="mt-auto bg-gray-900 py-8 text-white">
      <Container>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-xl font-bold">{SITE.name}</h3>
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
            <p className="text-gray-400">Email: {SITE.email}</p>
            <p className="text-gray-400">Phone: {SITE.phone}</p>
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
