import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, XCircle, ImageIcon, ZoomIn, X, Package } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { mockProducts } from '../lib/mockData'
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
    setUpdating(true)
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
      if (error) throw error
      setOrder(o => ({ ...o, status: newStatus }))
      toast.success(`Status updated to ${newStatus}`)
    } catch (err) { toast.error(err.message) }
    setUpdating(false)
  }

  const verifyPayment = async () => {
    setUpdating(true)
    try {
      const { error } = await supabase.from('orders').update({ payment_status: 'paid', status: 'confirmed' }).eq('id', orderId)
      if (error) throw error
      setOrder(o => ({ ...o, payment_status: 'paid', status: 'confirmed' }))
      toast.success('✅ Payment verified! Order confirmed.')
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
      toast.error('❌ Payment rejected.')
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
        {/* UPI verification */}
        {order.payment_status === 'pending_verification' && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
            <p className="font-bold text-orange-800 mb-1">⏳ UPI Payment Pending Verification</p>
            <p className="text-orange-700 text-sm mb-4">Customer uploaded a payment screenshot. Review and verify or reject.</p>
            {order.payment_screenshot && (
              <div className="mb-4">
                <div className="relative rounded-2xl overflow-hidden bg-gray-900 cursor-zoom-in" onClick={() => setScreenshotZoom(true)}>
                  <img src={order.payment_screenshot} alt="Payment screenshot" className="w-full max-h-72 object-contain" />
                  <div className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-lg">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                </div>
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

        {/* Update status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">Update Order Status</h2>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((s) => (
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
