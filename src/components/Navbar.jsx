import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, Leaf, User, LogOut, ChevronDown, Heart, Search } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import toast from 'react-hot-toast'

export default function Navbar() {
  const [menuOpen, setMenuOpen]       = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled]       = useState(false)
  const { totalItems }                = useCart()
  const { items: wishlistItems }      = useWishlist()
  const { user, signOut, isAdmin }    = useAuth()
  const location                      = useLocation()
  const navigate                      = useNavigate()
  const isHome                        = location.pathname === '/'

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false) }, [location])

  useEffect(() => {
    if (!userMenuOpen) return
    const fn = (e) => { if (!e.target.closest('#user-menu-wrapper')) setUserMenuOpen(false) }
    const t = setTimeout(() => document.addEventListener('mousedown', fn), 10)
    return () => { clearTimeout(t); document.removeEventListener('mousedown', fn) }
  }, [userMenuOpen])

  const transparent = isHome && !scrolled && !menuOpen

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
    window.location.href = '/'
  }

  const avatarUrl   = user?.user_metadata?.avatar_url
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account'

  const navLinks = [
    { label: 'Home',            to: '/' },
    { label: 'Pasupu-Kumkuma', to: '/category/pasupu' },
    { label: 'Return Gifts',   to: '/category/gifts' },
    { label: 'Return Bags',    to: '/category/bags' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      transparent
        ? 'bg-transparent'
        : 'bg-white/95 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.06)]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
              transparent ? 'bg-white/20 backdrop-blur-sm' : 'bg-gradient-to-br from-[#C8511B] to-[#A83E14] shadow-lg shadow-[#C8511B]/20'
            }`}>
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="leading-none">
              <span className={`block text-[15px] font-bold tracking-tight transition-colors duration-300 ${transparent ? 'text-white' : 'text-[#1C1917]'}`}>
                Shubham
              </span>
              <span className={`block text-[10px] font-medium tracking-widest uppercase transition-colors duration-300 ${transparent ? 'text-amber-200' : 'text-[#C8511B]'}`}>
                Traditions
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = location.pathname === link.to
              return (
                <Link key={link.to} to={link.to}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    transparent
                      ? active ? 'text-white bg-white/15' : 'text-white/80 hover:text-white hover:bg-white/10'
                      : active ? 'text-[#C8511B] bg-[#FDF3EC]' : 'text-gray-600 hover:text-[#1C1917] hover:bg-[#FAF7F2]'
                  }`}>
                  {link.label}
                  {active && !transparent && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C8511B]" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Wishlist */}
            {user && (
              <Link to="/profile?tab=wishlist"
                className={`relative p-2.5 rounded-xl transition-all duration-200 ${transparent ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistItems.length > 9 ? '9+' : wishlistItems.length}
                  </span>
                )}
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart"
              className={`relative p-2.5 rounded-xl transition-all duration-200 ${transparent ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#C8511B] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-glow">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative hidden lg:block" id="user-menu-wrapper">
                <button id="user-menu-btn" onClick={() => setUserMenuOpen(v => !v)}
                  className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-all duration-200 ${
                    transparent ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-700'
                  }`}>
                  {avatarUrl
                    ? <img src={avatarUrl} alt="" className="w-7 h-7 rounded-lg object-cover ring-2 ring-[#E8895A]/50" />
                    : <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#C8511B] to-[#A83E14] flex items-center justify-center text-white text-xs font-bold">
                        {displayName[0].toUpperCase()}
                      </div>
                  }
                  <span className="text-sm font-medium max-w-[90px] truncate">{displayName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100/80 py-1.5 z-50 animate-fade-up">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-900 truncate">{displayName}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#FDF3EC] hover:text-[#C8511B] transition-colors">
                        <User className="w-4 h-4" /> My Orders
                      </Link>
                      <Link to="/profile?tab=wishlist" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                        <Heart className="w-4 h-4" /> Wishlist
                        {wishlistItems.length > 0 && <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{wishlistItems.length}</span>}
                      </Link>
                      {isAdmin && (
                        <Link to="/admin/dashboard" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#C8511B] hover:bg-[#FDF3EC] transition-colors font-medium">
                          <Leaf className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-gray-100 pt-1">
                      <button onClick={() => { setUserMenuOpen(false); handleSignOut() }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login"
                className={`hidden lg:flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 ${
                  transparent
                    ? 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                    : 'bg-[#1C1917] hover:bg-[#C8511B] text-white'
                }`}>
                <User className="w-4 h-4" /> Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(v => !v)}
              className={`lg:hidden p-2.5 rounded-xl transition-colors ${transparent ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-screen' : 'max-h-0'} ${
        transparent ? 'bg-black/80 backdrop-blur-xl' : 'bg-white border-t border-gray-100'
      }`}>
        <div className="px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? transparent ? 'bg-white/15 text-white' : 'bg-amber-50 text-amber-700'
                  : transparent ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-gray-700 hover:bg-gray-50'
              }`}>
              {link.label}
            </Link>
          ))}
          <div className="border-t border-white/10 pt-3 mt-3 space-y-1">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2">
                  {avatarUrl
                    ? <img src={avatarUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    : <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C8511B] to-[#A83E14] flex items-center justify-center text-white text-xs font-bold">{displayName[0].toUpperCase()}</div>
                  }
                  <div>
                    <p className={`text-sm font-semibold ${transparent ? 'text-white' : 'text-gray-900'}`}>{displayName}</p>
                    <p className={`text-xs ${transparent ? 'text-white/60' : 'text-gray-400'}`}>{user.email}</p>
                  </div>
                </div>
                <Link to="/profile" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${transparent ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <User className="w-4 h-4" /> My Orders
                </Link>
                <Link to="/profile?tab=wishlist" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${transparent ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <Heart className="w-4 h-4 text-red-400" /> Wishlist
                </Link>
                {isAdmin && (
                  <Link to="/admin/dashboard" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${transparent ? 'text-amber-300 hover:bg-white/10' : 'text-amber-700 hover:bg-amber-50'}`}>
                    <Leaf className="w-4 h-4" /> Admin Panel
                  </Link>
                )}
                <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${transparent ? 'bg-white/15 text-white' : 'bg-gray-900 text-white'}`}>
                <User className="w-4 h-4" /> Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
