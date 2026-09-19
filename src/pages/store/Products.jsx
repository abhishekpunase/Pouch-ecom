import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CATEGORIES } from '@/data/catalog'
import { fetchProducts } from '@/services/supabase'
import ProductCard from '@/components/catalog/ProductCard'

export default function Products() {
  const [params, setParams] = useSearchParams()
  const q = (params.get('q') || '').toLowerCase()
  const cat = params.get('cat') || 'all'
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('featured')

  useEffect(() => {
    fetchProducts().then((data) => {
      setList(data.filter((p) => !p.isSample))
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    let items = [...list]
    if (cat !== 'all') items = items.filter((p) => p.category === cat)
    if (q) {
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.category.includes(q),
      )
    }
    if (sort === 'price-asc') {
      items.sort((a, b) => a.basePrice - b.basePrice)
    } else if (sort === 'price-desc') {
      items.sort((a, b) => b.basePrice - a.basePrice)
    } else if (sort === 'rating') {
      items.sort((a, b) => b.rating - a.rating)
    } else {
      items.sort((a, b) => Number(b.featured) - Number(a.featured))
    }
    return items
  }, [list, q, sort, cat])

  function setCat(next) {
    const nextParams = new URLSearchParams(params)
    if (next === 'all') nextParams.delete('cat')
    else nextParams.set('cat', next)
    setParams(nextParams)
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-700">Catalog</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">All Products</h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Shop pouches, boxes and labels. Choose size, colour and pack pieces on every product.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCat('all')}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              cat === 'all' ? 'bg-emerald-600 text-white' : 'border border-slate-200 bg-white text-slate-600'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCat(c.slug)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                cat === c.slug ? 'bg-emerald-600 text-white' : 'border border-slate-200 bg-white text-slate-600'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm"
        >
          <option value="featured">Featured</option>
          <option value="rating">Top rated</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>

      {q && (
        <p className="mb-4 text-sm text-slate-500">
          Showing results for “{params.get('q')}”
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-[2rem] bg-white p-10 text-center text-slate-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
