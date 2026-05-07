import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, Leaf, User, LogOut, ChevronDown } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { totalItems } = useCart()
  const { user, signOut, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false) }, [location])

  useEffect(() => {
    if (!userMenuOpen) return
    const handler = (e) => {
      // Close only if click is outside both the button AND the dropdown
      if (!e.target.closest('#user-menu-wrapper')) setUserMenuOpen(false)
    }
    // Use mousedown with a tiny delay so click events on menu items fire first
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 10)
    return () => {
      clearTimeout(t)
      document.removeEventListener('mousedown', handler)
    }
  }, [userMenuOpen])

  const transparent = isHome && !scrolled && !menuOpen

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out')
      setTimeout(() => navigate('/', { replace: true }), 100)
    } catch (err) {
      toast.error('Sign out failed')
    }
  }

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Pasupu-Kumkuma', to: '/category/pasupu' },
    { label: 'Return Gifts', to: '/category/gifts' },
    { label: 'Return Bags', to: '/category/bags' },
  ]

  const avatarUrl = user?.user_metadata?.avatar_url
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      transparent ? 'bg-transparent' : 'bg-white/95 backdrop-blur-md shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center group-hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/30">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className={`block text-base font-bold transition-colors duration-300 ${transparent ? 'text-white' : 'text-amber-700'}`}>
                Shubham
              </span>
              <span className={`block text-xs -mt-0.5 transition-colors duration-300 ${transparent ? 'text-amber-300' : 'text-amber-500'}`}>
                Traditions
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-all duration-300 hover:text-amber-400 ${
                  location.pathname === link.to
                    ? `${transparent ? 'text-amber-300' : 'text-amber-600'} border-b-2 border-amber-400 pb-0.5`
                    : transparent ? 'text-white/90' : 'text-gray-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: Cart + User + Mobile toggle */}
          <div className="flex items-center gap-2">

            {/* Cart */}
            <Link
              to="/cart"
              className={`relative p-2 rounded-full transition-colors ${transparent ? 'hover:bg-white/10' : 'hover:bg-amber-50'}`}
              aria-label="Shopping cart"
            >
              <ShoppingCart className={`w-6 h-6 transition-colors duration-300 ${transparent ? 'text-white' : 'text-gray-700'}`} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* Desktop: User menu or Sign In */}
            {user ? (
              <div className="relative hidden md:block" id="user-menu-wrapper">
                <button
                  id="user-menu-btn"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
                    transparent ? 'hover:bg-white/10 text-white' : 'hover:bg-amber-50 text-gray-700'
                  }`}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-7 h-7 rounded-full object-cover ring-2 ring-amber-400/50" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium max-w-[100px] truncate">{displayName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-xs font-semibold text-gray-900 truncate">{displayName}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 transition-colors font-medium"
                      >
                        <Leaf className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => { setUserMenuOpen(false); handleSignOut() }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className={`hidden md:flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-all ${
                  transparent
                    ? 'bg-white/15 hover:bg-white/25 text-white border border-white/30'
                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                }`}
              >
                <User className="w-4 h-4" />
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className={`md:hidden p-2 rounded-full transition-colors ${transparent ? 'hover:bg-white/10' : 'hover:bg-amber-50'}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {menuOpen
                ? <X className={`w-6 h-6 ${transparent ? 'text-white' : 'text-gray-700'}`} />
                : <Menu className={`w-6 h-6 ${transparent ? 'text-white' : 'text-gray-700'}`} />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${
        menuOpen ? 'max-h-96 border-t border-white/10' : 'max-h-0'
      } ${transparent ? 'bg-black/70 backdrop-blur-md' : 'bg-white border-t border-amber-100'}`}>
        <div className="px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? transparent ? 'bg-white/10 text-amber-300' : 'bg-amber-50 text-amber-700'
                  : transparent ? 'text-white/90 hover:bg-white/10' : 'text-gray-700 hover:bg-amber-50 hover:text-amber-700'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="border-t border-white/10 mt-2 pt-2">
            {user ? (
              <>
                <div className="flex items-center gap-2.5 px-3 py-2">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className={`text-sm font-medium truncate ${transparent ? 'text-white' : 'text-gray-700'}`}>
                    {displayName}
                  </span>
                </div>
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${transparent ? 'text-amber-300 hover:bg-white/10' : 'text-amber-700 hover:bg-amber-50'}`}
                  >
                    <Leaf className="w-4 h-4" /> Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                  transparent ? 'text-white hover:bg-white/10' : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                <User className="w-4 h-4" /> Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
