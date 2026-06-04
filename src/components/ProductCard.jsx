import { useState } from 'react'
import { ShoppingCart, Plus, Minus, Heart, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { sendToWhatsApp } from '../lib/whatsapp'
import LoginPromptModal from './LoginPromptModal'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addItem }                       = useCart()
  const { isWishlisted, toggleWishlist }  = useWishlist()
  const { user }                          = useAuth()
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || '')
  const [quantity, setQuantity]           = useState(1)
  const [added, setAdded]                 = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const isCustomization = product.type === 'customization'
  const wishlisted      = isWishlisted(product.id)
  const isOutOfStock    = product.stock_quantity != null && product.stock_quantity <= 0

  const handleAddToCart = () => {
    if (!user) {
      setShowLoginModal(true)
      return
    }
    addItem(product, selectedVariant, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
    toast.success(`Added to cart!`, {
      icon: '🛒',
      style: { borderRadius: '12px', background: '#1c1917', color: '#fef3c7', fontSize: '14px' },
    })
  }

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 card-hover">
      {/* Image */}
      <div className="relative overflow-hidden bg-stone-100" style={{ aspectRatio: '4/3' }}>
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>
          )}
        </Link>

        {/* Overlay on hover — pointer-events-none so clicks pass through to link */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Wishlist */}
        <button onClick={(e) => { e.preventDefault(); if (!user) { setShowLoginModal(true); return; } toggleWishlist(product) }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
            wishlisted
              ? 'bg-red-500 text-white scale-110'
              : 'bg-white/90 text-gray-400 hover:text-red-500 hover:scale-110 opacity-0 group-hover:opacity-100'
          }`}>
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isOutOfStock && (
            <span className="bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              Out of Stock
            </span>
          )}
        </div>

        {/* Price bottom-left */}
        {!isCustomization && product.price && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-white/95 backdrop-blur-sm text-gray-900 text-sm font-bold px-3 py-1 rounded-full shadow-md">
              ₹{product.price}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name */}
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 hover:text-[#C8511B] transition-colors mb-1">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[1,2,3,4,5].map((s) => (
            <Star key={s} className={`w-3 h-3 ${s <= 4 ? 'text-[#D4A017] fill-[#D4A017]' : 'text-gray-200 fill-gray-200'}`} />
          ))}
          <span className="text-[11px] text-gray-400 ml-1">4.0</span>
        </div>

        {/* Magnet option — only for Pasupu-Kumkuma */}
        {!isCustomization && product.category === 'pasupu' && product.variants?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.variants.map((v) => (
              <button key={v} onClick={() => setSelectedVariant(v)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                  selectedVariant === v
                    ? 'bg-[#C8511B] text-white border-[#C8511B]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-[#E8895A]'
                }`}>
                {v}
              </button>
            ))}
          </div>
        )}

        {/* Standard controls */}
        {!isCustomization && (
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500">
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => {
                  const v = parseInt(e.target.value)
                  if (!isNaN(v) && v >= 1) setQuantity(v)
                  else if (e.target.value === '') setQuantity('')
                }}
                onBlur={(e) => {
                  const v = parseInt(e.target.value)
                  setQuantity(!isNaN(v) && v >= 1 ? v : 1)
                }}
                className="w-8 text-center text-sm font-semibold text-gray-800 bg-gray-50 border-none outline-none"
              />
              <button onClick={() => setQuantity(q => (parseInt(q) || 0) + 1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <button onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold py-2 px-3 rounded-xl transition-all duration-300 ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : added
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-900 hover:bg-[#C8511B] text-white'
              }`}>
              <ShoppingCart className="w-3.5 h-3.5" />
              {added ? 'Added!' : 'Add to Cart'}
            </button>
          </div>
        )}

        {/* WhatsApp */}
        {isCustomization && (
          <button onClick={() => sendToWhatsApp(product.name)}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.882a.5.5 0 0 0 .61.61l6.087-1.461A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.878 9.878 0 0 1-5.031-1.378l-.36-.214-3.733.897.933-3.64-.235-.374A9.861 9.861 0 0 1 2.1 12C2.1 6.533 6.533 2.1 12 2.1c5.467 0 9.9 4.433 9.9 9.9 0 5.467-4.433 9.9-9.9 9.9z"/>
            </svg>
            Enquire on WhatsApp
          </button>
        )}
      </div>

      {/* Login prompt modal */}
      <LoginPromptModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectTo={`/product/${product.id}`}
      />
    </div>
  )
}
