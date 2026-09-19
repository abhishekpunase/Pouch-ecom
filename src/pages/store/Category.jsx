import { useEffect, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { CATEGORIES } from '@/data/catalog'
import { fetchProducts } from '@/services/supabase'
import ProductCard from '@/components/catalog/ProductCard'

export default function Category() {
  const { slug } = useParams()
  const category = CATEGORIES.find((c) => c.slug === slug)
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchProducts().then((data) => {
      setList(data)
      setLoading(false)
    })
  }, [slug])

  const items = useMemo(() => list.filter((p) => p.category === slug && !p.isSample), [list, slug])

  if (!category) {
    return <Navigate to="/products" replace />
  }

  return (
    <div>
      <div className="relative h-56 overflow-hidden md:h-72">
        <img src={category.image} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-slate-900/10" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-8 text-white">
          <p className="text-sm font-medium text-emerald-200">Category</p>
          <h1 className="text-4xl font-bold">{category.name}</h1>
          <p className="mt-2 max-w-xl text-white/80">{category.description}</p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
