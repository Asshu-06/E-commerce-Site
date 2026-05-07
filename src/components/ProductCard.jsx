import { useState } from 'react'
import { ShoppingCart, MessageCircle, Plus, Minus } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { sendToWhatsApp } from '../lib/whatsapp'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || '')
  const [quantity, setQuantity] = useState(1)

  const isCustomization = product.type === 'customization'

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity)
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      style: { borderRadius: '12px', background: '#fff7ed', color: '#92400e' },
    })
  }

  const handleWhatsApp = () => {
    sendToWhatsApp(product.name)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-amber-100 hover:border-amber-200">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {isCustomization && (
          <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            WhatsApp Only
          </div>
        )}
        {!isCustomization && product.price && (
          <div className="absolute top-3 right-3 bg-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full">
            ₹{product.price}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm sm:text-base">{product.name}</h3>
        <p className="text-gray-500 text-xs sm:text-sm mb-3 line-clamp-2">{product.description}</p>

        {/* Standard product controls */}
        {!isCustomization && (
          <>
            {/* Variant selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1.5">
                  {product.variants.map((v) => (
                    <button
                      key={v}
                      onClick={() => setSelectedVariant(v)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        selectedVariant === v
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center hover:bg-amber-50 transition-colors text-gray-600"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-medium text-gray-800">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-amber-50 transition-colors text-gray-600"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-2 px-3 rounded-full transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          </>
        )}

        {/* Customization WhatsApp button */}
        {isCustomization && (
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-4 rounded-full transition-colors text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            Enquire on WhatsApp
          </button>
        )}
      </div>
    </div>
  )
}
