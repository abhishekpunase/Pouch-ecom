import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  BadgeCheck,
  Box,
  Building2,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Truck,
} from 'lucide-react'
import { CATEGORIES, REVIEWS, SITE } from '@/data/catalog'
import { fetchProducts } from '@/services/supabase'
import ProductCard from '@/components/catalog/ProductCard'
import ReelSection from '@/components/catalog/ReelSection'
import Container from '@/components/layout/Container'

export default function Home() {
  const [products, setProducts] = useState([])
  const [review] = useState(() => REVIEWS[Math.floor(Math.random() * REVIEWS.length)])

  useEffect(() => {
    fetchProducts().then((list) => setProducts(list.filter((p) => !p.isSample)))
  }, [])

  const categorySections = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        ...category,
        items: products
          .filter((p) => p.category === category.slug)
          .sort((a, b) => Number(b.featured) - Number(a.featured)),
      })).filter((section) => section.items.length > 0),
    [products],
  )

  return (
    <div className="bg-gray-50/50 font-sans text-slate-900">
      <Container className="py-4 md:py-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
        <div className="animate-fade-up col-span-12 overflow-hidden rounded-[2rem] shadow-sm ring-1 ring-slate-200/70">
          <div className="grid min-h-[520px] lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative overflow-hidden bg-slate-950 px-6 py-10 text-white md:px-12 md:py-14">
              <div className="hero-tape absolute inset-x-0 top-0 h-2" />
              <div className="pointer-events-none absolute -left-16 top-24 h-48 w-48 rounded-full bg-emerald-400/15 blur-3xl" />
              <div className="pointer-events-none absolute -right-10 bottom-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
              <p className="relative mb-6 inline-flex items-center rounded-sm border border-dashed border-white/30 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-emerald-200 uppercase">
                Lot 01 · Food grade · Made for brands
              </p>
              <h1 className="relative max-w-xl text-4xl leading-[0.95] font-bold tracking-tight md:text-6xl">
                Pack it once.
                <span className="mt-1 block bg-gradient-to-r from-sky-300 via-emerald-300 to-lime-300 bg-clip-text text-transparent">
                  Ship it everywhere.
                </span>
              </h1>
              <p className="relative mt-5 max-w-md text-sm leading-relaxed text-slate-300 md:text-base">
                {SITE.description}
              </p>
              <div className="relative mt-6 flex flex-wrap gap-2">
                {['Food-grade film', 'Zipper + window', 'Bulk 50–1000 pcs'].map((stamp) => (
                  <span
                    key={stamp}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white/80 uppercase"
                  >
                    <BadgeCheck className="h-3.5 w-3.5 text-emerald-300" />
                    {stamp}
                  </span>
                ))}
              </div>
              <div className="relative mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/products"
                  className="gradient-btn group inline-flex h-12 items-center rounded-full px-6 text-sm font-semibold text-white md:h-14 md:px-8 md:text-base"
                >
                  View All Products
                  <span className="ml-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 group-hover:rotate-45">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
                <Link
                  to="/bulk-order"
                  className="inline-flex h-12 items-center rounded-full border border-white/20 px-5 text-sm font-semibold text-white hover:bg-white/10 md:h-14"
                >
                  Bulk order
                </Link>
                <Link
                  to="/sample-kit"
                  className="inline-flex h-12 items-center rounded-full border border-white/20 px-5 text-sm font-semibold text-white hover:bg-white/10 md:h-14"
                >
                  Sample kit
                </Link>
              </div>
              <div className="relative mt-10 flex items-center gap-3 text-xs text-slate-400">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
                GST invoicing · COD + prepaid · Free shipping above ₹{SITE.freeShippingFrom.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="packing-grid relative flex min-h-[420px] flex-col justify-between overflow-hidden p-5 md:p-8">
              <div className="absolute top-5 right-5 rotate-6 rounded-sm border-2 border-rose-400/80 px-2 py-1 text-[10px] font-black tracking-[0.18em] text-rose-500 uppercase">
                Handle with care
              </div>
              <div className="relative mx-auto mt-8 flex h-[260px] w-full max-w-sm items-end justify-center md:h-[320px]">
                <div className="absolute top-6 h-52 w-52 rounded-full bg-gradient-to-br from-blue-400/30 via-emerald-300/40 to-transparent blur-2xl md:h-64 md:w-64" />
                <div className="absolute bottom-6 h-8 w-48 rounded-[100%] bg-slate-900/15 blur-md" />
                <img
                  src="/products/pouch-hero.png"
                  alt="Apna Packaging Solution pouches"
                  className="relative z-10 h-full w-full object-contain object-bottom"
                />
              </div>

              <div className="relative z-20 mt-4 grid gap-3 sm:grid-cols-3">
                <div className="animate-hero-float rounded-2xl border border-white/70 bg-white/90 p-3 shadow-lg backdrop-blur">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-emerald-600">1 Lakh+</p>
                    <div className="flex -space-x-1.5">
                      {['A', 'R', 'S'].map((l) => (
                        <span
                          key={l}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-white bg-emerald-100 text-[10px] font-bold text-emerald-800"
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Orders delivered</p>
                  <div className="mt-2 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current text-yellow-400" />
                    ))}
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-slate-600">“{review.text}”</p>
                  <p className="mt-1 text-[11px] font-bold text-slate-900">{review.name}</p>
                </div>

                <div className="animate-hero-float-slow rounded-2xl border border-dashed border-slate-300 bg-white p-3 shadow-md">
                  <span className="inline-flex items-center rounded-sm bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-500 uppercase">
                    <Truck className="mr-1 h-3 w-3" /> Fast
                  </span>
                  <h3 className="mt-2 text-sm font-bold leading-tight">All India Shipping</h3>
                  <p className="mt-1 text-[11px] text-slate-500">Every pincode. Tracked boxes.</p>
                  <Box className="mt-2 h-6 w-6 text-blue-500" />
                </div>

                <Link
                  to="/sample-kit"
                  className="gradient-btn group flex flex-col justify-between rounded-2xl p-3 text-white shadow-md"
                >
                  <span className="text-[10px] font-bold tracking-widest uppercase">Try first</span>
                  <h3 className="text-sm font-bold leading-tight">
                    Sample
                    <br />
                    Kit
                  </h3>
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold">
                    Order now <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:rotate-45" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 grid gap-4 md:grid-cols-3">
          {CATEGORIES.map((c, i) => (
            <Link
              key={c.slug}
              to={`/category/${c.slug}`}
              className={`animate-fade-up group relative min-h-[200px] overflow-hidden rounded-[2rem] bg-white shadow-sm ${
                i === 0 ? 'delay-100' : i === 1 ? 'delay-200' : 'delay-300'
              }`}
            >
              <img src={c.image} alt={c.name} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-[11px] font-semibold tracking-widest text-emerald-200 uppercase">Shop</p>
                <h3 className="text-2xl font-bold">{c.name}</h3>
                <p className="mt-1 text-sm text-white/80">{c.headline}</p>
              </div>
            </Link>
          ))}
        </div>

        <ReelSection />

        {categorySections.map((section) => (
          <div key={section.slug} className="animate-fade-up col-span-12 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold tracking-widest text-emerald-600 uppercase">Shop {section.name}</p>
                <h3 className="mb-1 text-2xl font-bold">{section.name}</h3>
                <p className="text-sm text-slate-500">{section.headline}</p>
              </div>
              <Link
                to={`/category/${section.slug}`}
                className="inline-flex shrink-0 items-center rounded-full px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 md:px-6"
              >
                View All <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {section.items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        ))}

        <div className="animate-fade-up col-span-12 cursor-pointer overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm">
          <Link to="/about" className="block">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold">About Us</h3>
                <p className="text-sm text-slate-500">{SITE.company}</p>
              </div>
              <div className="rounded-full bg-emerald-50 p-2">
                <Building2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-emerald-500" />
                <span>{SITE.phone}</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <MapPin className="mt-1 h-4 w-4 text-green-500" />
                <span>{SITE.address}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Building2 className="h-4 w-4 text-purple-500" />
                <span>GST: {SITE.gst}</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
      </Container>
    </div>
  )
}
