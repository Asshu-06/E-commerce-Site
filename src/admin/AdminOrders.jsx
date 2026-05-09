import { useEffect, useState } from 'react'
import { Search, RefreshCw, ChevronDown, X, Eye, CheckCircle2, Clock, ImageIcon, XCircle, ZoomIn } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  shipped:   'bg-purple-100 text-purple-700 border-purple-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

const PAYMENT_STATUS_COLORS = {
  pending:              'bg-yellow-100 text-yellow-700',
  pending_verification: 'bg-orange-100 text-orange-700',
  paid:                 'bg-green-100 text-green-700',
  rejected:             'bg-red-100 text-red-700',
  failed:               'bg-red-100 text-red-700',
}

export default function AdminOrders() {
  const [orders, setOrders]               = useState([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [filterStatus, setFilterStatus]   = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updatingId, setUpdatingId]       = useState(null)

  // Screenshot review modal — holds the order being reviewed
  const [reviewOrder, setReviewOrder]     = useState(null)
  const [imageZoomed, setImageZoomed]     = useState(false)
  const [rejectReason, setRejectReason]   = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders').select('*').order('created_at', { ascending: false })
      if (!error && data) setOrders(data)
    } catch { /* not configured */ }
    setLoading(false)
  }

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
      if (error) throw error
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o))
      if (selectedOrder?.id === orderId) setSelectedOrder((o) => ({ ...o, status: newStatus }))
      toast.success(`Order marked as ${newStatus}`)
    } catch (err) {
      toast.error(err.message || 'Failed to update status')
    }
    setUpdatingId(null)
  }

  // ── Verify payment ────────────────────────────────────────────────────
  const verifyPayment = async (order) => {
    setUpdatingId(order.id)
    try {
      const { error } = await supabase.from('orders')
        .update({ payment_status: 'paid', status: 'confirmed' })
        .eq('id', order.id)
      if (error) throw error
      const updated = { ...order, payment_status: 'paid', status: 'confirmed' }
      setOrders((prev) => prev.map((o) => o.id === order.id ? updated : o))
      if (selectedOrder?.id === order.id) setSelectedOrder(updated)
      setReviewOrder(null)
      toast.success('✅ Payment verified! Order confirmed.')
    } catch (err) {
      toast.error(err.message || 'Failed to verify payment')
    }
    setUpdatingId(null)
  }

  // ── Mark refund as completed ──────────────────────────────────────────
  const markRefundCompleted = async (order) => {
    setUpdatingId(order.id)
    try {
      const { error } = await supabase.from('orders')
        .update({ refund_status: 'completed' })
        .eq('id', order.id)
      if (error) throw error
      const updated = { ...order, refund_status: 'completed' }
      setOrders((prev) => prev.map((o) => o.id === order.id ? updated : o))
      if (selectedOrder?.id === order.id) setSelectedOrder(updated)
      toast.success('✅ Refund marked as completed.')
    } catch (err) {
      toast.error(err.message || 'Failed to update refund status')
    }
    setUpdatingId(null)
  }

  // ── Reject payment ────────────────────────────────────────────────────
  const rejectPayment = async (order) => {
    if (!rejectReason.trim()) {
      toast.error('Please enter a reason for rejection')
      return
    }
    setUpdatingId(order.id)
    try {
      const { error } = await supabase.from('orders')
        .update({
          payment_status:   'rejected',
          status:           'cancelled',
          rejection_reason: rejectReason.trim(),
        })
        .eq('id', order.id)
      if (error) throw error
      const updated = { ...order, payment_status: 'rejected', status: 'cancelled', rejection_reason: rejectReason.trim() }
      setOrders((prev) => prev.map((o) => o.id === order.id ? updated : o))
      if (selectedOrder?.id === order.id) setSelectedOrder(updated)
      setReviewOrder(null)
      setRejectReason('')
      setShowRejectInput(false)
      toast.error('❌ Payment rejected. Order cancelled.')
    } catch (err) {
      toast.error(err.message || 'Failed to reject payment')
    }
    setUpdatingId(null)
  }

  const filtered = orders.filter((o) => {
    const matchSearch = !search.trim() ||
      o.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.phone?.includes(search) ||
      o.id?.toString().includes(search)
    const matchStatus = filterStatus === 'all' || o.status === filterStatus
    return matchSearch && matchStatus
  })

  const pendingVerification = orders.filter((o) => o.payment_status === 'pending_verification').length
  const pendingRefund       = orders.filter((o) => o.status === 'cancelled' && o.refund_status === 'initiated').length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} total orders</p>
        </div>
        <button onClick={fetchOrders}
          className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2.5 rounded-xl transition-colors text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Pending verification alert */}
      {pendingVerification > 0 && (
        <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5">
          <Clock className="w-5 h-5 text-orange-500 shrink-0" />
          <div>
            <p className="font-semibold text-orange-800 text-sm">
              {pendingVerification} UPI payment{pendingVerification > 1 ? 's' : ''} awaiting verification
            </p>
            <p className="text-orange-700 text-xs mt-0.5">
              Click the 📷 icon to view screenshot and verify or reject.
            </p>
          </div>
        </div>
      )}

      {/* Refund pending alert */}
      {pendingRefund > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
          <span className="text-xl shrink-0">💸</span>
          <div>
            <p className="font-semibold text-blue-800 text-sm">
              {pendingRefund} order{pendingRefund > 1 ? 's' : ''} waiting for refund
            </p>
            <p className="text-blue-700 text-xs mt-0.5">
              Customer cancelled a paid order. Process the refund and mark it as completed.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, order ID..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white text-gray-700">
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {STATUS_OPTIONS.map((s) => {
          const count = orders.filter((o) => o.status === s).length
          return (
            <button key={s} onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors capitalize ${
                filterStatus === s ? STATUS_COLORS[s] : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}>
              {s} ({count})
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 text-gray-400"><p className="text-sm">No orders found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Customer</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Date</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Amount</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Payment</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Status</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => (
                  <tr key={order.id} className={`hover:bg-gray-50 transition-colors ${
                    order.payment_status === 'pending_verification' ? 'bg-orange-50/40' :
                    order.refund_status === 'initiated' ? 'bg-blue-50/40' : ''
                  }`}>
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{order.user_name}</p>
                      <p className="text-xs text-gray-400">{order.phone}</p>
                    </td>
                    <td className="px-4 py-4 text-gray-500 text-xs">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-900">₹{order.total_price?.toLocaleString()}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-gray-600">
                          {order.payment_method === 'upi' ? '📱 UPI' : '🚚 COD'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit ${
                          PAYMENT_STATUS_COLORS[order.payment_status] || 'bg-gray-100 text-gray-600'
                        }`}>
                          {order.payment_status === 'pending_verification' ? '⏳ Pending' :
                           order.payment_status === 'paid'     ? '✓ Verified' :
                           order.payment_status === 'rejected' ? '✗ Rejected' :
                           order.payment_status || 'pending'}
                        </span>
                        {/* Refund status badge */}
                        {order.refund_status === 'initiated' && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium w-fit bg-blue-100 text-blue-700">
                            💸 Refund Pending
                          </span>
                        )}
                        {order.refund_status === 'completed' && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium w-fit bg-green-100 text-green-700">
                            ✅ Refunded
                          </span>
                        )}
                        {/* Cancelled by customer */}
                        {order.cancelled_by === 'customer' && (
                          <span className="text-xs text-gray-400">by customer</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative inline-block">
                        <select value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className={`appearance-none pl-3 pr-7 py-1.5 rounded-full text-xs font-medium border cursor-pointer focus:outline-none capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s} className="capitalize bg-white text-gray-800">{s}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* Screenshot review button — for ALL UPI orders */}
                        {order.payment_method === 'upi' && (
                          <button
                            onClick={() => setReviewOrder(order)}
                            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                              order.payment_status === 'pending_verification'
                                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                : order.payment_status === 'paid'
                                ? 'bg-green-50 hover:bg-green-100 text-green-600'
                                : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                            }`}
                            title="View payment screenshot"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            {order.payment_status === 'pending_verification' ? 'Review' :
                             order.payment_status === 'paid' ? 'Verified' : 'Screenshot'}
                          </button>
                        )}
                        {/* Refund pending — quick action */}
                        {order.refund_status === 'initiated' && (
                          <button
                            onClick={() => markRefundCompleted(order)}
                            disabled={updatingId === order.id}
                            className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          >
                            💸 Refund Done
                          </button>
                        )}
                        <button onClick={() => setSelectedOrder(order)}
                          className="p-2 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors" title="View order details">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Screenshot Review Modal ─────────────────────────────────────── */}
      {reviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900">Payment Screenshot</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {reviewOrder.user_name} · ₹{reviewOrder.total_price?.toLocaleString()} · 📱 UPI
                </p>
              </div>
              <button onClick={() => { setReviewOrder(null); setImageZoomed(false); setShowRejectInput(false); setRejectReason('') }}
                className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Screenshot image */}
            <div className="relative bg-gray-900 flex items-center justify-center"
              style={{ minHeight: '300px', maxHeight: '60vh' }}>
              {reviewOrder.payment_screenshot ? (
                <>
                  <img
                    src={reviewOrder.payment_screenshot}
                    alt="Payment screenshot"
                    className={`transition-all duration-300 cursor-zoom-in ${
                      imageZoomed
                        ? 'w-full h-auto object-contain cursor-zoom-out'
                        : 'max-h-[60vh] max-w-full object-contain'
                    }`}
                    onClick={() => setImageZoomed((v) => !v)}
                  />
                  <button
                    onClick={() => setImageZoomed((v) => !v)}
                    className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors"
                    title={imageZoomed ? 'Zoom out' : 'Zoom in'}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/60 text-xs">
                    Click image to zoom
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-400 p-10">
                  <ImageIcon className="w-12 h-12 opacity-30" />
                  <p className="text-sm font-medium">No screenshot uploaded yet</p>
                  <p className="text-xs text-center">Customer has not uploaded a payment screenshot.<br/>You can still verify or reject manually.</p>
                </div>
              )}
            </div>

            {/* Order info strip */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-400">Order ID</p>
                  <p className="font-mono text-xs text-gray-700 truncate max-w-[120px]">{reviewOrder.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Amount</p>
                  <p className="font-bold text-amber-600">₹{reviewOrder.total_price?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    PAYMENT_STATUS_COLORS[reviewOrder.payment_status] || 'bg-gray-100 text-gray-600'
                  }`}>
                    {reviewOrder.payment_status === 'pending_verification' ? '⏳ Pending' :
                     reviewOrder.payment_status === 'paid'     ? '✓ Verified' :
                     reviewOrder.payment_status === 'rejected' ? '✗ Rejected' :
                     reviewOrder.payment_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            {reviewOrder.payment_status === 'pending_verification' ? (
              <div className="px-6 py-5 space-y-3">
                {/* Reject reason input — shown when reject is clicked */}
                {showRejectInput ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                        Reason for Rejection <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g. Screenshot is unclear, wrong amount paid, transaction ID not visible..."
                        rows={3}
                        className="w-full border border-red-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none bg-red-50"
                        autoFocus
                      />
                      <p className="text-xs text-gray-400 mt-1">This reason will be visible to the customer.</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setShowRejectInput(false); setRejectReason('') }}
                        className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => rejectPayment(reviewOrder)}
                        disabled={updatingId === reviewOrder.id || !rejectReason.trim()}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-bold py-3 rounded-2xl transition-colors text-sm"
                      >
                        {updatingId === reviewOrder.id ? (
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    {/* Reject — shows reason input first */}
                    <button
                      onClick={() => setShowRejectInput(true)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-2xl transition-colors text-sm"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject Payment
                    </button>
                    {/* Verify */}
                    <button
                      onClick={() => verifyPayment(reviewOrder)}
                      disabled={updatingId === reviewOrder.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold py-3.5 rounded-2xl transition-colors text-sm"
                    >
                      {updatingId === reviewOrder.id ? (
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5" />
                      )}
                      Verify Payment
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="px-6 py-4">
                {reviewOrder.payment_status === 'paid' ? (
                  <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                    <CheckCircle2 className="w-5 h-5" /> Payment already verified
                  </div>
                ) : reviewOrder.payment_status === 'rejected' ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-red-500 font-semibold">
                      <XCircle className="w-5 h-5" /> Payment was rejected
                    </div>
                    {reviewOrder.rejection_reason && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                        <p className="text-xs text-red-600 font-medium">Reason:</p>
                        <p className="text-sm text-red-700 mt-0.5">{reviewOrder.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Order Detail Modal ──────────────────────────────────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-5">

              {/* UPI pending banner */}
              {selectedOrder.payment_status === 'pending_verification' && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <p className="font-semibold text-orange-800 text-sm mb-2">⏳ UPI Payment Pending Verification</p>
                  <p className="text-orange-700 text-xs mb-3">
                    Customer has uploaded a payment screenshot. Review it to verify or reject.
                  </p>
                  {selectedOrder.payment_screenshot && (
                    <button
                      onClick={() => { setSelectedOrder(null); setReviewOrder(selectedOrder) }}
                      className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors w-full justify-center"
                    >
                      <ImageIcon className="w-4 h-4" /> View Screenshot & Verify / Reject
                    </button>
                  )}
                </div>
              )}

              {selectedOrder.payment_status === 'paid' && selectedOrder.payment_method === 'upi' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <p className="text-green-800 text-sm font-medium">UPI Payment Verified ✓</p>
                </div>
              )}

              {/* Refund management for cancelled orders */}
              {selectedOrder.status === 'cancelled' && selectedOrder.refund_status === 'initiated' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="font-semibold text-blue-800 text-sm mb-2">💸 Refund Initiated</p>
                  <p className="text-blue-700 text-xs mb-3">
                    Customer cancelled a paid order. Once you've processed the refund, mark it as completed.
                  </p>
                  <button
                    onClick={() => markRefundCompleted(selectedOrder)}
                    disabled={updatingId === selectedOrder.id}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Refund as Completed
                  </button>
                </div>
              )}
              {selectedOrder.status === 'cancelled' && selectedOrder.refund_status === 'completed' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <p className="text-green-800 text-sm font-medium">Refund Completed ✓</p>
                </div>
              )}
              {selectedOrder.cancel_reason && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-sm">
                  <p className="text-xs text-gray-400 font-medium mb-1">Cancellation reason:</p>
                  <p className="text-gray-700">{selectedOrder.cancel_reason}</p>
                  {selectedOrder.cancelled_by && (
                    <p className="text-xs text-gray-400 mt-1">Cancelled by: {selectedOrder.cancelled_by}</p>
                  )}
                </div>
              )}

              {selectedOrder.payment_status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <p className="text-red-700 text-sm font-medium">Payment Rejected — Order Cancelled</p>
                </div>
              )}

              {/* Customer info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                {[
                  ['Name', selectedOrder.user_name],
                  ['Phone', selectedOrder.phone],
                  selectedOrder.email ? ['Email', selectedOrder.email] : null,
                  ['Address', selectedOrder.address],
                  ['Payment', selectedOrder.payment_method?.toUpperCase()],
                  ['Date', new Date(selectedOrder.created_at).toLocaleString('en-IN')],
                ].filter(Boolean).map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-900 text-right max-w-[60%]">{value}</span>
                  </div>
                ))}
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Items Ordered</h3>
                <div className="space-y-2">
                  {(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-amber-50 rounded-xl px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        {item.variant && <p className="text-xs text-gray-500">{item.variant} · Qty: {item.quantity}</p>}
                      </div>
                      <span className="font-semibold text-amber-700">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total + status */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Total Amount</p>
                  <p className="text-xl font-bold text-amber-600">₹{selectedOrder.total_price?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Update Status</p>
                  <select value={selectedOrder.status}
                    onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                    disabled={updatingId === selectedOrder.id}
                    className={`pl-3 pr-7 py-1.5 rounded-full text-xs font-medium border cursor-pointer focus:outline-none capitalize ${STATUS_COLORS[selectedOrder.status]}`}>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s} className="capitalize bg-white text-gray-800">{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
