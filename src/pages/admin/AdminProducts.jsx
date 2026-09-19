import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Copy, Plus, Search } from 'lucide-react'
import { CATEGORIES, formatPiece } from '@/data/catalog'
import { adminDeleteProduct, adminDuplicateProduct, adminFetchProducts, adminSaveProduct } from '@/services/admin'
import { ConfirmDialog, EmptyState, PageHeader, Pagination, SkeletonRows, StatusBadge } from '@/components/admin/AdminUi'

const PER_PAGE = 8

export default function AdminProducts() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [stock, setStock] = useState('all')
  const [cat, setCat] = useState('all')
  const [page, setPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState(null)

  async function refresh() {
    const data = await adminFetchProducts()
    setList(data)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return list.filter((p) => {
      const match =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query) ||
        (p.badge || '').toLowerCase().includes(query) ||
        (p.category || '').includes(query)
      const stockOk = stock === 'all' || (stock === 'in' ? p.inStock !== false : p.inStock === false)
      const catOk = cat === 'all' || p.category === cat
      return match && stockOk && catOk
    })
  }, [list, q, stock, cat])

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, pages)
  const rows = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  async function remove() {
    if (!pendingDelete) return
    await adminDeleteProduct(pendingDelete.id)
    toast.success('Product deleted')
    setPendingDelete(null)
    refresh()
  }

  async function duplicate(id) {
    await adminDuplicateProduct(id)
    toast.success('Duplicate created')
    refresh()
  }

  async function toggleStock(p) {
    await adminSaveProduct({ ...p, inStock: p.inStock === false })
    toast.success(p.inStock === false ? 'Marked in stock' : 'Marked out of stock')
    refresh()
  }

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Products"
        subtitle="Create pouches, boxes and labels. Upload photos and set size / colour / pack pricing."
        actions={
          <Link to="/admin/products/new" className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" /> Add product
          </Link>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(1)
            }}
            placeholder="Search name, slug, badge"
            className="h-10 w-72 rounded-xl border border-slate-200 bg-white pr-3 pl-9 text-sm outline-none focus:border-emerald-500"
          />
        </div>
        <select
          value={cat}
          onChange={(e) => {
            setCat(e.target.value)
            setPage(1)
          }}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={stock}
          onChange={(e) => {
            setStock(e.target.value)
            setPage(1)
          }}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="all">All stock</option>
          <option value="in">In stock</option>
          <option value="out">Out of stock</option>
        </select>
      </div>

      {filtered.length === 0 && !loading ? (
        <div className="mt-6">
          <EmptyState
            title="No products match"
            hint="Add a pouch or clear search filters."
            action={
              <Link to="/admin/products/new" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                Add product
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Flags</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            {loading ? (
              <SkeletonRows cols={5} />
            ) : (
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0]} alt="" className="h-12 w-12 rounded-lg bg-slate-100 object-cover" />
                        <div>
                      <p className="font-semibold text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{p.category} · {p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{p.basePrice === 0 ? 'Free' : `${formatPiece(p.basePrice)} / ${p.isSample ? 'kit' : 'pc'}`}</td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => toggleStock(p)}>
                        <StatusBadge value={p.inStock === false ? 'out_of_stock' : 'in_stock'} />
                      </button>
                      <span className="ml-2 text-xs text-slate-400">{p.inStock === false ? 'Out' : 'In stock'}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {p.featured ? 'Featured' : '—'}
                      {p.isSample ? ' · Sample' : ''}
                      {p.badge ? ` · ${p.badge}` : ''}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/products/${p.id}`} className="mr-3 font-medium text-emerald-700">
                        Edit
                      </Link>
                      <button type="button" onClick={() => duplicate(p.id)} className="mr-3 text-slate-500 hover:text-slate-800" title="Duplicate">
                        <Copy className="inline h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => setPendingDelete(p)} className="font-medium text-rose-600">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
          <Pagination page={safePage} pages={pages} total={filtered.length} onPage={setPage} />
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete product?"
        body={`${pendingDelete?.name || ''} will be removed from the storefront catalogue.`}
        onClose={() => setPendingDelete(null)}
        onConfirm={remove}
      />
    </div>
  )
}
