import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ImagePlus, Plus, Trash2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { CATEGORIES } from '@/data/catalog'
import { adminFetchProducts, adminSaveProduct } from '@/services/admin'
import { uploadProductImages } from '@/services/api'
import { fieldClass, PageHeader, SectionCard } from '@/components/admin/AdminUi'

const empty = {
  id: '',
  slug: '',
  name: '',
  category: 'pouches',
  badge: '',
  featured: false,
  inStock: true,
  isSample: false,
  basePrice: 5,
  rating: 4.8,
  reviews: 0,
  shortDescription: '',
  description: '',
  images: [],
  features: ['Food Grade', 'Airtight Zipper'],
  sizes: [
    { id: '50g', label: '50–70g', dim: '95 × 150 × 60 mm', multiplier: 1 },
    { id: '100g', label: '100–150g', dim: '120 × 200 × 80 mm', multiplier: 1.25 },
  ],
  colours: [{ id: 'clear', label: 'Clear', hex: '#e5e7eb' }],
  packs: [
    { id: '50', pieces: 50, label: '50 pcs', multiplier: 1 },
    { id: '100', pieces: 100, label: '100 pcs', multiplier: 0.92 },
  ],
}

function parseImageList(text) {
  return String(text || '')
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function AdminProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const isNew = id === 'new' || !id
  const [form, setForm] = useState(empty)
  const [imageText, setImageText] = useState('')
  const [featureText, setFeatureText] = useState('Food Grade, Airtight Zipper')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [loaded, setLoaded] = useState(isNew)

  const images = parseImageList(imageText)

  useEffect(() => {
    if (isNew) {
      setForm({ ...empty, id: `pouch-${Date.now()}` })
      setLoaded(true)
      return
    }
    adminFetchProducts().then((list) => {
      const found = list.find((p) => p.id === id)
      if (!found) {
        toast.error('Product not found')
        navigate('/admin/products')
        return
      }
      setForm({ ...empty, ...found })
      setImageText((found.images || []).join('\n'))
      setFeatureText((found.features || []).join(', '))
      setLoaded(true)
    })
  }, [id, isNew, navigate])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function patchList(field, index, key, value) {
    setForm((f) => ({
      ...f,
      [field]: (f[field] || []).map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    }))
  }

  function addRow(field, row) {
    setForm((f) => ({ ...f, [field]: [...(f[field] || []), row] }))
  }

  function removeRow(field, index) {
    setForm((f) => ({ ...f, [field]: (f[field] || []).filter((_, i) => i !== index) }))
  }

  function addImageUrls(urls) {
    setImageText((prev) => {
      const next = [...parseImageList(prev)]
      urls.forEach((url) => {
        if (url && !next.includes(url)) next.push(url)
      })
      return next.join('\n')
    })
  }

  function moveImage(url, dir) {
    const list = parseImageList(imageText)
    const i = list.indexOf(url)
    const j = i + dir
    if (i < 0 || j < 0 || j >= list.length) return
    ;[list[i], list[j]] = [list[j], list[i]]
    setImageText(list.join('\n'))
  }

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'))
    if (!files.length) {
      toast.error('Choose an image file (JPG, PNG, WebP)')
      return
    }
    setUploading(true)
    try {
      const uploaded = await uploadProductImages(files)
      addImageUrls(uploaded.map((f) => f.url))
      toast.success(uploaded.length === 1 ? 'Image uploaded' : `${uploaded.length} images uploaded`)
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await adminSaveProduct({
        ...form,
        slug: form.slug || slugify(form.name),
        images,
        features: featureText.split(',').map((s) => s.trim()).filter(Boolean),
        basePrice: Number(form.basePrice),
        rating: Number(form.rating || 0),
        reviews: Number(form.reviews || 0),
        sizes: (form.sizes || []).map((s) => ({ ...s, multiplier: Number(s.multiplier || 1) })),
        packs: (form.packs || []).map((p) => ({
          ...p,
          pieces: Number(p.pieces || 1),
          multiplier: Number(p.multiplier || 1),
        })),
      })
      toast.success('Product saved')
      navigate('/admin/products')
    } catch (err) {
      toast.error(err.message || 'Could not save product')
    } finally {
      setSaving(false)
    }
  }

  if (!loaded) return <p className="text-sm text-slate-500">Loading product…</p>

  return (
    <div className="max-w-4xl">
      <PageHeader
        eyebrow="Catalogue"
        title={isNew ? 'Add product' : 'Edit product'}
        subtitle="Images, pricing, sizes, colours and pack quantities shown on the storefront."
        actions={
          <Link to="/admin/products" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium">
            Cancel
          </Link>
        }
      />

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <SectionCard title="Basics">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => {
                  set('name', e.target.value)
                  if (isNew) set('slug', slugify(e.target.value))
                }}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium">URL slug</label>
              <input value={form.slug} onChange={(e) => set('slug', e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select value={form.category || 'pouches'} onChange={(e) => set('category', e.target.value)} className={fieldClass}>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Badge</label>
              <input value={form.badge || ''} onChange={(e) => set('badge', e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className="text-sm font-medium">Price / piece (₹)</label>
              <input type="number" step="0.01" value={form.basePrice} onChange={(e) => set('basePrice', e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className="text-sm font-medium">Rating</label>
              <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => set('rating', e.target.value)} className={fieldClass} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Short description</label>
              <input value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} className={fieldClass} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} className={fieldClass} />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-5 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.inStock !== false} onChange={(e) => set('inStock', e.target.checked)} />
              In stock
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={Boolean(form.featured)} onChange={(e) => set('featured', e.target.checked)} />
              Featured on home
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={Boolean(form.isSample)} onChange={(e) => set('isSample', e.target.checked)} />
              Sample kit
            </label>
          </div>
        </SectionCard>

        <SectionCard title="Images" hint="First image is the catalogue thumbnail. Upload files or paste URLs.">
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              handleFiles(e.dataTransfer.files)
            }}
            className={`rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
              dragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <ImagePlus className="mx-auto h-8 w-8 text-emerald-600" />
            <p className="mt-2 text-sm font-medium">Drag & drop images here</p>
            <p className="mt-1 text-xs text-slate-500">JPG, PNG, WebP · up to 5 MB each</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading…' : 'Upload images'}
            </button>
          </div>

          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {images.map((url, index) => (
                <div key={url} className="relative overflow-hidden rounded-xl border bg-slate-50">
                  {index === 0 && (
                    <span className="absolute top-1.5 left-1.5 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold text-white">
                      Cover
                    </span>
                  )}
                  <img src={url} alt="" className="aspect-square w-full object-cover" />
                  <div className="absolute right-1.5 bottom-1.5 flex gap-1">
                    <button type="button" onClick={() => moveImage(url, -1)} className="rounded-full bg-white/90 p-1" aria-label="Move left">
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => moveImage(url, 1)} className="rounded-full bg-white/90 p-1" aria-label="Move right">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => setImageText(images.filter((u) => u !== url).join('\n'))} className="rounded-full bg-white/90 p-1 text-rose-600">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <label className="mt-4 block text-sm font-medium">Image URLs (one per line)</label>
          <textarea rows={3} value={imageText} onChange={(e) => setImageText(e.target.value)} className={fieldClass} />
        </SectionCard>

        <SectionCard
          title="Sizes"
          hint="Multiplier adjusts the per-piece price."
          actions={
            <button
              type="button"
              onClick={() => addRow('sizes', { id: `s-${Date.now()}`, label: '', dim: '', multiplier: 1 })}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"
            >
              <Plus className="h-3.5 w-3.5" /> Add size
            </button>
          }
        >
          <div className="space-y-2">
            {(form.sizes || []).map((row, i) => (
              <div key={row.id || i} className="grid grid-cols-12 items-center gap-2">
                <input value={row.id} onChange={(e) => patchList('sizes', i, 'id', e.target.value)} placeholder="id" className={`${fieldClass} col-span-2 mt-0`} />
                <input value={row.label} onChange={(e) => patchList('sizes', i, 'label', e.target.value)} placeholder="Label" className={`${fieldClass} col-span-3 mt-0`} />
                <input value={row.dim || ''} onChange={(e) => patchList('sizes', i, 'dim', e.target.value)} placeholder="Dimensions" className={`${fieldClass} col-span-4 mt-0`} />
                <input type="number" step="0.01" value={row.multiplier} onChange={(e) => patchList('sizes', i, 'multiplier', e.target.value)} className={`${fieldClass} col-span-2 mt-0`} />
                <button type="button" onClick={() => removeRow('sizes', i)} className="col-span-1 text-rose-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Colours"
          actions={
            <button
              type="button"
              onClick={() => addRow('colours', { id: `c-${Date.now()}`, label: '', hex: '#cccccc' })}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"
            >
              <Plus className="h-3.5 w-3.5" /> Add colour
            </button>
          }
        >
          <div className="space-y-2">
            {(form.colours || []).map((row, i) => (
              <div key={row.id || i} className="grid grid-cols-12 items-center gap-2">
                <input value={row.id} onChange={(e) => patchList('colours', i, 'id', e.target.value)} placeholder="id" className={`${fieldClass} col-span-3 mt-0`} />
                <input value={row.label} onChange={(e) => patchList('colours', i, 'label', e.target.value)} placeholder="Label" className={`${fieldClass} col-span-5 mt-0`} />
                <input type="color" value={row.hex || '#cccccc'} onChange={(e) => patchList('colours', i, 'hex', e.target.value)} className="col-span-2 h-10 w-full rounded-lg border" />
                <button type="button" onClick={() => removeRow('colours', i)} className="col-span-2 text-rose-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Pack quantities"
          hint="Pieces × multiplier = bulk rate on the product page."
          actions={
            <button
              type="button"
              onClick={() => addRow('packs', { id: `p-${Date.now()}`, pieces: 50, label: '50 pcs', multiplier: 1 })}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"
            >
              <Plus className="h-3.5 w-3.5" /> Add pack
            </button>
          }
        >
          <div className="space-y-2">
            {(form.packs || []).map((row, i) => (
              <div key={row.id || i} className="grid grid-cols-12 items-center gap-2">
                <input value={row.id} onChange={(e) => patchList('packs', i, 'id', e.target.value)} placeholder="id" className={`${fieldClass} col-span-2 mt-0`} />
                <input type="number" value={row.pieces} onChange={(e) => patchList('packs', i, 'pieces', e.target.value)} className={`${fieldClass} col-span-2 mt-0`} />
                <input value={row.label} onChange={(e) => patchList('packs', i, 'label', e.target.value)} placeholder="Label" className={`${fieldClass} col-span-5 mt-0`} />
                <input type="number" step="0.01" value={row.multiplier} onChange={(e) => patchList('packs', i, 'multiplier', e.target.value)} className={`${fieldClass} col-span-2 mt-0`} />
                <button type="button" onClick={() => removeRow('packs', i)} className="col-span-1 text-rose-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Features">
          <label className="text-sm font-medium">Comma separated</label>
          <input value={featureText} onChange={(e) => setFeatureText(e.target.value)} className={fieldClass} />
        </SectionCard>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="gradient-btn rounded-full px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? 'Saving…' : 'Save product'}
          </button>
          <Link to="/admin/products" className="text-sm text-slate-500">
            Discard
          </Link>
        </div>
      </form>
    </div>
  )
}
