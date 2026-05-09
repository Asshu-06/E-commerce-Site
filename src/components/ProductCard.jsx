import { useState } from 'react'
import { ShoppingCart, MessageCircle, Plus, Minus, Heart, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { sendToWhatsApp } from '../lib/whatsapp'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addItem }                       = useCart()
  const { isWishlisted, toggleWishlist }  = useWishlist()
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || '')
  const [quantity, setQuantity]           = useState(1)
  const [added, setAdded]                 = useState(false)

  const isCustomization = product.type === 'customization'
  const wishlisted      = isWishlisted(product.id)

  const handleAddToCart = () => {
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
        <button onClick={(e) => { e.preventDefault(); toggleWishlist(product) }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
            wishlisted
              ? 'bg-red-500 text-white scale-110'
              : 'bg-white/90 text-gray-400 hover:text-red-500 hover:scale-110 opacity-0 group-hover:opacity-100'
          }`}>
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isCustomization && (
            <span className="flex items-center gap-1 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              <MessageCircle className="w-3 h-3" /> Custom
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

        {/* Variants */}
        {!isCustomization && product.variants?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.variants.map((v) => (
              <button key={v} onClick={() => setSelectedVariant(v)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                  selectedVariant === v
                    ? 'bg-[#C8511B] text-white border-amber-500'
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
              <span className="w-7 text-center text-sm font-semibold text-gray-800">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <button onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold py-2 px-3 rounded-xl transition-all duration-300 ${
                added
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
            <MessageCircle className="w-4 h-4" />
            Enquire on WhatsApp
          </button>
        )}
      </div>
    </div>
  )
}
