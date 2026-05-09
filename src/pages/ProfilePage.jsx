
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { User, Package, Clock, CheckCircle2, Truck, XCircle, LogOut, ChevronRight, ShoppingBag, Phone, MessageCircle, AlertTriangle, Heart, Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const CONTACT_PHONE    = '+91 863 900 6849'
const CONTACT_WHATSAPP = '918639006849'

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-700', icon: null },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700',     icon: null },
  shipped:   { label: 'Shipped',   color: 'bg-purple-100 text-purple-700', icon: null },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700',   icon: null },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700',       icon: null },
}

const PAYMENT_CONFIG = {
  paid:                 { label: 'Paid',      color: 'bg-green-100 text-green-700' },
  pending:              { label: 'Pending',    color: 'bg-yellow-100 text-yellow-700' },
  pending_verification: { label: 'Verifying',  color: 'bg-orange-100 text-orange-700' },
  rejected:             { label: 'Rejected',   color: 'bg-red-100 text-red-700' },
  failed:               { label: 'Failed',     color: 'bg-red-100 text-red-700' },
}

function paymentMethodLabel(method) {
  if (method === 'upi')      return '📱 UPI'
  if (method === 'razorpay') return '💳 Online'
  return '🚚 Cash on Delivery'
}

// ── Inline Review Section ─────────────────────────────────────────────────
function InlineReviewSection({ order, reviewedItems, onReviewSubmitted }) {
  const { user } = useAuth()
  const items = Array.isArray(order.items) ? order.items : []
  const [activeItem, setActiveItem] = useState(null)
  const [rating, setRating]         = useState(0)
  const [hover, setHover]           = useState(0)
  const [title, setTitle]           = useState('')
  const [body, setBody]             = useState('')
  const [loading, setLoading]       = useState(false)

  const openReview = (item) => {
    setActiveItem(item)
    setRating(0); setHover(0); setTitle(''); setBody('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) { toast.error('Please select a star rating'); return }
    if (!body.trim()) { toast.error('Please write your review'); return }
    setLoading(true)
    try {
      const { error } = await supabase.from('reviews').insert([{
        user_id:    user.id,
        order_id:   order.id,
        product_id: String(activeItem.id),
        rating,
        title:      title.trim() || null,
        body:       body.trim(),
        user_name:  user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer',
      }])
      if (error) throw error
      toast.success('Review submitted! Thank you 🙏')
      onReviewSubmitted(String(activeItem.id))
      setActiveItem(null)
    } catch (err) {
      if (err.message?.includes('unique')) toast.error('You already reviewed this product.')
      else toast.error(err.message || 'Failed to submit review')
    }
    setLoading(false)
  }

  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
      <p className="font-semibold text-emerald-800 text-sm mb-3 flex items-center gap-2">
        <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
        Rate your purchase
      </p>
      <div className="space-y-2">
        {items.map((item, i) => {
          const pid = String(item.id)
          const reviewed = reviewedItems.has(pid)
          const isActive = activeItem?.id === item.id
          return (
            <div key={i}>
              <div className={`flex items-center justify-between bg-white rounded-xl px-4 py-3 border transition-all ${
                isActive ? 'border-[#C8511B] rounded-b-none' : 'border-gray-100'
              }`}>
                <p className="font-medium text-gray-900 text-sm truncate max-w-[60%]">{item.name}</p>
                {reviewed ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" /> Reviewed
                  </span>
                ) : (
                  <button
                    onClick={() => isActive ? setActiveItem(null) : openReview(item)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                      isActive ? 'bg-gray-100 text-gray-600' : 'bg-[#C8511B] text-white hover:bg-[#B04516]'
                    }`}>
                    {isActive ? 'Cancel' : '⭐ Write Review'}
                  </button>
                )}
              </div>
              {isActive && (
                <form onSubmit={handleSubmit}
                  className="bg-white border border-[#C8511B] border-t-0 rounded-b-xl px-4 pb-4 pt-3 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1.5">Your Rating *</p>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map((s) => (
                        <button key={s} type="button"
                          onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
                          onClick={() => setRating(s)} className="transition-transform hover:scale-110">
                          <Star className={`w-7 h-7 transition-colors ${
                            s <= (hover || rating) ? 'text-[#D4A017] fill-[#D4A017]' : 'text-gray-200 fill-gray-200'
                          }`} />
                        </button>
                      ))}
                      {(hover || rating) > 0 && (
                        <span className="ml-1.5 text-xs font-bold text-[#C8511B]">{labels[hover || rating]}</span>
                      )}
                    </div>
                  </div>
                  <input value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="Review title (optional)"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8895A]" />
                  <textarea value={body} onChange={e => setBody(e.target.value)}
                    placeholder="Share your experience..." rows={3} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8895A] resize-none" />
                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#C8511B] hover:bg-[#B04516] disabled:bg-[#E8895A] text-white font-bold py-2.5 rounded-xl transition-all text-sm">
                    {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Star className="w-4 h-4" />}
                    {loading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function OrderTimeline({ status, refundStatus }) {
  const isCancelled = status === 'cancelled'

  if (isCancelled) {
    const steps = [
      { key: 'placed',    label: 'Order\nPlaced',    icon: '🛍️', active: true,  red: false },
      { key: 'cancelled', label: 'Cancelled',         icon: '❌', active: true,  red: true  },
      { key: 'refund',    label: 'Refund\nInitiated', icon: '💸',
        active: refundStatus === 'initiated' || refundStatus === 'completed', red: false },
      { key: 'refunded',  label: 'Refunded',          icon: '✅',
        active: refundStatus === 'completed', red: false },
    ]
    return (
      <div className="relative px-2 pb-2">
        {/* Background line between dot centers */}
        <div className="absolute top-5 h-0.5 bg-gray-200 z-0" style={{ left: '12.5%', right: '12.5%' }} />
        {/* Red line: placed → cancelled (first 33% of the span) */}
        <div className="absolute top-5 h-0.5 bg-red-400 z-0" style={{ left: '12.5%', width: '25%' }} />
        {/* Amber line: refund progress */}
        {(refundStatus === 'initiated' || refundStatus === 'completed') && (
          <div className="absolute top-5 h-0.5 bg-[#C8511B] z-0"
            style={{ left: '37.5%', width: refundStatus === 'completed' ? '25%' : '12%' }} />
        )}
        <div className="relative z-10 flex justify-between">
          {steps.map((step) => (
            <div key={step.key} className="flex flex-col items-center gap-1.5" style={{ width: '25%' }}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                step.red && step.active ? 'bg-red-500 border-red-500 shadow-md shadow-red-200 ring-4 ring-red-100 scale-110'
                : step.active ? 'bg-[#C8511B] border-amber-500 shadow-md shadow-[#C8511B]/20'
                : 'bg-white border-gray-200'
              }`}>
                {step.active ? <span className="text-base">{step.icon}</span>
                             : <span className="w-2.5 h-2.5 rounded-full bg-gray-300 block" />}
              </div>
              <p className={`text-xs text-center font-medium leading-tight whitespace-pre-line ${
                step.red && step.active ? 'text-red-600 font-bold'
                : step.active ? 'text-[#8B3410] font-semibold' : 'text-gray-400'
              }`}>{step.label}</p>
              {step.key === 'refunded' && step.active && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Done</span>
              )}
              {step.key === 'refund' && step.active && refundStatus !== 'completed' && (
                <span className="text-xs bg-[#FAE3D3] text-[#8B3410] px-2 py-0.5 rounded-full font-semibold">Processing</span>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const steps = [
    { key: 'pending',   label: 'Order\nPlaced', icon: '🛍️' },
    { key: 'confirmed', label: 'Confirmed',     icon: '✅' },
    { key: 'shipped',   label: 'Shipped',       icon: '🚚' },
    { key: 'delivered', label: 'Delivered',     icon: '🎉' },
  ]
  const ORDER = ['pending', 'confirmed', 'shipped', 'delivered']
  const currentIndex = ORDER.indexOf(status)
  // Line spans from center of first dot to center of last dot (12.5% to 87.5%)
  // Each step is 25% wide, dot center is at 12.5% of container
  // Progress: 0 steps = 0%, 1 step = 33.3%, 2 steps = 66.6%, 3 steps = 100%
  const progressPct = currentIndex <= 0 ? 0 : (currentIndex / (steps.length - 1)) * 100

  return (
    <div className="relative px-2 pb-2">
      {/* Background line — from first dot center to last dot center */}
      <div className="absolute top-5 h-0.5 bg-gray-200 z-0"
        style={{ left: '12.5%', right: '12.5%' }} />
      {/* Active progress line */}
      <div className="absolute top-5 h-0.5 bg-[#C8511B] z-0 transition-all duration-700"
        style={{ left: '12.5%', width: `${progressPct * 0.75}%` }} />
      <div className="relative z-10 flex justify-between">
        {steps.map((step, i) => {
          const done = i <= currentIndex
          const current = i === currentIndex
          return (
            <div key={step.key} className="flex flex-col items-center gap-1.5" style={{ width: '25%' }}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                done ? 'bg-[#C8511B] border-[#C8511B] shadow-md shadow-[#C8511B]/20' : 'bg-white border-gray-200'
              } ${current ? 'ring-4 ring-[#FAE3D3] scale-110' : ''}`}>
                {done ? <span className="text-base">{step.icon}</span>
                      : <span className="w-2.5 h-2.5 rounded-full bg-gray-300 block" />}
              </div>
              <p className={`text-xs text-center font-medium leading-tight whitespace-pre-line ${
                done ? 'text-[#8B3410]' : 'text-gray-400'
              } ${current ? 'font-bold' : ''}`}>{step.label}</p>
              {current && <span className="text-xs bg-[#FAE3D3] text-[#8B3410] px-2 py-0.5 rounded-full font-semibold">Current</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, signOut, isAdmin } = useAuth()
  const { items: wishlistItems, itemsByCategory, removeFromWishlist, loading: wishlistLoading } = useWishlist()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [orders, setOrders]               = useState([])
  const [loading, setLoading]             = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [cancelModal, setCancelModal]     = useState(null)
  const [cancelReason, setCancelReason]   = useState('')
  const [cancelling, setCancelling]       = useState(false)
  const [activeTab, setActiveTab]         = useState(searchParams.get('tab') === 'wishlist' ? 'wishlist' : 'orders')
  const [reviewedItems, setReviewedItems] = useState(new Set())

  useEffect(() => {
    if (!user) { navigate('/login', { replace: true }); return }
    fetchOrders()
  }, [user])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (!error && data) setOrders(data)
    } catch { }
    // Also fetch which products user has already reviewed
    try {
      const { data: reviews } = await supabase
        .from('reviews').select('product_id').eq('user_id', user.id)
      if (reviews) setReviewedItems(new Set(reviews.map(r => r.product_id)))
    } catch { }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
    setTimeout(() => navigate('/', { replace: true }), 100)
  }

  const canCancel = (order) =>
    ['pending', 'confirmed'].includes(order.status) &&
    order.payment_status !== 'rejected'

  const handleCancelOrder = async () => {
    if (!cancelModal) return
    if (!cancelReason.trim()) { toast.error('Please enter a reason'); return }
    setCancelling(true)
    try {
      const isPaid = cancelModal.payment_status === 'paid'
      const { error } = await supabase.from('orders').update({
        status:        'cancelled',
        cancelled_by:  'customer',
        cancel_reason: cancelReason.trim(),
        refund_status: isPaid ? 'initiated' : null,
      }).eq('id', cancelModal.id)
      if (error) throw error
      toast.success(isPaid ? 'Order cancelled. Refund will be processed in 3-5 days.' : 'Order cancelled.')
      setCancelModal(null)
      setCancelReason('')
      if (selectedOrder?.id === cancelModal.id) setSelectedOrder(null)
      await fetchOrders()
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order')
    }
    setCancelling(false)
  }

  const avatarUrl   = user?.user_metadata?.avatar_url
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  if (!user) return null

  return (
    <div className="min-h-screen pt-20 pb-16 bg-[#FDF3EC]/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Profile header */}
        <div className="bg-white rounded-2xl border border-[#FAE3D3] shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-16 h-16 rounded-full object-cover ring-4 ring-amber-100" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#C8511B] flex items-center justify-center ring-4 ring-amber-100">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
                <p className="text-sm text-gray-500">{user.email}</p>
                {isAdmin && <span className="inline-block mt-1 bg-[#FAE3D3] text-[#8B3410] text-xs font-bold px-2.5 py-0.5 rounded-full">Admin</span>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link to="/admin/dashboard" className="flex items-center gap-2 bg-[#C8511B] hover:bg-[#B04516] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                  Admin Panel
                </Link>
              )}
              <button onClick={handleSignOut} className="flex items-center gap-2 bg-white hover:bg-red-50 border border-gray-200 text-red-500 text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Orders', value: orders.length },
            { label: 'Confirmed',    value: orders.filter((o) => o.status === 'confirmed').length },
            { label: 'Delivered',    value: orders.filter((o) => o.status === 'delivered').length },
            { label: 'Total Spent',  value: `₹${orders.reduce((s, o) => s + (o.total_price || 0), 0).toLocaleString()}` },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-[#FAE3D3] shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-[#C8511B]">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'orders',   label: '📦 My Orders' },
            { key: 'wishlist', label: '❤️ Wishlist' },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-[#C8511B] text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-300'
              }`}>
              {tab.label}
              {tab.key === 'wishlist' && wishlistItems.length > 0 && (
                <span className="ml-1.5 bg-white/30 text-xs px-1.5 py-0.5 rounded-full">
                  {wishlistItems.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-[#FAE3D3] shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C8511B]" /> My Orders
            </h2>
            <button onClick={fetchOrders} className="text-xs text-[#C8511B] hover:text-[#8B3410] font-medium">Refresh</button>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700 mb-1">No orders yet</h3>
              <p className="text-sm text-gray-400 mb-5">Start shopping to see your orders here.</p>
              <Link to="/" className="inline-flex items-center gap-2 bg-[#C8511B] hover:bg-[#B04516] text-white font-semibold px-6 py-2.5 rounded-full transition-colors text-sm">Shop Now</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {orders.map((order) => {
                const statusCfg  = STATUS_CONFIG[order.status]  || STATUS_CONFIG.pending
                const paymentCfg = PAYMENT_CONFIG[order.payment_status] || PAYMENT_CONFIG.pending
                const isRejected = order.payment_status === 'rejected'
                const ORDER_STEPS = ['pending','confirmed','shipped','delivered']
                const stepIdx    = ORDER_STEPS.indexOf(order.status)
                return (
                  <div key={order.id} className={`px-6 py-4 transition-colors ${isRejected ? 'bg-red-50/40' : ''}`}>
                    <div className="flex items-start justify-between gap-4 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-mono text-gray-400 truncate max-w-[120px]">
                            #{typeof order.id === 'string' ? order.id.slice(0, 8) : order.id}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentCfg.color}`}>
                            {paymentMethodLabel(order.payment_method)} · {paymentCfg.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">
                          {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          {' · '}{Array.isArray(order.items) ? order.items.length : 0} item(s)
                        </p>
                        {isRejected && order.rejection_reason && (
                          <p className="text-xs text-red-500 mb-2 truncate max-w-xs">✗ {order.rejection_reason}</p>
                        )}
                        {/* Mini progress dots */}
                        <div className="flex items-center gap-0.5">
                          {(() => {
                            const isCancelledPaid = order.status === 'cancelled' && order.payment_status === 'paid'
                            if (isCancelledPaid) {
                              // Show refund timeline dots
                              const refundSteps = ['placed', 'cancelled', 'refund', 'refunded']
                              const refundIdx = order.refund_status === 'completed' ? 3
                                : order.refund_status === 'initiated' ? 2 : 1
                              return refundSteps.map((s, i) => (
                                <div key={s} className="flex items-center gap-0.5">
                                  <div className={`w-2.5 h-2.5 rounded-full border ${
                                    s === 'cancelled' ? 'bg-red-500 border-red-500'
                                    : i <= refundIdx ? 'bg-[#C8511B] border-amber-500'
                                    : 'bg-white border-gray-300'
                                  }`} />
                                  {i < 3 && <div className={`w-6 h-0.5 ${
                                    s === 'placed' ? 'bg-red-300'
                                    : i < refundIdx ? 'bg-[#C8511B]' : 'bg-gray-200'
                                  }`} />}
                                </div>
                              ))
                            }
                            // Normal / cancelled without refund
                            return ['pending','confirmed','shipped', order.status === 'cancelled' ? 'cancelled' : 'delivered'].map((s, i) => {
                              const isCancelledDot = s === 'cancelled'
                              const isActive = isCancelledDot ? true : i <= stepIdx
                              return (
                                <div key={s} className="flex items-center gap-0.5">
                                  <div className={`w-2.5 h-2.5 rounded-full border ${
                                    isCancelledDot ? 'bg-red-500 border-red-500'
                                    : isActive ? 'bg-[#C8511B] border-amber-500'
                                    : 'bg-white border-gray-300'
                                  }`} />
                                  {i < 3 && <div className={`w-6 h-0.5 ${
                                    order.status === 'cancelled' && i === 2 ? 'bg-red-300'
                                    : i < stepIdx ? 'bg-[#C8511B]' : 'bg-gray-200'
                                  }`} />}
                                </div>
                              )
                            })
                          })()}
                          <span className={`text-xs font-medium ml-2 capitalize ${order.status === 'cancelled' ? 'text-red-500' : 'text-[#C8511B]'}`}>
                            {order.status === 'cancelled' && order.refund_status
                              ? order.refund_status === 'completed' ? 'Refunded' : 'Refund Pending'
                              : order.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-[#C8511B]">₹{order.total_price?.toLocaleString()}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    {canCancel(order) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setCancelModal(order) }}
                        className="mt-3 flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors bg-red-50 hover:bg-red-100"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Cancel Order
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
        )} {/* end orders tab */}

        {/* Wishlist tab */}
        {activeTab === 'wishlist' && (
        <div className="bg-white rounded-2xl border border-[#FAE3D3] shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" /> My Wishlist
              {wishlistItems.length > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{wishlistItems.length}</span>
              )}
            </h2>
          </div>

          {wishlistLoading ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Heart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700 mb-1">No items in wishlist</h3>
              <p className="text-sm text-gray-400 mb-5">Tap the ❤️ on any product to save it here.</p>
              <Link to="/" className="inline-flex items-center gap-2 bg-[#C8511B] hover:bg-[#B04516] text-white font-semibold px-6 py-2.5 rounded-full transition-colors text-sm">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {Object.entries(itemsByCategory).map(([cat, catItems]) => (
                <div key={cat}>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
                    {cat === 'pasupu' ? '🌿 Pasupu-Kumkuma'
                     : cat === 'gifts' ? '🎁 Return Gifts'
                     : cat === 'bags'  ? '👜 Return Bags'
                     : cat}
                    <span className="ml-2 text-gray-300 font-normal normal-case">({catItems.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {catItems.map((item) => {
                      const p = item.product
                      return (
                        <div key={item.id} className="flex items-center gap-3 bg-[#FDF3EC]/50 border border-[#FAE3D3] rounded-2xl p-3 group">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-[#FAE3D3] flex items-center justify-center shrink-0">
                              <Package className="w-6 h-6 text-[#D4A017]" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{p.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {p.type === 'customization' ? '📱 WhatsApp only' : p.price ? `₹${p.price}` : ''}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Link
                                to={`/category/${p.category}`}
                                className="text-xs bg-[#C8511B] hover:bg-[#B04516] text-white font-semibold px-3 py-1 rounded-full transition-colors"
                              >
                                View
                              </Link>
                              <button
                                onClick={() => removeFromWishlist(p.id)}
                                className="text-xs text-red-400 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"
                              >
                                <Heart className="w-3 h-3 fill-current" /> Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )} {/* end wishlist tab */}
        <div className="bg-white rounded-2xl border border-[#FAE3D3] shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#C8511B]" /> Need Help?
          </h2>
          <p className="text-sm text-gray-500 mb-4">Having issues with your order or payment? Contact us directly.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`}
              className="flex items-center justify-center gap-2 bg-[#FDF3EC] hover:bg-[#FAE3D3] border border-[#F0B090] text-[#8B3410] font-semibold px-5 py-3 rounded-xl transition-colors text-sm">
              <Phone className="w-4 h-4" /> {CONTACT_PHONE}
            </a>
            <a href={`https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent('Hello, I need help with my order.')}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm">
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Cancel Order</h3>
                <p className="text-xs text-gray-500">
                  {cancelModal.payment_status === 'paid' ? 'A refund will be initiated.' : 'This cannot be undone.'}
                </p>
              </div>
            </div>
            {cancelModal.payment_status === 'paid' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-xs text-blue-700">
                💸 Since you have already paid, a <strong>refund will be initiated</strong> and processed within 3-5 business days.
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Reason for cancellation <span className="text-red-400">*</span>
              </label>
              <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Changed my mind, ordered by mistake..."
                rows={3} autoFocus
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setCancelModal(null); setCancelReason('') }} disabled={cancelling}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                Keep Order
              </button>
              <button onClick={handleCancelOrder} disabled={cancelling || !cancelReason.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                {cancelling ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <XCircle className="w-4 h-4" />}
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="font-bold text-gray-900">Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Order ID</p>
                  <p className="font-mono text-xs text-gray-700">{selectedOrder.id}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${STATUS_CONFIG[selectedOrder.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}
                </span>
              </div>

              {/* Timeline */}
              <div className="bg-[#FDF3EC]/50 rounded-2xl p-4 border border-[#FAE3D3]">
                <h4 className="font-semibold text-gray-900 mb-4 text-sm">Order Progress</h4>
                <OrderTimeline status={selectedOrder.status} refundStatus={selectedOrder.refund_status} />
              </div>

              {/* ── Review section — only for delivered orders ── */}
              {selectedOrder.status === 'delivered' && (
                <InlineReviewSection
                  order={selectedOrder}
                  reviewedItems={reviewedItems}
                  onReviewSubmitted={(pid) => setReviewedItems(prev => new Set([...prev, pid]))}
                />
              )}

              {/* Refund info */}
              {selectedOrder.status === 'cancelled' && selectedOrder.refund_status && (
                <div className={`rounded-xl p-4 border ${selectedOrder.refund_status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                  <p className={`font-semibold text-sm mb-1 ${selectedOrder.refund_status === 'completed' ? 'text-green-800' : 'text-blue-800'}`}>
                    {selectedOrder.refund_status === 'completed' ? '✅ Refund Completed' : '💸 Refund Initiated'}
                  </p>
                  <p className={`text-xs ${selectedOrder.refund_status === 'completed' ? 'text-green-700' : 'text-blue-700'}`}>
                    {selectedOrder.refund_status === 'completed'
                      ? 'Your refund has been processed successfully.'
                      : 'Your refund is being processed. It will reflect in 3-5 business days.'}
                  </p>
                </div>
              )}

              {/* Cancel reason */}
              {selectedOrder.cancel_reason && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 font-medium mb-1">Cancellation reason:</p>
                  <p className="text-sm text-gray-700">{selectedOrder.cancel_reason}</p>
                </div>
              )}

              {/* Rejection banner */}
              {selectedOrder.payment_status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="font-bold text-red-700 text-sm">Payment Rejected</p>
                  </div>
                  {selectedOrder.rejection_reason && (
                    <div className="bg-white rounded-xl p-3 border border-red-100">
                      <p className="text-xs text-red-400 font-medium mb-1">Reason from admin:</p>
                      <p className="text-sm text-red-700 font-medium">{selectedOrder.rejection_reason}</p>
                    </div>
                  )}
                  <p className="text-xs text-red-600">Please place a new order with a valid payment screenshot.</p>
                  <div className="flex gap-2">
                    <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-red-200 text-red-600 text-xs font-semibold py-2 rounded-lg hover:bg-red-50 transition-colors">
                      <Phone className="w-3.5 h-3.5" /> Call Us
                    </a>
                    <a href={`https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent(`Hello, my order ${selectedOrder.id} payment was rejected. Reason: ${selectedOrder.rejection_reason || 'N/A'}. Please help.`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 text-white text-xs font-semibold py-2 rounded-lg hover:bg-green-600 transition-colors">
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  </div>
                </div>
              )}

              {selectedOrder.payment_status === 'pending_verification' && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-orange-800 text-sm">Payment Under Verification</p>
                    <p className="text-orange-700 text-xs mt-1">Admin is reviewing your screenshot. Order confirmed within 1-2 hours.</p>
                  </div>
                </div>
              )}

              {selectedOrder.payment_status === 'paid' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <p className="text-green-800 text-sm font-medium">Payment Verified</p>
                </div>
              )}

              {/* Payment info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Method</span>
                  <span className="font-medium">{paymentMethodLabel(selectedOrder.payment_method)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_CONFIG[selectedOrder.payment_status]?.color || 'bg-gray-100 text-gray-600'}`}>
                    {selectedOrder.payment_status === 'pending_verification' ? 'Awaiting Verification'
                     : selectedOrder.payment_status === 'paid'     ? 'Verified'
                     : selectedOrder.payment_status === 'rejected' ? 'Rejected'
                     : PAYMENT_CONFIG[selectedOrder.payment_status]?.label || selectedOrder.payment_status || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium">{new Date(selectedOrder.created_at).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Address</span>
                  <span className="font-medium text-right max-w-[55%] text-xs">{selectedOrder.address}</span>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Items</h4>
                <div className="space-y-2">
                  {(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#FDF3EC] rounded-xl px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                        {item.variant && <p className="text-xs text-gray-500">{item.variant} · Qty: {item.quantity}</p>}
                      </div>
                      <span className="font-semibold text-[#8B3410] text-sm">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="font-semibold text-gray-700">Total</span>
                <span className="text-xl font-bold text-[#C8511B]">₹{selectedOrder.total_price?.toLocaleString()}</span>
              </div>

              {canCancel(selectedOrder) && (
                <button onClick={() => { setSelectedOrder(null); setCancelModal(selectedOrder) }}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-semibold py-3 rounded-xl transition-colors text-sm">
                  <XCircle className="w-4 h-4" /> Cancel This Order
                </button>
              )}

              <div className="bg-[#FDF3EC] rounded-xl p-4 border border-[#FAE3D3]">
                <p className="text-xs font-semibold text-amber-800 mb-2">Need help with this order?</p>
                <div className="flex gap-2">
                  <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-[#F0B090] text-[#8B3410] text-xs font-semibold py-2 rounded-lg hover:bg-[#FAE3D3] transition-colors">
                    <Phone className="w-3.5 h-3.5" /> {CONTACT_PHONE}
                  </a>
                  <a href={`https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent(`Hello, I need help with my order #${selectedOrder.id}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-green-600 transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
