import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { SITE } from '@/data/catalog'

export default function Auth({ mode }) {
  const isSignUp = mode === 'sign-up'
  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (user) navigate('/account', { replace: true })
  }, [user, navigate])

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      if (isSignUp) await signUp(form.email, form.password, form.name)
      else await signIn(form.email, form.password)
      toast.success(isSignUp ? 'Account created' : 'Signed in')
      navigate(location.state?.from || '/account')
    } catch (err) {
      toast.error(err.message || 'Auth failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl justify-center px-4 py-16">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">{isSignUp ? 'Create account' : 'Sign in'}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {isSignUp ? `Join ${SITE.name} to track orders.` : 'Welcome back.'}
        </p>
        {isSignUp && (
          <>
            <label className="mt-6 block text-sm font-medium">Full name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-xl border px-4 py-2.5"
            />
          </>
        )}
        <label className="mt-4 block text-sm font-medium">Email</label>
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="mt-1 w-full rounded-xl border px-4 py-2.5"
        />
        <label className="mt-4 block text-sm font-medium">Password</label>
        <input
          required
          type="password"
          minLength={6}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="mt-1 w-full rounded-xl border px-4 py-2.5"
        />
        <button type="submit" disabled={busy} className="gradient-btn mt-6 w-full rounded-full py-3 text-sm font-semibold text-white">
          {busy ? 'Please wait…' : isSignUp ? 'Sign up' : 'Sign in'}
        </button>
        <p className="mt-4 text-center text-sm text-slate-500">
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <Link to="/sign-in" className="font-medium text-emerald-700">
                Sign in
              </Link>
            </>
          ) : (
            <>
              New here?{' '}
              <Link to="/sign-up" className="font-medium text-emerald-700">
                Create account
              </Link>
            </>
          )}
        </p>
      </form>
    </div>
  )
}
