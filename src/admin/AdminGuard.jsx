import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminGuard({ children }) {
  const { user, loading, isAdmin } = useAuth()

  // Only show spinner on initial load when we don't know auth state yet
  if (loading && user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  // Not logged in or not admin → go to login
  if (!user || !isAdmin) {
    return <Navigate to="/admin" replace />
  }

  return children
}
