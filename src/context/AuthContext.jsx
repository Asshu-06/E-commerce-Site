import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ADMIN_EMAILS } from '../lib/adminEmails'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session once
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)  // done loading — never goes back to true
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    return { data, error }
  }

  const signOut = async () => {
    // Clear local state immediately so UI responds right away
    setUser(null)
    setLoading(false)
    try {
      // Use 'local' scope — works for both email and Google OAuth
      await supabase.auth.signOut({ scope: 'local' })
    } catch (err) {
      console.error('Sign out error (non-critical):', err)
    }
  }

  const isAdmin = !!(user && ADMIN_EMAILS.includes(user.email?.toLowerCase()))

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithGoogle, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
