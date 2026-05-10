import { useState } from 'react'
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, LogOut, Menu, X, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
  { to: '/admin/products',  icon: <Package className="w-5 h-5" />,         label: 'Products' },
  { to: '/admin/orders',    icon: <ShoppingBag className="w-5 h-5" />,     label: 'Orders' },
  { to: '/admin/users',     icon: <Users className="w-5 h-5" />,           label: 'User Activity' },
]

export default function AdminLayout() {
  const { user, loading, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Still checking auth — show spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  // Not logged in or not admin → redirect to login page
  if (!user || !isAdmin) {
    return <Navigate to="/admin" replace />
  }

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
    // Force reload to fully clear session and cart state
    window.location.href = '/admin'
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-amber-100">
        <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-md">
          <img src="/images/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm">Lakshmi Ram Collections</p>
          <p className="text-xs text-[#C8511B]">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-200'
                  : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-amber-100">
        <div className="px-4 py-2 mb-2">
          <p className="text-xs text-gray-400">Signed in as</p>
          <p className="text-xs font-medium text-gray-700 truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-amber-100 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-50 w-64 bg-white h-full shadow-xl">
            <button onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-amber-100">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-amber-50">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden">
              <img src="/images/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Admin Panel</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
