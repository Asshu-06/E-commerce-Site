import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Menu, X, Leaf, User, LogOut, ChevronDown, Heart, Search } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { supabase } from '../lib/supabase'
import { categories as mockCategories } from '../lib/mockData'
import WhatsAppAnnouncement from './WhatsAppAnnouncement'
import SearchModal from './SearchModal'
import NotificationBell from './NotificationBell'
import toast from 'react-hot-toast'

export default function Navbar() {
  const [menuOpen, setMenuOpen]       = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [catMenuOpen, setCatMenuOpen]  = useState(false)
  const [scrolled, setScrolled]       = useState(false)
  const [searchOpen, setSearchOpen]   = useState(false)
  const [dbCategories, setDbCategories] = useState(mockCategories.map(c => ({ slug: c.id, name: c.name })))
  const catMenuRef = useRef(null)
  const { cart }          = useCart()
  const { items: wishlistItems }      = useWishlist()
  const { user, signOut, isAdmin }    = useAuth()
  const location                      = useLocation()
  const isHome                        = location.pathname === '/'

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false); setCatMenuOpen(false) }, [location])

  useEffect(() => {
    if (!userMenuOpen) return
    const fn = (e) => { if (!e.target.closest('#user-menu-wrapper')) setUserMenuOpen(false) }
    const t = setTimeout(() => document.addEventListener('mousedown', fn), 10)
    return () => { clearTimeout(t); document.removeEventListener('mousedown', fn) }
  }, [userMenuOpen])

  useEffect(() => {
    if (!catMenuOpen) return
    const fn = (e) => { if (catMenuRef.current && !catMenuRef.current.contains(e.target)) setCatMenuOpen(false) }
    const t = setTimeout(() => document.addEventListener('mousedown', fn), 10)
    return () => { clearTimeout(t); document.removeEventListener('mousedown', fn) }
  }, [catMenuOpen])

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await supabase.from('categories').select('slug, name').order('created_at', { ascending: true })
        if (data && data.length > 0) setDbCategories(data)
      } catch { }
    }
    fetch()
  }, [])

  const transparent = isHome && !scrolled && !menuOpen

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
    window.location.href = '/'
  }

  const avatarUrl   = user?.user_metadata?.avatar_url
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account'



  return (
  <>
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      transparent
        ? 'bg-transparent'
        : 'bg-white/95 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.06)]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className={`w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
              transparent ? 'ring-2 ring-white/30' : 'shadow-lg shadow-[#C8511B]/20'
            }`}>
              <img src="/images/logo.jpeg" alt="Lakshmi Ram Collections" className="w-full h-full object-cover" />
            </div>
            <div className="leading-none">
              <span className={`block text-[15px] font-bold tracking-tight transition-colors duration-300 ${transparent ? 'text-white' : 'text-[#1C1917]'}`}>
                Lakshmi Ram
              </span>
              <span className={`block text-[10px] font-medium tracking-widest uppercase transition-colors duration-300 ${transparent ? 'text-amber-200' : 'text-[#C8511B]'}`}>
                Collections
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            <Link to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                transparent
                  ? location.pathname === '/' ? 'text-white bg-white/15' : 'text-white/80 hover:text-white hover:bg-white/10'
                  : location.pathname === '/' ? 'text-[#C8511B] bg-[#FDF3EC]' : 'text-gray-600 hover:text-[#1C1917] hover:bg-[#FAF7F2]'
              }`}>
              Home
            </Link>

            <Link to="/category/pasupu"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                transparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-[#1C1917] hover:bg-[#FAF7F2]'
              }`}>
              All Products
            </Link>

            {/* Categories dropdown */}
            <div className="relative" ref={catMenuRef}>
              <button
                onClick={() => setCatMenuOpen(v => !v)}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  transparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-[#1C1917] hover:bg-[#FAF7F2]'
                }`}>
                Categories
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${catMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {catMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-fade-up">
                  {dbCategories.map(cat => (
                    <Link
                      key={cat.slug}
                      to={`/category/${cat.slug}`}
                      onClick={() => setCatMenuOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-[#FDF3EC] hover:text-[#C8511B] transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Inline search box */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs mx-4">
            <button
              onClick={() => setSearchOpen(true)}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all ${
                transparent
                  ? 'bg-white/10 border-white/20 text-white/60 hover:bg-white/20'
                  : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-[#C8511B]/40 hover:bg-white'
              }`}
            >
              <Search className="w-4 h-4 shrink-0" />
              <span>Search products...</span>
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Notifications — only for logged in users */}
            {user && (
              <NotificationBell userId={user.id} transparent={transparent} />
            )}

            {/* Wishlist */}
            <Link to="/wishlist"
              className={`relative p-2.5 rounded-xl transition-all duration-200 ${transparent ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
              <Heart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistItems.length > 9 ? '9+' : wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart"
              className={`relative p-2.5 rounded-xl transition-all duration-200 ${transparent ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#C8511B] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-glow">
                  {cart.length > 9 ? '9+' : cart.length}
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
                      <Link to="/wishlist" onClick={() => setUserMenuOpen(false)}
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

            {/* Mobile search icon */}
            <button onClick={() => setSearchOpen(true)}
              className={`lg:hidden p-2.5 rounded-xl transition-colors ${transparent ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
              <Search className="w-5 h-5" />
            </button>

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
          <Link to="/"
            className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              location.pathname === '/'
                ? transparent ? 'bg-white/15 text-white' : 'bg-amber-50 text-amber-700'
                : transparent ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-gray-700 hover:bg-gray-50'
            }`}>
            Home
          </Link>
          <Link to="/category/pasupu"
            className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              transparent ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-gray-700 hover:bg-gray-50'
            }`}>
            All Products
          </Link>
          {dbCategories.map(cat => (
            <Link key={cat.slug} to={`/category/${cat.slug}`}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === `/category/${cat.slug}`
                  ? transparent ? 'bg-white/15 text-white' : 'bg-amber-50 text-amber-700'
                  : transparent ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-gray-700 hover:bg-gray-50'
              }`}>
              {cat.name}
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
                <Link to="/wishlist" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${transparent ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <Heart className="w-4 h-4 text-red-400" /> Wishlist
                  {wishlistItems.length > 0 && <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{wishlistItems.length}</span>}
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

      {/* Marquee announcement — only on non-home pages */}
      <WhatsAppAnnouncement />
    </nav>
    <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
  </>
  )
}
