import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Infinity, Lock, ShieldCheck } from 'lucide-react'
import { Toaster, toast } from 'sonner'
import { adminLogin, DEFAULT_ADMIN_EMAIL, isAdminSession } from '@/services/admin'
import { fieldClass } from '@/components/admin/AdminUi'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState(DEFAULT_ADMIN_EMAIL)
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)

  if (isAdminSession()) return <Navigate to="/admin" replace />

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await adminLogin(email, password)
      toast.success('Welcome back')
      navigate('/admin')
    } catch (err) {
      toast.error(err.message || 'Could not sign in. Is the API running?')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <Toaster richColors position="top-center" />
      <div className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.28),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.22),transparent_40%)]" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-btn">
              <Infinity className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs tracking-[0.2em] text-emerald-300 uppercase">Apna Packaging</p>
              <p className="text-lg font-bold">Operations console</p>
            </div>
          </div>
          <h1 className="mt-16 max-w-md text-4xl font-bold leading-tight">Run catalogue, payments and shipping from one desk.</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
            Razorpay settlements, Shiprocket AWBs, inventory and customer messages — secured with a server-signed admin session.
          </p>
        </div>
        <ul className="relative space-y-3 text-sm text-slate-300">
          {[
            'HMAC session token · 12 hour expiry',
            'Razorpay checkout + Shiprocket booking',
            'Product images, variants and bulk CSV export',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center justify-center bg-slate-100 p-6">
        <form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-btn text-white">
              <Infinity className="h-4 w-4" />
            </span>
            <p className="font-bold">Apna Packaging Admin</p>
          </div>
          <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase">Sign in</p>
          <h2 className="mt-1 text-2xl font-bold">Admin access</h2>
          <p className="mt-1 text-sm text-slate-500">Use the credentials in your server `.env` file.</p>
          <label className="mt-6 block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
          />
          <label className="mt-4 block text-sm font-medium">Password</label>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${fieldClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              aria-label={show ? 'Hide password' : 'Show password'}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="gradient-btn mt-6 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Lock className="h-4 w-4" />
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="mt-4 text-center text-xs text-slate-400">
            Storefront stays public.{' '}
            <Link to="/" className="text-emerald-700 hover:underline">
              Back to shop
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
