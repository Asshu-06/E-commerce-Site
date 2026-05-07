import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ADMIN_EMAILS } from '../lib/adminEmails'
import { Leaf } from 'lucide-react'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase handles the OAuth token exchange automatically.
    // We just need to wait for the session and redirect.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const email = session.user?.email?.toLowerCase()
        if (ADMIN_EMAILS.includes(email)) {
          navigate('/admin/dashboard', { replace: true })
        } else {
          navigate('/', { replace: true })
        }
      }
    })

    // Fallback: check existing session after a short delay
    const t = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const email = session.user?.email?.toLowerCase()
        if (ADMIN_EMAILS.includes(email)) {
          navigate('/admin/dashboard', { replace: true })
        } else {
          navigate('/', { replace: true })
        }
      } else {
        navigate('/', { replace: true })
      }
    }, 2000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(t)
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center gap-4">
      <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200 animate-pulse">
        <Leaf className="w-7 h-7 text-white" />
      </div>
      <p className="text-gray-600 font-medium">Signing you in...</p>
      <div className="w-8 h-8 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
    </div>
  )
}
