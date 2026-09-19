import { useEffect, useRef, useState } from 'react'
import { Camera, LifeBuoy, LogOut, MapPin, MessageCircle, Package, Pencil, Plus, Trash2, User } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { StatusBadge } from '@/components/admin/AdminUi'
import { formatInr } from '@/data/catalog'
import { useAuth } from '@/context/AuthContext'
import { fetchOrders } from '@/services/supabase'
import { getLocalAvatar, isValidPhone, normalizePhone, removeAvatar, uploadAvatar } from '@/services/profile'
import { whatsappUrl } from '@/utils/whatsapp'

const input =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
const primaryBtn =
  'gradient-btn inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold text-white disabled:opacity-60'
const ghostBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60'
const emptyAddress = { label: 'Home', name: '', phone: '', address: '', city: '', state: '', pincode: '' }

export default function Account() {
  const { user, signOut, loading, updateProfile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [orders, setOrders] = useState([])

  useEffect(() => {
    if (!loading && !user) navigate('/sign-in')
  }, [user, loading, navigate])

  useEffect(() => {
    if (!user) return
    fetchOrders(user.id === 'local' ? null : user.id, user.email)
      .then(setOrders)
      .catch(() => setOrders([]))
  }, [user])

  if (!user) return null

  const meta = user.user_metadata || {}
  const displayName = meta.full_name || user.email?.split('@')[0] || 'Customer'

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-8">
      {location.state?.orderId && (
        <p className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">Order placed. Reference: {location.state.orderId}</p>
      )}

      <Banner user={user} name={displayName} onSignOut={() => { signOut(); navigate('/') }} updateProfile={updateProfile} />

      <div className="grid gap-5 sm:grid-cols-2">
        <QuickCard
          icon={Package}
          title="Orders"
          text={orders.length ? `You have ${orders.length} order${orders.length > 1 ? 's' : ''}. Track payment and shipping status.` : 'View your recent orders, payment status and shipping updates.'}
          action={<a href="#orders" className="text-sm font-semibold text-emerald-700 hover:underline">View Orders →</a>}
        />
        <QuickCard
          icon={LifeBuoy}
          title="Help & Support"
          text="Questions about an order or a bulk quote? Message our team and we will reply quickly."
          action={
            <span className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
              <Link to="/account/support" className="text-emerald-700 hover:underline">Support tickets →</Link>
              <Link to="/contact" className="text-emerald-700 hover:underline">Contact us →</Link>
              <a href={whatsappUrl(`Hi, I need help with my account (${user.email})`)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-700 hover:underline">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </span>
          }
        />
      </div>

      <ProfileCard user={user} name={displayName} updateProfile={updateProfile} />
      <AddressesCard addresses={meta.addresses || []} defaults={{ name: displayName, phone: meta.phone || '' }} updateProfile={updateProfile} />
      <OrdersSection orders={orders} />
    </div>
  )
}

/* ------------------------------------------------------------ banner + avatar */

function Banner({ user, name, onSignOut, updateProfile }) {
  const fileRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [deviceAvatar, setDeviceAvatar] = useState(() => getLocalAvatar(user.id))
  const src = user.user_metadata?.avatar_url || deviceAvatar
  const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  async function onPick(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      const res = await uploadAvatar(user, file)
      if (res.deviceOnly) {
        setDeviceAvatar(res.dataUrl)
        toast.success('Photo updated (saved on this device only)')
      } else {
        await updateProfile({ avatar_url: res.url })
        setDeviceAvatar('')
        toast.success('Profile picture updated')
      }
    } catch (err) {
      toast.error(err.message || 'Could not update picture')
    } finally {
      setBusy(false)
    }
  }

  async function onRemove() {
    setBusy(true)
    try {
      await removeAvatar(user)
      setDeviceAvatar('')
      if (user.user_metadata?.avatar_url) await updateProfile({ avatar_url: null })
      toast.success('Profile picture removed')
    } catch (err) {
      toast.error(err.message || 'Could not remove picture')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] p-6 text-white shadow-lg sm:p-8" style={{ background: 'linear-gradient(100deg,#2563eb,#22c55e)' }}>
      <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/10" />
      <div className="relative flex flex-wrap items-center gap-5">
        <div className="relative shrink-0">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white/25 text-3xl font-bold ring-4 ring-white/50">
            {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : initials || <User className="h-10 w-10" />}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            aria-label="Change profile picture"
            className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-white text-emerald-700 shadow-md hover:bg-emerald-50 disabled:opacity-60"
          >
            <Camera className="h-4 w-4" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-white/80 uppercase">Welcome back</p>
          <h1 className="truncate text-2xl font-bold sm:text-3xl">{name}</h1>
          <p className="mt-1 truncate text-sm text-white/85">{user.email}</p>
          {src && (
            <button type="button" onClick={onRemove} disabled={busy} className="mt-2 text-xs font-medium text-white/80 underline-offset-2 hover:underline">
              Remove photo
            </button>
          )}
        </div>
        <button type="button" onClick={onSignOut} className="inline-flex items-center gap-1.5 self-start rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white/30">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </section>
  )
}

