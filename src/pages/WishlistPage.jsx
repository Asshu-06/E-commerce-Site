import { Link, useNavigate } from 'react-router-dom'
import { Heart, Trash2, ShoppingCart, ArrowRight } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function WishlistPage() {
  const { items, removeFromWishlist, loading } = useWishlist()
  const { addItem } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleMoveToCart = (item) => {
    const product = item.product
    addItem(
      {
        id:        product.id,
        name:      product.name,
        price:     product.price,
        image_url: product.image_url,
        category:  product.category,
      },
      product.variants?.[0] || null,
      1
    )
    removeFromWishlist(product.id)
    toast.success('Moved to cart 🛒', {
      style: { borderRadius: '12px', background: '#1c1917', color: '#fef3c7', fontSize: '14px' },
    })
  }

  const handleRemove = (productId) => {
    removeFromWishlist(productId)
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center px-4 text-center bg-stone-50">
        <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mb-6">
          <Heart className="w-12 h-12 text-red-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to see your wishlist</h2>
        <p className="text-gray-500 mb-8 max-w-sm">Save your favourite products and come back to them anytime.</p>
        <Link to="/login"
          className="inline-flex items-center gap-2 bg-gray-900 hover:bg-[#C8511B] text-white font-semibold px-8 py-3.5 rounded-2xl transition-all hover:-translate-y-0.5">
          Sign In <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-red-200 border-t-red-500 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading wishlist...</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center px-4 text-center bg-stone-50">
        <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mb-6">
          <Heart className="w-12 h-12 text-red-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-8 max-w-sm">Browse our collection and save the products you love.</p>
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              Wishlist
            </h1>
            <p className="text-gray-500 text-sm mt-1">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
          </div>
        </div>

        {/* Grid of wishlist items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const product = item.product
            if (!product) return null
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-[#F0B090] hover:shadow-md transition-all group"
              >
                {/* Image */}
                <Link to={`/product/${product.id}`} className="block relative overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Remove button overlay */}
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-white shadow transition-all"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Link>

                {/* Info */}
                <div className="p-4">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold text-gray-900 text-sm hover:text-[#C8511B] transition-colors line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                  </Link>
                  {product.category && (
                    <span className="inline-block text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg mb-3">
                      {product.category}
                    </span>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-base">
                      ₹{Number(product.price).toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="flex items-center gap-1.5 bg-gray-900 hover:bg-[#C8511B] text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all hover:-translate-y-0.5"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom continue shopping */}
        <div className="mt-8 text-center">
          <Link to="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
