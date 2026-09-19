import { avatarOf } from '@/services/profile'
import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Infinity, Menu, Search, ShoppingBag, X } from 'lucide-react'
import { SITE, PRODUCTS } from '@/data/catalog'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import Container from '@/components/layout/Container'

const links = [
  { to: '/', label: 'Home' },
  { to: '/category/pouches', label: 'Pouches' },
  { to: '/category/boxes', label: 'Boxes' },
  { to: '/category/labels', label: 'Labels' },
  { to: '/products', label: 'All Products' },
  { to: '/sample-kit', label: 'Sample Kit' },
  { to: '/bulk-order', label: 'Bulk Order' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const { count } = useCart()
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
    setSearchOpen(false)
    setQ('')
  }, [location.pathname])

  const results = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (query.length < 2) return []
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.category.includes(query) ||
        p.shortDescription.toLowerCase().includes(query),
    ).slice(0, 6)
  }, [q])

  function onSearch(e) {
    e.preventDefault()
    if (q.trim()) navigate(`/products?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <header className="border-b border-slate-100 bg-white/90 backdrop-blur-md">
      <Container className="flex h-20 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl gradient-btn text-white shadow-sm">
            <Infinity className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Apna <span className="gradient-text">Packaging</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/' || l.to === '/products'}
              className={({ isActive }) => {
                const sampleActive =
                  l.to === '/sample-kit' &&
                  (isActive || location.pathname.includes('free-sample-kit') || location.pathname === '/sample-kit')
                const active = l.to === '/sample-kit' ? sampleActive : isActive
                return `rounded-full px-2.5 py-2 text-[13px] font-medium transition xl:px-3.5 xl:text-sm ${
                  active ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className="hidden rounded-full p-2 text-slate-600 hover:bg-slate-50 md:inline-flex"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            to={user ? '/account' : '/sign-in'}
            className="hidden shrink-0 items-center whitespace-nowrap rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 sm:inline-flex"
          >
            {user && avatarOf(user) && <img src={avatarOf(user)} alt="" className="mr-2 -ml-1 h-6 w-6 rounded-full object-cover" />}
            {user ? 'Account' : 'Sign In'}
          </Link>
          <Link to="/cart" className="relative rounded-full p-2 text-slate-600 hover:bg-slate-50" aria-label="Cart">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="rounded-full p-2 text-slate-700 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </Container>

      {searchOpen && (
        <div className="border-t border-slate-100 bg-white py-3">
          <Container>
            <form onSubmit={onSearch} className="flex gap-2">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search ${SITE.name} products…`}
              className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-400"
            />
            <button type="submit" className="rounded-full gradient-btn px-5 py-2 text-sm font-medium text-white">
              Search
            </button>
          </form>
          {results.length > 0 && (
            <div className="mt-2 rounded-2xl border border-slate-100 bg-white shadow-sm">
              {results.map((p) => (
                <Link key={p.id} to={`/products/${p.slug}`} className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50">
                  <img src={p.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs capitalize text-slate-500">{p.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          </Container>
        </div>
      )}

      {open && (
        <div className="border-t border-slate-100 bg-white py-4 lg:hidden">
          <Container className="flex flex-col gap-1">
            {[...links, { to: '/privacy-policy', label: 'Privacy Policy' }].map((l) => (
              <Link key={l.to} to={l.to} className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50">
                {l.label}
              </Link>
            ))}
            <Link to={user ? '/account' : '/sign-in'} className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700">
              {user ? 'Account' : 'Sign in'}
            </Link>
          </Container>
        </div>
      )}
    </header>
  )
}