function QuickCard({ icon: Icon, title, text, action }) {
  return (
    <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
      <IconTile icon={Icon} />
      <h2 className="mt-3 font-bold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
      <div className="mt-3">{action}</div>
    </div>
  )
}

function IconTile({ icon: Icon }) {
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
      <Icon className="h-5 w-5" />
    </span>
  )
}

function CardHeader({ icon, title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <IconTile icon={icon} />
        <div>
          <h2 className="font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  )
}

/* ------------------------------------------------------------ profile */

function ProfileCard({ user, name, updateProfile }) {
  const meta = user.user_metadata || {}
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '' })

  function startEdit() {
    setForm({ full_name: meta.full_name || name, phone: meta.phone || '' })
    setEditing(true)
  }

  async function save(e) {
    e.preventDefault()
    const full_name = form.full_name.trim()
    if (!full_name) return toast.error('Please enter your name')
    if (form.phone && !isValidPhone(form.phone)) return toast.error('Enter a valid 10-digit phone number')
    setSaving(true)
    try {
      await updateProfile({ full_name, phone: normalizePhone(form.phone) })
      toast.success('Profile updated')
      setEditing(false)
    } catch (err) {
      toast.error(err.message || 'Could not save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-[1.5rem] bg-white p-5 shadow-sm sm:p-6">
      <CardHeader
        icon={User}
        title="My Profile"
        subtitle="Personal information"
        action={!editing && <button type="button" onClick={startEdit} className={ghostBtn}><Pencil className="h-3.5 w-3.5" /> Edit</button>}
      />
      {editing ? (
        <form onSubmit={save} className="mt-5 space-y-3">
          <Field label="Full name"><input className={input} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required /></Field>
          <Field label="Email"><input className={`${input} bg-slate-50 text-slate-500`} value={user.email || ''} disabled /></Field>
          <Field label="Phone"><input className={input} inputMode="tel" placeholder="10-digit mobile number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving} className={primaryBtn}>{saving ? 'Saving…' : 'Save changes'}</button>
            <button type="button" onClick={() => setEditing(false)} className={ghostBtn}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="mt-5 space-y-3">
          <InfoRow label="Full name" value={meta.full_name || name} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Phone" value={meta.phone || 'Not added yet'} muted={!meta.phone} />
        </div>
      )}
    </section>
  )
}

function InfoRow({ label, value, muted }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className={`mt-0.5 text-sm font-medium ${muted ? 'text-slate-400' : 'text-slate-900'}`}>{value}</p>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <span className="mt-1 block">{children}</span>
    </label>
  )
}

/* ------------------------------------------------------------ addresses */

