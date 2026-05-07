import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf, Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ADMIN_EMAILS } from '../lib/adminEmails'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const { signIn, signInWithGoogle, user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]           = useState({ email: '', password: '' })
  const [showPass, setShowPass]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // Already logged in as admin → go to dashboard
  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [user, isAdmin, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!ADMIN_EMAILS.includes(form.email.trim().toLowerCase())) {
      toast.error('This email is not authorized as an admin.')
      return
    }
    setSubmitting(true)
    const { error } = await signIn(form.email.trim().toLowerCase(), form.password)
    setSubmitting(false)
    if (error) {
      toast.error(error.message || 'Login failed. Check your credentials.')
    } else {
      toast.success('Welcome back!')
      navigate('/admin/dashboard', { replace: true })
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      toast.error(error.message || 'Google sign-in failed')
      setGoogleLoading(false)
    }
  }

  // Always render the login form — no blank screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-amber-200">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Shubham Traditions</p>
        </div>

        {/* Google */}
        <button onClick={handleGoogleSignIn} disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors mb-5 disabled:opacity-60">
          {googleLoading ? (
            <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          {googleLoading ? 'Redirecting...' : 'Continue with Google'}
        </button>

        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-gray-400">Or sign in with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="admin@email.com" required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••" required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
              <button type="button" onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-3 rounded-xl transition-colors">
            {submitting
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <LogIn className="w-4 h-4" />}
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Only authorized admins can access this panel.
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}
