import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '@/services/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      try {
        const saved = JSON.parse(localStorage.getItem('pi-user') || 'null')
        setUser(saved)
      } catch {
        setUser(null)
      }
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const api = useMemo(
    () => ({
      user,
      loading,
      async signUp(email, password, fullName, phone = '') {
        if (!isSupabaseConfigured) {
          const demo = { id: 'local', email, user_metadata: { full_name: fullName, phone } }
          localStorage.setItem('pi-user', JSON.stringify(demo))
          setUser(demo)
          return { user: demo }
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, phone } },
        })
        if (error) throw error
        return data
      },
      async signIn(email, password) {
        if (!isSupabaseConfigured) {
          const demo = { id: 'local', email, user_metadata: { full_name: email.split('@')[0] } }
          localStorage.setItem('pi-user', JSON.stringify(demo))
          setUser(demo)
          return { user: demo }
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        return data
      },
      // Saves profile fields (full_name, phone, avatar_url, addresses) in the user's metadata.
      async updateProfile(patch) {
        if (!isSupabaseConfigured || user?.id === 'local') {
          const next = { ...user, user_metadata: { ...user?.user_metadata, ...patch } }
          localStorage.setItem('pi-user', JSON.stringify(next))
          setUser(next)
          return next
        }
        const { data, error } = await supabase.auth.updateUser({ data: patch })
        if (error) throw error
        setUser(data.user)
        return data.user
      },
      async signOut() {
        if (!isSupabaseConfigured) {
          localStorage.removeItem('pi-user')
          setUser(null)
          return
        }
        await supabase.auth.signOut()
      },
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
