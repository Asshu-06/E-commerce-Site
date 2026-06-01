import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, XCircle, ImageIcon, ZoomIn, X, Package } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { mockProducts } from '../lib/mockData'
import toast from 'react-hot-toast'
import { notifyUser } from '../lib/notifications'
import { deductStock } from '../lib/stockUtils'

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
}

export default function AdminOrderDetail() {
  const { orderId } = useParams()
  const navigate    = useNavigate()

  const [order, setOrder]           = useState(null)
  const [loading, setLoading]       = useState(true)
  const [productMap, setProductMap] = useState({})
  const [updating, setUpdating]     = useState(false)
  const [screenshotZoom, setScreenshotZoom] = useState(false)
  const [rejectReason, setRejectReason]     = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [lastStatusChanged, setLastStatusChanged] = useState(null)
  const [trackingId, setTrackingId] = useState('')
  const [showTrackingInput, setShowTrackingInput] = useState(false)
  const [packageImageUrl, setPackageImageUrl] = useState('')
  const [uploadingPkg, setUploadingPkg] = useState(false)
  const [pendingStatus, setPendingStatus] = useState(null) // status waiting for tracking ID
  const pkgFileRef = useRef(null)
  const notifyRef  = useRef(null)

  // Scroll to notify button when it appears
  useEffect(() => {
    if (lastStatusChanged && notifyRef.current) {
      setTimeout(() => {
        notifyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }, [lastStatusChanged])

  const handlePackageImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPkg(true)
    try {
      const ext = file.name.split('.').pop().toLowerCase()
      const path = `packages/${orderId}-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
      if (!error) {
        const url = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
        setPackageImageUrl(url)
        toast.success('Package image uploaded!')
      } else {
        toast.error('Upload failed: ' + error.message)
      }
    } catch { toast.error('Upload failed') }
    setUploadingPkg(false)
  }

  useEffect(() => { fetchOrder(); fetchProducts() }, [orderId])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).single()
      if (!error && data) setOrder(data)
    } catch { }
    setLoading(false)
  }

  const fetchProducts = async () => {
    const map = {}
    mockProducts.forEach(p => { map[String(p.id)] = p.image_url })
    try {
      const { data } = await supabase.from('products').select('id, image_url')
      if (data) data.forEach(p => { map[String(p.id)] = p.image_url })
    } catch { }
    setProductMap(map)
  }

  const updateStatus = async (newStatus) => {
    // For shipped: show tracking modal first, don't update yet
    if (newStatus === 'shipped') {
      setPendingStatus('shipped')
      setTrackingId('')
      setPackageImageUrl('')
      return
    }
    await doUpdateStatus(newStatus)
  }

  const doUpdateStatus = async (newStatus, tId = '', pkgImg = '') => {
    setUpdating(true)
    try {
      const updatePayload = { status: newStatus }
      if (newStatus === 'shipped' && tId) {
        try {
          const shippedPayload = { tracking_id: tId }
          if (pkgImg) shippedPayload.package_image = pkgImg
          await supabase.from('orders').update(shippedPayload).eq('id', orderId)
        } catch { /* columns may not exist */ }
      }
      const { error } = await supabase.from('orders').update(updatePayload).eq('id', orderId)
      if (error) throw error
      setOrder(o => ({ ...o, status: newStatus, tracking_id: tId || o.tracking_id }))
      setLastStatusChanged(newStatus)
      setShowTrackingInput(newStatus === 'shipped')
      setPendingStatus(null)
      toast.success(`Status updated to ${newStatus}`)
      if (order?.user_id) {
        if (newStatus === 'confirmed') notifyUser.orderConfirmed(order.user_id, order)
        if (newStatus === 'shipped')   notifyUser.orderShipped(order.user_id, order)
        if (newStatus === 'delivered') notifyUser.orderDelivered(order.user_id, order)
      }
    } catch (err) { toast.error(err.message) }
    setUpdating(false)
  }

  const verifyPayment = async () => {
    setUpdating(true)
    try {
      const { error } = await supabase.from('orders').update({ payment_status: 'paid', status: 'confirmed' }).eq('id', orderId)
      if (error) throw error
      setOrder(o => ({ ...o, payment_status: 'paid', status: 'confirmed' }))
      setLastStatusChanged('confirmed')
      toast.success('✅ Payment verified! Order confirmed.')
      if (order?.user_id) notifyUser.orderConfirmed(order.user_id, order)
      // Deduct stock for confirmed order
      deductStock(order?.items || [])
    } catch (err) { toast.error(err.message) }
    setUpdating(false)
  }

  const rejectPayment = async () => {
    if (!rejectReason.trim()) { toast.error('Please enter a reason'); return }
    setUpdating(true)
    try {
      const { error } = await supabase.from('orders').update({ payment_status: 'rejected', status: 'cancelled', rejection_reason: rejectReason.trim() }).eq('id', orderId)
      if (error) throw error
      setOrder(o => ({ ...o, payment_status: 'rejected', status: 'cancelled', rejection_reason: rejectReason.trim() }))
      setShowRejectInput(false)
      setLastStatusChanged('cancelled')
      toast.error('Payment rejected.')
      if (order?.user_id) notifyUser.paymentRejected(order.user_id, { ...order, rejection_reason: rejectReason.trim() })
    } catch (err) { toast.error(err.message) }
    setUpdating(false)
  }

  const markRefundCompleted = async () => {
    setUpdating(true)
    try {
      const { error } = await supabase.from('orders').update({ refund_status: 'completed' }).eq('id', orderId)
      if (error) throw error
      setOrder(o => ({ ...o, refund_status: 'completed' }))
      toast.success('✅ Refund marked as completed.')
    } catch (err) { toast.error(err.message) }
    setUpdating(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
    </div>
  )

  if (!order) return (
    <div className="text-center py-20 text-gray-400">
      <p>Order not found</p>
      <button onClick={() => navigate('/admin/orders')} className="mt-4 text-amber-600 hover:underline text-sm">← Back to Orders</button>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate('/admin/orders')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 transition-colors mb-6 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          <p className="text-xs font-mono text-gray-400 mt-1">{order.id}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
            {order.status}
          </span>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${PAYMENT_STATUS_COLORS[order.payment_status] || 'bg-gray-100 text-gray-600'}`}>
            {order.payment_method === 'upi' ? '📱' : '🚚'} {order.payment_status || 'pending'}
          </span>
        </div>
      </div>

      <div className="space-y-5">
        {/* UPI verification — pending_verification OR pending with screenshot */}
        {(order.payment_status === 'pending_verification' || order.payment_status === 'pending') && order.status !== 'cancelled' && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
            <p className="font-bold text-orange-800 mb-1">⏳ UPI Payment Pending Verification</p>
            <p className="text-orange-700 text-sm mb-4">Review the payment screenshot and verify or reject.</p>
            {order.payment_screenshot ? (
              <div className="mb-4">
                <div className="relative rounded-2xl overflow-hidden bg-gray-900 cursor-zoom-in" onClick={() => setScreenshotZoom(true)}>
                  <img src={order.payment_screenshot} alt="Payment screenshot" className="w-full max-h-72 object-contain" />
                  <div className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-lg">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-gray-800 rounded-2xl p-6 mb-4 text-gray-400">
                <ImageIcon className="w-8 h-8 opacity-40" />
                <p className="text-sm">No screenshot uploaded yet. You can still verify or reject manually.</p>
              </div>
            )}
            {showRejectInput ? (
              <div className="space-y-3">
                <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection..." rows={3} autoFocus
                  className="w-full border border-red-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none bg-red-50" />
                <div className="flex gap-3">
                  <button onClick={() => { setShowRejectInput(false); setRejectReason('') }}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50">Cancel</button>
                  <button onClick={rejectPayment} disabled={updating || !rejectReason.trim()}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-bold py-2.5 rounded-xl text-sm">
                    {updating ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Confirm Rejection
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => setShowRejectInput(true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-2xl text-sm">
                  <XCircle className="w-4 h-4" /> Reject Payment
                </button>
                <button onClick={verifyPayment} disabled={updating}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold py-3 rounded-2xl text-sm">
                  {updating ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Verify Payment
                </button>
              </div>
            )}
          </div>
        )}

        {/* Cancellation reason — shown when cancelled by customer */}
        {order.status === 'cancelled' && order.cancel_reason && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <p className="font-bold text-red-800 mb-2 flex items-center gap-2">
              <XCircle className="w-4 h-4" /> Order Cancelled by Customer
            </p>
            <p className="text-xs text-red-600 font-medium mb-1">Reason:</p>
            <p className="text-sm text-red-800 bg-white rounded-xl px-4 py-3 border border-red-100">{order.cancel_reason}</p>
            {/* Show screenshot for refund verification if paid */}
            {order.payment_status === 'paid' && order.payment_screenshot && (
              <div className="mt-4">
                <p className="text-xs text-red-600 font-medium mb-2">Payment Screenshot (for refund verification):</p>
                <div className="relative rounded-2xl overflow-hidden bg-gray-900 cursor-zoom-in" onClick={() => setScreenshotZoom(true)}>
                  <img src={order.payment_screenshot} alt="Payment screenshot" className="w-full max-h-60 object-contain" />
                  <div className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-lg">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Refund */}
        {order.status === 'cancelled' && order.refund_status === 'initiated' && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <p className="font-bold text-blue-800 mb-1">💸 Refund Initiated</p>
            <p className="text-blue-700 text-sm mb-3">Customer cancelled a paid order. Process the refund and mark as completed.</p>
            <button onClick={markRefundCompleted} disabled={updating}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4" /> Mark Refund as Completed
            </button>
          </div>
        )}

        {/* Customer info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">Customer Information</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {[
              ['Name', order.user_name],
              ['Phone', order.phone],
              order.email ? ['Email', order.email] : null,
              ['Payment Method', order.payment_method === 'upi' ? '📱 UPI' : '🚚 Cash on Delivery'],
              ['Order Date', new Date(order.created_at).toLocaleString('en-IN')],
            ].filter(Boolean).map(([label, value]) => (
              <div key={label} className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery address */}
        {order.address && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
            <span className="text-2xl shrink-0">📍</span>
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">Delivery Address</p>
              <p className="text-gray-900 font-semibold leading-relaxed">{order.address}</p>
            </div>
          </div>
        )}

        {/* Items ordered */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">Items Ordered</h2>
          <div className="space-y-3">
            {(Array.isArray(order.items) ? order.items : []).map((item, i) => {
              const imgUrl = item.image_url || productMap[String(item.id)] || null
              return (
                <div key={i} className="flex items-start gap-4 bg-[#FDF3EC] rounded-2xl p-4 border border-[#FAE3D3]">
                  {imgUrl ? (
                    <img src={imgUrl} alt={item.name} className="w-20 h-20 rounded-xl object-cover shrink-0 border border-[#F0B090]" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-3xl">🛍️</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-base">{item.name}</p>
                    {item.variant && (
                      <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mt-1.5 ${
                        item.variant.includes('With Magnet') ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        🧲 {item.variant}
                      </span>
                    )}
                    <div className="flex items-center gap-5 mt-2 text-sm text-gray-600">
                      <span>Qty: <strong className="text-gray-900">{item.quantity} pcs</strong></span>
                      <span>₹{item.price}/pc</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-bold text-[#C8511B]">₹{(item.price * item.quantity).toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.quantity} × ₹{item.price}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-100">
            <span className="font-semibold text-gray-700 text-lg">Total</span>
            <span className="text-2xl font-bold text-[#C8511B]">₹{order.total_price?.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Screenshot — always show if available */}
        {order.payment_screenshot && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-gray-500" /> Payment Screenshot
            </h2>
            <div className="relative rounded-2xl overflow-hidden bg-gray-900 cursor-zoom-in" onClick={() => setScreenshotZoom(true)}>
              <img src={order.payment_screenshot} alt="Payment screenshot" className="w-full max-h-72 object-contain" />
              <div className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-lg">
                <ZoomIn className="w-4 h-4" />
              </div>
              <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/60 text-xs">Click to zoom</p>
            </div>
          </div>
        )}

        {/* Update status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">Update Order Status</h2>
          {order.status === 'cancelled' ? (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">
              This order has been cancelled and cannot be updated.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.filter(s => s !== 'cancelled').map((s) => (
                <button key={s} onClick={() => updateStatus(s)} disabled={updating || order.status === s}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all capitalize ${
                    order.status === s
                      ? STATUS_COLORS[s] + ' scale-105'
                      : 'border-gray-200 text-gray-600 hover:border-amber-300 hover:bg-amber-50'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Tracking ID modal — shown before confirming shipped status */}
          {pendingStatus === 'shipped' && (
            <div className="mt-4 bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-bold text-purple-800">Enter Tracking Details to mark as Shipped</p>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tracking ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={trackingId}
                  onChange={e => setTrackingId(e.target.value)}
                  placeholder="e.g. DTDC1234567890"
                  autoFocus
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Package Image (optional)</label>
                {packageImageUrl ? (
                  <div className="relative">
                    <img src={packageImageUrl} alt="Package" className="w-full max-h-40 object-cover rounded-xl border border-gray-200" />
                    <button onClick={() => setPackageImageUrl('')} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">x</button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 hover:border-purple-400 transition-colors">
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{uploadingPkg ? 'Uploading...' : 'Click to upload package photo'}</span>
                    <input type="file" accept="image/*" onChange={handlePackageImage} className="hidden" disabled={uploadingPkg} />
                  </label>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setPendingStatus(null); setTrackingId(''); setPackageImageUrl('') }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => doUpdateStatus('shipped', trackingId, packageImageUrl)}
                  disabled={!trackingId.trim() || updating}
                  className="flex-1 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                >
                  {updating ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : null}
                  Confirm Shipped
                </button>
              </div>
            </div>
          )}

          {/* WhatsApp Notify button — appears after status change */}
          {lastStatusChanged && order.phone && (
            <div ref={notifyRef} className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-emerald-800">
                Notify customer via WhatsApp — {lastStatusChanged === 'cancelled' ? 'Payment Rejected' : `Status: ${lastStatusChanged}`}
              </p>

              {/* Tracking ID + Package image — only for shipped */}
              {showTrackingInput && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tracking ID (optional)</label>
                    <input
                      type="text"
                      value={trackingId}
                      onChange={e => setTrackingId(e.target.value)}
                      placeholder="e.g. DTDC1234567890"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Package Image (optional)</label>
                    {packageImageUrl ? (
                      <div className="relative">
                        <img src={packageImageUrl} alt="Package" className="w-full max-h-40 object-cover rounded-xl border border-gray-200" />
                        <button onClick={() => setPackageImageUrl('')} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">✕</button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 hover:border-emerald-400 transition-colors">
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{uploadingPkg ? 'Uploading...' : 'Click to upload package photo'}</span>
                        <input type="file" accept="image/*" onChange={handlePackageImage} className="hidden" ref={pkgFileRef} disabled={uploadingPkg} />
                      </label>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <a
                  href={`https://wa.me/91${order.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                    lastStatusChanged === 'cancelled'
                      ? `Hello ${order.user_name},\n\nWe regret to inform you that your payment for order (ID: ${order.id.slice(0,8).toUpperCase()}) has been rejected.\n${order.rejection_reason ? `\nReason: ${order.rejection_reason}` : ''}\n\nPlease contact us for assistance.\n\nLakshmi Ram Collections`
                      : `Hello ${order.user_name},\n\nYour order (ID: ${order.id.slice(0,8).toUpperCase()}) status has been updated to ${lastStatusChanged.toUpperCase()}.\n${
                          lastStatusChanged === 'shipped' && trackingId ? `\nTracking ID: ${trackingId}` : ''
                        }${
                          lastStatusChanged === 'shipped' && packageImageUrl ? `\nPackage image: ${packageImageUrl}` : ''
                        }\n\nThank you for shopping with Lakshmi Ram Collections!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => { setLastStatusChanged(null); setShowTrackingInput(false) }}
                  className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" className="w-4 h-4">
                    <path d="M16.003 2C8.28 2 2 8.28 2 16.003c0 2.478.65 4.897 1.885 7.02L2 30l7.18-1.858A13.94 13.94 0 0 0 16.003 30C23.72 30 30 23.72 30 16.003 30 8.28 23.72 2 16.003 2zm0 25.455a11.41 11.41 0 0 1-5.82-1.594l-.418-.248-4.26 1.102 1.13-4.14-.272-.432A11.41 11.41 0 0 1 4.545 16c0-6.32 5.138-11.455 11.458-11.455S27.455 9.68 27.455 16c0 6.318-5.135 11.455-11.452 11.455zm6.29-8.573c-.345-.172-2.04-1.006-2.356-1.12-.316-.115-.546-.172-.776.172-.23.345-.89 1.12-1.09 1.35-.2.23-.4.258-.745.086-.345-.172-1.456-.537-2.773-1.71-1.025-.913-1.717-2.04-1.918-2.385-.2-.345-.022-.532.15-.703.155-.155.345-.403.517-.604.172-.2.23-.345.345-.575.115-.23.057-.432-.029-.604-.086-.172-.776-1.87-1.063-2.56-.28-.672-.564-.58-.776-.59l-.66-.012c-.23 0-.604.086-.92.432-.316.345-1.205 1.178-1.205 2.872s1.234 3.33 1.406 3.56c.172.23 2.428 3.71 5.882 5.203.822.355 1.463.567 1.963.726.824.263 1.574.226 2.167.137.66-.099 2.04-.834 2.328-1.638.287-.804.287-1.493.2-1.638-.086-.144-.316-.23-.66-.402z"/>
                  </svg>
                  Send WhatsApp Notification
                </a>
                <button onClick={() => { setLastStatusChanged(null); setShowTrackingInput(false); setTrackingId(''); setPackageImageUrl('') }}
                  className="text-xs text-gray-400 hover:text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100">
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Screenshot zoom modal */}
      {screenshotZoom && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setScreenshotZoom(false)}>
          <button className="absolute top-4 right-4 text-white bg-white/10 p-2 rounded-xl">
            <X className="w-5 h-5" />
          </button>
          <img src={order.payment_screenshot} alt="Screenshot" className="max-w-full max-h-full rounded-2xl" />
        </div>
      )}
    </div>
  )
}
