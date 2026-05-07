import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { cart, removeItem, updateQuantity, totalPrice, clearCart } = useCart()

  const handleRemove = (id, variant, name) => {
    removeItem(id, variant)
    toast.success(`${name} removed from cart`, {
      icon: '🗑️',
      style: { borderRadius: '12px', background: '#fff7ed', color: '#92400e' },
    })
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center px-4">
        <ShoppingBag className="w-20 h-20 text-amber-200 mb-6" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 text-center">Add some beautiful traditional products to get started.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-full transition-colors"
        >
          Continue Shopping
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <button
            onClick={() => { clearCart(); toast.success('Cart cleared') }}
            className="text-sm text-red-500 hover:text-red-600 font-medium"
          >
            Clear all
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={`${item.id}-${item.selectedVariant}`}
                className="bg-white rounded-2xl border border-amber-100 p-4 flex gap-4 shadow-sm"
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{item.name}</h3>
                  {item.selectedVariant && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                      {item.selectedVariant}
                    </span>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedVariant, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-amber-50 transition-colors"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedVariant, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-amber-50 transition-colors"
                        aria-label="Increase"
                      >
                        <Plus className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-amber-600">₹{(item.price * item.quantity).toLocaleString()}</span>
                      <button
                        onClick={() => handleRemove(item.id, item.selectedVariant, item.name)}
                        className="text-red-400 hover:text-red-600 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span>
                  <span className="text-amber-600">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-full transition-colors shadow-lg shadow-amber-200"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/"
                className="w-full flex items-center justify-center mt-3 text-sm text-amber-700 hover:text-amber-800 font-medium"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
