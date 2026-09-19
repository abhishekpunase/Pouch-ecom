import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { isAdminSession, verifyAdminSession } from '@/services/admin'

export default function AdminGuard({ children }) {
  const [state, setState] = useState(isAdminSession() ? 'checking' : 'no')

  useEffect(() => {
    if (!isAdminSession()) {
      setState('no')
      return
    }
    verifyAdminSession().then((ok) => setState(ok ? 'ok' : 'no'))
  }, [])

  if (state === 'no') return <Navigate to="/admin/login" replace />
  if (state === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-400">Verifying session…</p>
        </div>
      </div>
    )
  }
  return children
}
