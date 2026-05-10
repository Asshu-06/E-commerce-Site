import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, CheckCircle2, Smartphone, ImagePlus, X, Clock, Copy, Check } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const UPI_ID   = import.meta.env.VITE_UPI_ID   || 'q901588902@ybl'
const UPI_NAME = import.meta.env.VITE_UPI_NAME || 'Lakshmi Ram Collections'

const INITIAL_FORM = {
  name: '', phone: '', email: '',
  address: '', city: '', pincode: '',
  paymentMethod: 'upi',
}

// Generate UPI deep-link string for QR
function buildUpiString(amount, orderId) {
  // Round to 2 decimal places, ensure no trailing zeros issue
  const amountStr = parseFloat(amount).toFixed(2)
  // Keep transaction note simple — no special characters
  const note = encodeURIComponent(`LakshmiRamCollections ${orderId}`)
  const name = encodeURIComponent(UPI_NAME)
  return `upi://pay?pa=${UPI_ID}&pn=${name}&am=${amountStr}&cu=INR&tn=${note}&mode=02&purpose=00`
}

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart()
  const { user } = useAuth()

  const [form, setForm]               = useState(() => ({
    ...INITIAL_FORM,
    name:  user?.user_metadata?.full_name || '',
    email: user?.email || '',
  }))
  const [step, setStep]               = useState('form')   // 'form' | 'upi' | 'success'
  const [submitting, setSubmitting]   = useState(false)
  const [orderId, setOrderId]         = useState(null)
  const [snapshotTotal, setSnapshotTotal] = useState(0)  // locked total before cart clears
  const [tempOrderId]                 = useState(`ST${Date.now().toString().slice(-6)}`)
  const [screenshot, setScreenshot]   = useState(null)
  const [screenshotPreview, setScreenshotPreview] = useState('')
  const [uploading, setUploading]     = useState(false)
  const [copied, setCopied]           = useState(false)
  const fileRef                       = useRef(null)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  // Calculate shipping based on state (city field used as proxy — user enters state in city)
  const AP_TS_KEYWORDS = ['andhra', 'telangana', 'ap', 'ts', 'hyderabad', 'vijayawada',
    'visakhapatnam', 'vizag', 'warangal', 'tirupati', 'guntur', 'nellore', 'kurnool',
    'kadapa', 'anantapur', 'karimnagar', 'nizamabad', 'khammam', 'rajahmundry', 'eluru',
    'ongole', 'srikakulam', 'vizianagaram', 'bhimavaram', 'tenali', 'machilipatnam',
    'adilabad', 'mahabubnagar', 'medak', 'nalgonda', 'sangareddy', 'suryapet', 'skota',
    'srikakulam', 'vizag', 'vsp']
  const isAPTS = AP_TS_KEYWORDS.some(k =>
    form.city.toLowerCase().includes(k) || form.address.toLowerCase().includes(k)
  )
  const shippingCharge = form.city.trim() ? (isAPTS ? 80 : 100) : 0
  const grandTotal = totalPrice + shippingCharge

  const validate = () => {
    if (!form.name.trim())             return 'Please enter your name.'
    if (!/^\d{10}$/.test(form.phone))  return 'Please enter a valid 10-digit phone number.'
    if (!form.address.trim())          return 'Please enter your address.'
    if (!form.city.trim())             return 'Please enter your city.'
    if (!/^\d{6}$/.test(form.pincode)) return 'Please enter a valid 6-digit pincode.'
    return null
  }

  // ── Step 1: validate form → always go to UPI QR ──────────────────────
  const handleFormSubmit = (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { toast.error(err); return }
    if (cart.length === 0) { toast.error('Your cart is empty.'); return }
    setSnapshotTotal(grandTotal)  // lock the total before cart can change
    setStep('upi')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Screenshot picked ───────────────────────────────────────────────────
  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image'); return }
    if (file.size > 10 * 1024 * 1024)   { toast.error('File must be under 10MB'); return }
    setScreenshot(file)
    setScreenshotPreview(URL.createObjectURL(file))
  }

  // ── Upload screenshot + save order ─────────────────────────────────────
  const handleUpiConfirm = async () => {
    if (!screenshot) { toast.error('Please upload your payment screenshot'); return }
    setUploading(true)
    try {
      let screenshotUrl = null

      // Upload to Supabase Storage
      const ext  = screenshot.name.split('.').pop().toLowerCase()
      const path = `payment-screenshots/${tempOrderId}-${Date.now()}.${ext}`

      const { error: upErr } = await supabase.storage
        .from('product-images')
        .upload(path, screenshot, { cacheControl: '3600', upsert: true })

      if (upErr) {
        console.error('Storage upload error:', upErr)
        // Fallback: base64 (works but large)
        screenshotUrl = await new Promise((res, rej) => {
          const r = new FileReader()
          r.onload  = () => res(r.result)
          r.onerror = rej
          r.readAsDataURL(screenshot)
        })
        toast('Screenshot saved locally — storage bucket may need setup.', { icon: 'ℹ️' })
      } else {
        screenshotUrl = supabase.storage
          .from('product-images')
          .getPublicUrl(path).data.publicUrl
      }

      if (!screenshotUrl) {
        toast.error('Failed to upload screenshot. Please try again.')
        setUploading(false)
        return
      }

      const id = await saveOrder({
        paymentMethod:  'upi',
        paymentStatus:  'pending_verification',
        screenshotUrl,
      })
      setOrderId(id)
      clearCart()
      setStep('success')
      window.scrollTo({ top: 0, behavior: 'instant' })
      toast.success('Order submitted! Admin will verify your payment.')
    } catch (err) {
      console.error('UPI confirm error:', err)
      toast.error(err.message || 'Failed to submit order. Please try again.')
    }
    setUploading(false)
  }

  // ── Save order to Supabase ──────────────────────────────────────────────
  const saveOrder = async ({ paymentMethod, paymentStatus, screenshotUrl }) => {
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
      total_price:        snapshotTotal,
      payment_method:     paymentMethod,
      payment_status:     paymentStatus,
      status:             'pending',
    }

    // Add screenshot only if provided (column may not exist yet)
    if (screenshotUrl) {
      orderData.payment_screenshot = screenshotUrl
    }

    const { data, error } = await supabase.from('orders').insert([orderData]).select().single()

    if (error) {
      console.error('Supabase order insert error:', error)
      // If payment_screenshot column missing, retry without it
      if (error.message?.includes('payment_screenshot') || error.code === '42703') {
        delete orderData.payment_screenshot
        const { data: data2, error: error2 } = await supabase.from('orders').insert([orderData]).select().single()
        if (error2) throw new Error(error2.message)
        return data2.id
      }
      throw new Error(error.message)
    }

    return data.id
  }

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('UPI ID copied!')
  }

  // ── Success screen ──────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen pt-16 pb-16 bg-[#FAF7F2] flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 max-w-md w-full text-center">
          {/* Success icon */}
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Order Placed!</h2>
          <p className="text-gray-500 text-sm mb-5">Thank you, {form.name}. Your order has been received.</p>

          {/* Order ID */}
          {orderId && (
            <div className="bg-[#FDF3EC] rounded-2xl px-5 py-3 mb-5 border border-[#FAE3D3]">
              <p className="text-xs text-gray-400 mb-1">Order ID</p>
              <p className="font-mono font-bold text-[#8B3410] text-sm break-all">{orderId}</p>
            </div>
          )}

          {/* Payment verification notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 text-left">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-800 text-sm">Payment Under Verification</p>
                <p className="text-blue-700 text-xs mt-1 leading-relaxed">
                  Our admin will verify your UPI payment screenshot and confirm your order within <strong>1–2 hours</strong>.
                  We'll contact you on <strong>{form.phone}</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Amount summary */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-3 mb-6 text-sm">
            <span className="text-gray-500">Amount Paid</span>
            <span className="font-bold text-[#C8511B] text-lg">₹{snapshotTotal.toLocaleString()}</span>
          </div>

          <div className="flex flex-col gap-3">
            {user && (
              <Link to="/profile"
                className="flex items-center justify-center gap-2 bg-[#C8511B] hover:bg-[#B04516] text-white font-bold px-8 py-3.5 rounded-2xl transition-all hover:-translate-y-0.5 shadow-lg shadow-[#C8511B]/20">
                View My Orders
              </Link>
            )}
            <Link to="/"
              className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold px-8 py-3.5 rounded-2xl transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── UPI QR screen ───────────────────────────────────────────────────────
  if (step === 'upi') {
    const upiString = buildUpiString(snapshotTotal, tempOrderId)
    return (
      <div className="min-h-screen pt-20 pb-16 bg-[#FDF3EC]/50">
        <div className="max-w-lg mx-auto px-4 py-8">
          <button onClick={() => setStep('form')}
            className="flex items-center gap-1.5 text-sm text-[#8B3410] hover:text-amber-800 mb-6 font-medium">
            ← Back to checkout
          </button>

          <div className="bg-white rounded-3xl shadow-lg border border-[#FAE3D3] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 text-white text-center">
              <Smartphone className="w-8 h-8 mx-auto mb-2 opacity-90" />
              <h2 className="text-xl font-bold">Pay via UPI</h2>
              <p className="text-amber-100 text-sm mt-1">Scan QR or use UPI ID below</p>
            </div>

            <div className="p-6">
              {/* Amount */}
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-1">Amount to Pay</p>
                <p className="text-4xl font-bold text-[#C8511B]">₹{snapshotTotal.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Order: {tempOrderId}</p>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center mb-6">
                <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100 inline-block">
                  <QRCodeSVG
                    value={upiString}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#1a1a1a"
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-3">Scan with any UPI app</p>
                {/* UPI app icons */}
                <div className="flex items-center gap-3 mt-3">
                  {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                    <span key={app} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                      {app}
                    </span>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-gray-400">Or pay using UPI ID</span>
                </div>
              </div>

              {/* UPI ID copy */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6">
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-0.5">UPI ID</p>
                  <p className="font-mono font-semibold text-gray-900 text-sm">{UPI_ID}</p>
                </div>
                <button onClick={copyUpiId}
                  className="flex items-center gap-1.5 bg-[#C8511B] hover:bg-[#B04516] text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                <p className="text-xs font-semibold text-blue-800 mb-2">How to pay:</p>
                <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Open any UPI app (GPay, PhonePe, Paytm, BHIM)</li>
                  <li>Scan the QR code or enter the UPI ID</li>
                  <li>Amount of <strong>₹{totalPrice.toLocaleString()}</strong> will be auto-filled — just confirm</li>
                  <li>Complete the payment</li>
                  <li>Take a screenshot of the success screen</li>
                  <li>Upload it below to confirm your order</li>
                </ol>
              </div>

              {/* Screenshot upload */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">
                    Upload Payment Screenshot <span className="text-red-400">*</span>
                  </p>
                </div>

                {/* What to include reminder */}
                <div className="bg-[#FDF3EC] border border-[#F0B090] rounded-xl p-3 mb-3">
                  <p className="text-xs font-semibold text-amber-800 mb-1">📋 Screenshot must clearly show:</p>
                  <ul className="text-xs text-[#8B3410] space-y-0.5 list-disc list-inside">
                    <li>✅ Payment <strong>Success</strong> message</li>
                    <li>✅ Amount: <strong>₹{totalPrice.toLocaleString()}</strong></li>
                    <li>✅ Paid to: <strong>{UPI_ID}</strong></li>
                    <li>✅ Transaction ID / UTR number</li>
                  </ul>
                  <p className="text-xs text-red-600 font-medium mt-2">
                    ⚠️ Wrong or unclear screenshots will be rejected and order cancelled.
                  </p>
                </div>

                <div
                  onClick={() => fileRef.current?.click()}
                  className="relative w-full rounded-xl border-2 border-dashed border-gray-200 hover:border-[#D4631F] bg-gray-50 hover:bg-[#FDF3EC] transition-all cursor-pointer overflow-hidden group"
                  style={{ minHeight: screenshotPreview ? 'auto' : '120px' }}
                >
                  {screenshotPreview ? (
                    <div className="relative">
                      <img src={screenshotPreview} alt="Payment screenshot"
                        className="w-full max-h-64 object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-medium">Change Screenshot</span>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400 group-hover:text-[#C8511B] transition-colors p-4">
                      <ImagePlus className="w-8 h-8" />
                      <p className="text-sm font-medium text-center">Click to upload payment screenshot</p>
                      <p className="text-xs">PNG, JPG — max 10MB</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleScreenshotChange} className="hidden" />
                {screenshotPreview && (
                  <button onClick={() => { setScreenshot(null); setScreenshotPreview('') }}
                    className="mt-2 text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                    <X className="w-3 h-3" /> Remove screenshot
                  </button>
                )}
              </div>

              {/* Confirm button */}
              <button onClick={handleUpiConfirm} disabled={uploading || !screenshot}
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-colors text-base shadow-lg shadow-green-200">
                {uploading ? (
                  <><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Submitting Order...</>
                ) : (
                  <><CheckCircle2 className="w-5 h-5" />I've Paid — Confirm Order</>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">
                Your order will be confirmed after admin verifies the payment
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Checkout form ───────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Your cart is empty</h2>
        <Link to="/" className="text-[#C8511B] hover:underline">← Back to Shopping</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#C8511B]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/cart" className="hover:text-[#C8511B]">Cart</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium">Checkout</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handleFormSubmit} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Contact */}
            <div className="bg-white rounded-2xl border border-[#FAE3D3] p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8895A]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit mobile" maxLength={10} required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8895A]" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email (optional)</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8895A]" />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl border border-[#FAE3D3] p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">Delivery Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address *</label>
                  <textarea name="address" value={form.address} onChange={handleChange}
                    placeholder="House no., street, area..." rows={2} required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8895A] resize-none" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
                    <input name="city" value={form.city} onChange={handleChange} placeholder="City" required
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8895A]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode *</label>
                    <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit pincode" maxLength={6} required
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8895A]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment method — UPI only */}
            <div className="bg-white rounded-2xl border border-[#FAE3D3] p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">Payment Method</h2>
              <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-green-400 bg-green-50">
                <Smartphone className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">Pay via UPI</span>
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Only Option</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">GPay, PhonePe, Paytm, BHIM — scan QR on next step & upload screenshot</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                      <span key={app} className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-lg font-medium text-gray-600">{app}</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">
                🔒 Secure UPI payment · No card details required
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-[#FAE3D3] p-6 shadow-sm sticky top-24">
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
                    <span className="text-xs font-semibold text-[#C8511B] shrink-0">
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
                  <span>Shipping</span>
                  {form.city.trim() ? (
                    <span className="font-medium text-gray-900">
                      ₹{shippingCharge} <span className="text-xs text-gray-400">({isAPTS ? 'AP/TS' : 'Other state'})</span>
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Enter city to calculate</span>
                  )}
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-[#C8511B]">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-[#C8511B] hover:bg-[#B04516] disabled:bg-amber-300 text-white font-semibold py-3 px-6 rounded-full transition-colors shadow-lg shadow-[#C8511B]/20">
                {submitting ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Processing...</>
                ) : (
                  'Continue to Pay via UPI'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
