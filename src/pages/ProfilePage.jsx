import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Package, Clock, CheckCircle2, Truck, XCircle, LogOut, ChevronRight, ShoppingBag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3.5 h-3.5" /> },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700',     icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  shipped:   { label: 'Shipped',   color: 'bg-purple-100 text-purple-700', icon: <Truck className="w-3.5 h-3.5" /> },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700',   icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700',       icon: <XCircle className="w-3.5 h-3.5" /> },
}

const PAYMENT_CONFIG = {
  paid:    { label: 'Paid',    color: 'bg-green-100 text-green-700' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  failed:  { label: 'Failed',  color: 'bg-red-100 text-red-700' },
}

export default function ProfilePage() {
  const { user, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    if (!user) { navigate('/login', { replace: true }); return }
    fetchOrders()
  }, [user])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (!error && data) setOrders(data)
    } catch { /* Supabase not configured */ }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
    setTimeout(() => navigate('/', { replace: true }), 100)
  }

  const avatarUrl   = user?.user_metadata?.avatar_url
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  if (!user) return null

  return (
    <div className="min-h-screen pt-20 pb-16 bg-amber-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Profile header */}
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-amber-100" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center ring-4 ring-amber-100">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
                <p className="text-sm text-gray-500">{user.email}</p>
                {isAdmin && (
                  <span className="inline-block mt-1 bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link to="/admin/dashboard"
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                  Admin Panel
                </Link>
              )}
              <button onClick={handleSignOut}
                className="flex items-center gap-2 bg-white hover:bg-red-50 border border-gray-200 text-red-500 text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Orders',  value: orders.length },
            { label: 'Confirmed',     value: orders.filter((o) => o.status === 'confirmed').length },
            { label: 'Delivered',     value: orders.filter((o) => o.status === 'delivered').length },
            { label: 'Total Spent',   value: `₹${orders.reduce((s, o) => s + (o.total_price || 0), 0).toLocaleString()}` },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Orders list */}
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" /> My Orders
            </h2>
            <button onClick={fetchOrders} className="text-xs text-amber-600 hover:text-amber-700 font-medium">
              Refresh
            </button>
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
              <Link to="/"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-full transition-colors text-sm">
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {orders.map((order) => {
                const status  = STATUS_CONFIG[order.status]  || STATUS_CONFIG.pending
                const payment = PAYMENT_CONFIG[order.payment_status] || PAYMENT_CONFIG.pending
                return (
                  <div key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center justify-between px-6 py-4 hover:bg-amber-50/50 cursor-pointer transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-gray-400 truncate max-w-[140px]">
                          #{typeof order.id === 'string' ? order.id.slice(0, 8) : order.id}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.icon} {status.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${payment.color}`}>
                          {order.payment_method === 'razorpay' ? '💳' : '🚚'} {payment.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {' · '}{Array.isArray(order.items) ? order.items.length : 0} item(s)
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span className="font-bold text-amber-600">₹{order.total_price?.toLocaleString()}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="font-bold text-gray-900">Order Details</h3>
              <button onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Order ID</p>
                  <p className="font-mono text-xs text-gray-700">{selectedOrder.id}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  STATUS_CONFIG[selectedOrder.status]?.color || 'bg-gray-100 text-gray-600'
                }`}>
                  {STATUS_CONFIG[selectedOrder.status]?.icon}
                  {STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}
                </span>
              </div>

              {/* Payment info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment</span>
                  <span className="font-medium capitalize">
                    {selectedOrder.payment_method === 'razorpay' ? '💳 Razorpay' : '🚚 Cash on Delivery'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    PAYMENT_CONFIG[selectedOrder.payment_status]?.color || 'bg-gray-100 text-gray-600'
                  }`}>
                    {PAYMENT_CONFIG[selectedOrder.payment_status]?.label || selectedOrder.payment_status || 'N/A'}
                  </span>
                </div>
                {selectedOrder.razorpay_payment_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment ID</span>
                    <span className="font-mono text-xs text-green-700">{selectedOrder.razorpay_payment_id}</span>
                  </div>
                )}
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
                    <div key={i} className="flex items-center justify-between bg-amber-50 rounded-xl px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                        {item.variant && <p className="text-xs text-gray-500">{item.variant} · Qty: {item.quantity}</p>}
                      </div>
                      <span className="font-semibold text-amber-700 text-sm">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="font-semibold text-gray-700">Total</span>
                <span className="text-xl font-bold text-amber-600">₹{selectedOrder.total_price?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
