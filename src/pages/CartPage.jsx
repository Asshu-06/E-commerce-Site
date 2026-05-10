import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, AlertCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { calcShipping, MIN_ORDER_QTY } from '../lib/shipping'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { cart, removeItem, updateQuantity, totalPrice, clearCart } = useCart()

  const totalQty     = cart.reduce((s, i) => s + i.quantity, 0)
  const belowMin     = totalQty < MIN_ORDER_QTY && cart.length > 0
  const remaining    = MIN_ORDER_QTY - totalQty

  // Show shipping range (AP/TS vs others) based on qty
  const shippingAPTS = totalQty > 0 ? calcShipping(totalQty, true)  : 0
  const shippingOther = totalQty > 0 ? calcShipping(totalQty, false) : 0

  const handleRemove = (id, variant, name) => {
    removeItem(id, variant)
    toast.success(`Removed from cart`, {
      style: { borderRadius: '12px', background: '#1c1917', color: '#fef3c7', fontSize: '14px' },
    })
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center px-4 text-center bg-stone-50">
        <div className="w-24 h-24 bg-[#FDF3EC] rounded-3xl flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-amber-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-sm">Add some beautiful traditional products to get started.</p>
        <Link to="/"
          className="inline-flex items-center gap-2 bg-gray-900 hover:bg-[#C8511B] text-white font-semibold px-8 py-3.5 rounded-2xl transition-all hover:-translate-y-0.5">
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-stone-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-500 text-sm mt-1">{cart.reduce((s, i) => s + i.quantity, 0)} items</p>
          </div>
          <button onClick={() => { clearCart(); toast.success('Cart cleared') }}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors font-medium">
            Clear all
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.map((item) => (
              <div key={`${item.id}-${item.selectedVariant}`}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 hover:border-[#F0B090] transition-colors">
                <Link to={`/product/${item.id}`} className="shrink-0">
                  <img src={item.image_url} alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl bg-stone-100" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.id}`}>
                    <h3 className="font-semibold text-gray-900 text-sm hover:text-[#C8511B] transition-colors line-clamp-2">{item.name}</h3>
                  </Link>
                  {item.selectedVariant && (
                    <span className="inline-block text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg mt-1">{item.selectedVariant}</span>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                      <button onClick={() => updateQuantity(item.id, item.selectedVariant, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.selectedVariant, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                      <button onClick={() => handleRemove(item.id, item.selectedVariant, item.name)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h2 className="font-bold text-gray-900 mb-5 text-lg">Order Summary</h2>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-medium text-gray-900">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className="text-xs text-gray-400 text-right">AP/TS: ₹{shippingAPTS}<br/>Others: ₹{shippingOther}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                  <span>Subtotal (excl. shipping)</span>
                  <span className="text-[#C8511B] text-xl">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Min order warning */}
              {belowMin && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Minimum {MIN_ORDER_QTY} pieces</strong> required. Add <strong>{remaining} more</strong> to checkout.
                  </span>
                </div>
              )}

              {/* Shipping note */}
              <div className="bg-[#FDF3EC] rounded-xl px-4 py-3 mb-4 text-xs text-[#8B3410]">
                🚚 <strong>Shipping charges</strong> based on quantity & location:<br/>
                <span className="text-gray-500">≤100 pcs: AP/TS ₹80 · Others ₹100</span><br/>
                <span className="text-gray-500">≤200 pcs: AP/TS ₹150 · Others ₹170</span><br/>
                <span className="text-gray-500">≤300 pcs: AP/TS ₹200 · Others ₹220</span><br/>
                <span className="text-gray-400 text-[10px]">Final total calculated at checkout</span>
              </div>

              <Link to="/checkout"
                className={`w-full flex items-center justify-center gap-2 font-bold py-4 px-6 rounded-2xl transition-all text-base ${
                  belowMin
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
                    : 'bg-gray-900 hover:bg-[#C8511B] text-white shadow-lg shadow-black/10 hover:-translate-y-0.5'
                }`}>
                {belowMin ? `Add ${remaining} more pieces` : <>Proceed to Checkout <ArrowRight className="w-4 h-4" /></>}
              </Link>

              <Link to="/"
                className="w-full flex items-center justify-center mt-3 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