function AddressesCard({ addresses, defaults, updateProfile }) {
  const [form, setForm] = useState(null) // null = closed, object = add/edit form
  const [saving, setSaving] = useState(false)

  async function persist(next, message) {
    setSaving(true)
    try {
      await updateProfile({ addresses: next })
      toast.success(message)
      setForm(null)
    } catch (err) {
      toast.error(err.message || 'Could not save address')
    } finally {
      setSaving(false)
    }
  }

  function submit(e) {
    e.preventDefault()
    if (!/^\d{6}$/.test(form.pincode)) return toast.error('Pincode must be 6 digits')
    if (!isValidPhone(form.phone)) return toast.error('Enter a valid 10-digit phone number')
    const clean = { ...form, phone: normalizePhone(form.phone) }
    if (form.id) {
      return persist(addresses.map((a) => (a.id === form.id ? { ...a, ...clean } : a)), 'Address updated')
    }
    if (addresses.length >= 5) return toast.error('You can save up to 5 addresses')
    const entry = { ...clean, id: crypto.randomUUID(), isDefault: addresses.length === 0 }
    persist([...addresses, entry], 'Address saved')
  }

  function remove(id) {
    const left = addresses.filter((a) => a.id !== id)
    if (left.length && !left.some((a) => a.isDefault)) left[0] = { ...left[0], isDefault: true }
    persist(left, 'Address removed')
  }

  function makeDefault(id) {
    persist(addresses.map((a) => ({ ...a, isDefault: a.id === id })), 'Default address changed')
  }

  return (
    <section className="rounded-[1.5rem] bg-white p-5 shadow-sm sm:p-6">
      <CardHeader
        icon={MapPin}
        title="Saved Addresses"
        subtitle="Manage delivery locations"
        action={!form && <button type="button" onClick={() => setForm({ ...emptyAddress, ...defaults })} className={primaryBtn}><Plus className="h-4 w-4" /> Add Address</button>}
      />

      {form && (
        <form onSubmit={submit} className="mt-5 space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex gap-2">
            {['Home', 'Office', 'Other'].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setForm({ ...form, label: l })}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold ${form.label === l ? 'gradient-btn text-white' : 'border border-slate-200 bg-white text-slate-600'}`}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input required className={input} placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required className={input} inputMode="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <input required className={input} placeholder="Address (house no, street, area)" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <div className="grid gap-3 sm:grid-cols-3">
            <input required className={input} placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <input required className={input} placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            <input required className={input} placeholder="Pincode" maxLength={6} inputMode="numeric" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '') })} />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving} className={primaryBtn}>{saving ? 'Saving…' : form.id ? 'Update address' : 'Save address'}</button>
            <button type="button" onClick={() => setForm(null)} className={ghostBtn}>Cancel</button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !form ? (
        <div className="mt-5 flex h-32 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 text-sm text-slate-500">
          No Saved Address
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {addresses.map((a) => (
            <li key={a.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">{a.label}</span>
                  {a.isDefault && <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">Default</span>}
                </div>
                <div className="flex items-center gap-1 text-xs font-medium">
                  {!a.isDefault && <button type="button" onClick={() => makeDefault(a.id)} className="rounded-full px-2.5 py-1 text-slate-600 hover:bg-slate-100">Set default</button>}
                  <button type="button" onClick={() => setForm({ ...a })} className="rounded-full p-1.5 text-slate-600 hover:bg-slate-100" aria-label="Edit address"><Pencil className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => remove(a.id)} className="rounded-full p-1.5 text-rose-600 hover:bg-rose-50" aria-label="Delete address"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900">{a.name} · {a.phone}</p>
              <p className="text-sm text-slate-600">{a.address}, {a.city}, {a.state} - {a.pincode}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/* ------------------------------------------------------------ orders */

function OrdersSection({ orders }) {
  return (
    <section id="orders" className="scroll-mt-24 rounded-[1.5rem] bg-white p-5 shadow-sm sm:p-6">
      <CardHeader icon={Package} title="My Orders" subtitle="Payment and shipping status" />
      {orders.length === 0 ? (
        <p className="mt-5 rounded-2xl border-2 border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
          No orders yet.{' '}
          <Link to="/products" className="font-semibold text-emerald-700">Shop now</Link>
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {orders.map((o) => {
            const items = o.items?.length ? o.items : [{ name: 'Order item', qty: 1, price: Number(o.total || 0), image: '/products/pouch-gold-glossy.png', sizeLabel: '', colourLabel: '', packLabel: '1 item' }]
            const itemTotal = items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 1)), 0)
            const totalLabel = formatInr(itemTotal || Number(o.total || 0))

            return (
              <div key={o.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="break-all text-sm font-semibold text-slate-800">#{String(o.id).slice(0, 8)}</span>
                  <div className="flex items-center gap-2">
                    <StatusBadge value={o.status} />
                    <StatusBadge value={o.payment_status} />
                  </div>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  {new Date(o.created_at).toLocaleString('en-IN')} · {o.payment_method}
                </p>

                {items.map((item, idx) => {
                  const price = Number(item.price || 0)
                  const qty = Number(item.qty || 1)
                  const lineTotal = price * qty
                  const itemMeta = [item.sizeLabel, item.colourLabel, item.packLabel].filter(Boolean).join(' · ')
                  const unitLabel = item.packId === 'pcs' ? 'pc' : item.packLabel || 'unit'

                  return (
                    <div key={`${o.id}-${item.key || idx}`} className="mt-4 flex items-center gap-4 rounded-[1.25rem] border border-slate-200 bg-white p-3">
                      <div className="h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                        <img
                          src={item.image || item.images?.[0] || '/products/pouch-gold-glossy.png'}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-bold text-slate-900">{item.name}</h3>
                        <p className="mt-1 text-sm text-slate-500">{itemMeta || 'Standard pack'}</p>
                        <p className="mt-2 text-lg font-bold text-slate-900">
                          {formatInr(price)}
                          <span className="ml-1 text-sm font-medium text-slate-500">/ {unitLabel}</span>
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 px-2 py-1 text-sm font-medium text-slate-700">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full text-lg leading-none">−</span>
                          <span>{qty}</span>
                          <span className="flex h-6 w-6 items-center justify-center rounded-full text-lg leading-none">+</span>
                        </div>
                        <div className="min-w-[72px] text-right">
                          <p className="text-base font-bold text-slate-900">{formatInr(lineTotal)}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
                  <div className="text-sm text-slate-500">{items.reduce((count, item) => count + Number(item.qty || 1), 0)} item{items.reduce((count, item) => count + Number(item.qty || 1), 0) > 1 ? 's' : ''}</div>
                  <div className="text-lg font-bold text-slate-900">Total {totalLabel}</div>
                </div>

                {o.awb && (
                  <p className="mt-3 text-sm text-emerald-700">
                    Shiprocket AWB {o.awb}
                    {o.tracking_url && (
                      <>
                        {' · '}
                        <a href={o.tracking_url} target="_blank" rel="noreferrer" className="underline">Track</a>
                      </>
                    )}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
