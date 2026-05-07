import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, CheckCircle2, CreditCard, Truck } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { openRazorpay } from '../lib/razorpay'
import toast from 'react-hot-toast'

const INITIAL_FORM = {
  name: '', phone: '', email: '',
  address: '', city: '', pincode: '',
  paymentMethod: 'cod',
}

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]           = useState(() => ({
    ...INITIAL_FORM,
    name:  user?.user_metadata?.full_name || '',
    email: user?.email || '',
  }))
  const [submitting, setSubmitting] = useState(false)
  const [ordered, setOrdered]       = useState(false)
  const [orderId, setOrderId]       = useState(null)
  const [paymentId, setPaymentId]   = useState(null)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    if (!form.name.trim())                  return 'Please enter your name.'
    if (!/^\d{10}$/.test(form.phone))       return 'Please enter a valid 10-digit phone number.'
    if (!form.address.trim())               return 'Please enter your address.'
    if (!form.city.trim())                  return 'Please enter your city.'
    if (!/^\d{6}$/.test(form.pincode))      return 'Please enter a valid 6-digit pincode.'
    return null
  }

  // ── Save order to Supabase ──────────────────────────────────────────────
  const saveOrder = async ({ paymentMethod, paymentStatus, razorpayPaymentId = null }) => {
    const orderData = {
      user_id:            user?.id || null,
      user_name:          form.name,
      phone:              form.phone,
      email:              form.email || null,
      address:            `${form.address}, ${form.city} - ${form.pincode}`,
      items:              cart.map((i) => ({
        id: i.id, name: i.name,
        variant: i.selectedVariant,
        quantity: i.quantity, price: i.price,
      })),
      total_price:        totalPrice,
      payment_method:     paymentMethod,
      payment_status:     paymentStatus,
      razorpay_payment_id: razorpayPaymentId,
      status:             paymentStatus === 'paid' ? 'confirmed' : 'pending',
    }

    try {
      const { data, error } = await supabase.from('orders').insert([orderData]).select().single()
      if (!error && data) return data.id
    } catch { /* fall through */ }
    return `ORD-${Date.now()}`
  }

  // ── COD flow ────────────────────────────────────────────────────────────
  const handleCOD = async () => {
    setSubmitting(true)
    try {
      const id = await saveOrder({ paymentMethod: 'cod', paymentStatus: 'pending' })
      setOrderId(id)
      clearCart()
      setOrdered(true)
      toast.success('Order placed successfully!')
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  // ── Razorpay flow ───────────────────────────────────────────────────────
  const handleRazorpay = async () => {
    setSubmitting(true)
    try {
      await openRazorpay({
        amount:      totalPrice,
        orderId:     `ORD-${Date.now()}`,
        name:        form.name,
        email:       form.email,
        phone:       form.phone,
        description: `Order from Shubham Traditions`,
        onSuccess: async (response) => {
          const pid = response.razorpay_payment_id
          setPaymentId(pid)
          const id = await saveOrder({
            paymentMethod:     'razorpay',
            paymentStatus:     'paid',
            razorpayPaymentId: pid,
          })
          setOrderId(id)
          clearCart()
          setOrdered(true)
          toast.success('Payment successful! Order confirmed.')
          setSubmitting(false)
        },
        onFailure: (reason) => {
          if (reason !== 'dismissed') {
            toast.error(`Payment failed: ${reason}`)
          }
          setSubmitting(false)
        },
      })
    } catch (err) {
      toast.error('Payment could not be initiated.')
      setSubmitting(false)
    }
  }

  // ── Form submit ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { toast.error(err); return }
    if (cart.length === 0) { toast.error('Your cart is empty.'); return }

    if (form.paymentMethod === 'razorpay') {
      await handleRazorpay()
    } else {
      await handleCOD()
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────
  if (ordered) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-white rounded-3xl shadow-lg border border-green-100 p-10 max-w-md w-full">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {paymentId ? 'Payment Successful!' : 'Order Placed!'}
          </h2>
          <p className="text-gray-500 mb-2">Thank you for your order.</p>
          {orderId && (
            <p className="text-sm text-gray-400 mb-2">
              Order ID: <span className="font-mono font-semibold text-gray-700 text-xs">{orderId}</span>
            </p>
          )}
          {paymentId && (
            <p className="text-sm text-gray-400 mb-2">
              Payment ID: <span className="font-mono font-semibold text-green-700 text-xs">{paymentId}</span>
            </p>
          )}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${
            paymentId ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {paymentId ? '✓ Payment Confirmed' : '⏳ Cash on Delivery'}
          </div>
          <p className="text-sm text-gray-500 mb-8">
            We'll contact you on <strong>{form.phone}</strong> to confirm your order.
          </p>
          <div className="flex flex-col gap-3">
            {user && (
              <Link to="/profile"
                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-full transition-colors">
                View My Orders
              </Link>
            )}
            <Link to="/"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold px-8 py-3 rounded-full transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Your cart is empty</h2>
        <Link to="/" className="text-amber-600 hover:underline">← Back to Shopping</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-amber-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/cart" className="hover:text-amber-600">Cart</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium">Checkout</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Contact */}
            <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit mobile" maxLength={10} required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">Delivery Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address *</label>
                  <textarea name="address" value={form.address} onChange={handleChange}
                    placeholder="House no., street, area..." rows={2} required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
                    <input name="city" value={form.city} onChange={handleChange} placeholder="City" required
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode *</label>
                    <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit pincode" maxLength={6} required
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-3">
                {/* COD */}
                <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  form.paymentMethod === 'cod' ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-amber-200'
                }`}>
                  <input type="radio" name="paymentMethod" value="cod"
                    checked={form.paymentMethod === 'cod'} onChange={handleChange} className="mt-0.5 accent-amber-500" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-amber-600" />
                      <span className="font-medium text-gray-900 text-sm">Cash on Delivery</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Pay when your order arrives</p>
                  </div>
                </label>

                {/* Razorpay */}
                <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  form.paymentMethod === 'razorpay' ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-200'
                }`}>
                  <input type="radio" name="paymentMethod" value="razorpay"
                    checked={form.paymentMethod === 'razorpay'} onChange={handleChange} className="mt-0.5 accent-blue-500" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-900 text-sm">Pay Online</span>
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">Razorpay</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">UPI, Cards, Net Banking, Wallets — instant confirmation</p>
                    {/* Razorpay accepted payment icons */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {['UPI', 'Visa', 'Mastercard', 'RuPay', 'Paytm'].map((m) => (
                        <span key={m} className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded font-medium text-gray-600">{m}</span>
                      ))}
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-sm sticky top-24">
              <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.selectedVariant}`} className="flex gap-3">
                    <img src={item.image_url} alt={item.name} className="w-12 h-12 object-cover rounded-lg shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                      {item.selectedVariant && <p className="text-xs text-gray-400">{item.selectedVariant}</p>}
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-semibold text-amber-600 shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm mb-5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span><span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-1">
                  <span>Total</span>
                  <span className="text-amber-600">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <button type="submit" disabled={submitting}
                className={`w-full flex items-center justify-center gap-2 text-white font-semibold py-3 px-6 rounded-full transition-all shadow-lg disabled:opacity-60 ${
                  form.paymentMethod === 'razorpay'
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                    : 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                }`}>
                {submitting ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Processing...</>
                ) : form.paymentMethod === 'razorpay' ? (
                  <><CreditCard className="w-4 h-4" />Pay ₹{totalPrice.toLocaleString()}</>
                ) : (
                  'Place Order'
                )}
              </button>

              {form.paymentMethod === 'razorpay' && (
                <p className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                  🔒 Secured by Razorpay
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
