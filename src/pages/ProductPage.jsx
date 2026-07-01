import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart, Heart, ChevronRight,
  Star, Truck, Shield, Plus, Minus,
  Share2, Check, ArrowLeft
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { mockProducts } from '../lib/mockData'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { sendToWhatsApp } from '../lib/whatsapp'
import ProductCard from '../components/ProductCard'
import ProductReviews from '../components/ProductReviews'
import LoginPromptModal from '../components/LoginPromptModal'
import toast from 'react-hot-toast'

const CAT_LABELS = { pasupu: 'Pasupu-Kumkuma', gifts: 'Return Gifts', bags: 'Return Bags' }

export default function ProductPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { addItem, cart } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const { user } = useAuth()

  const [product, setProduct]           = useState(null)
  const [related, setRelated]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [selectedVariant, setSelectedVariant] = useState('')
  const [quantity, setQuantity]         = useState(1)
  const [showLoginModal, setShowLoginModal] = useState(false)

  // Magnet adds ₹3 per piece
  const magnetExtra    = selectedVariant === 'With Magnet (+₹3)' ? 3 : 0
  const effectivePrice = (product?.price || 0) + magnetExtra
  const qty            = parseInt(quantity) || 0
  const [selectedImage, setSelectedImage] = useState(0)
  const [addedToCart, setAddedToCart]   = useState(false)
  const [copied, setCopied]             = useState(false)

  // Check if product is already in cart
  const inCart = product ? cart.some(i => String(i.id) === String(product.id)) : false
  const isGoToCart = addedToCart || inCart

  useEffect(() => {
    fetchProduct()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [productId])

  const fetchProduct = async () => {
    setLoading(true)
    let found = null

    // Try Supabase first
    try {
      const { data, error } = await supabase
        .from('products').select('*').eq('id', productId).single()
      if (!error && data) found = data
    } catch { }

    // Fallback to mock data
    if (!found) {
      found = mockProducts.find((p) => String(p.id) === String(productId))
    }

    if (found) {
      setProduct(found)
      setSelectedVariant(found.variants?.[0] || '')
      fetchRelated(found.category, found.id)
    } else {
      navigate('/', { replace: true })
    }
    setLoading(false)
  }

  const fetchRelated = async (category, currentId) => {
    let items = []
    try {
      const { data, error } = await supabase
        .from('products').select('*')
        .eq('category', category)
        .eq('type', 'standard')
        .neq('id', currentId)
        .limit(4)
      if (!error && data && data.length > 0) items = data
    } catch { }

    if (items.length === 0) {
      items = mockProducts
        .filter((p) => p.category === category && String(p.id) !== String(currentId) && p.type === 'standard')
        .slice(0, 4)
    }
    setRelated(items)
  }

  const handleAddToCart = () => {
    if (!product) return
    if (!user) {
      setShowLoginModal(true)
      return
    }
    const productToAdd = magnetExtra > 0 ? { ...product, price: effectivePrice } : product
    addItem(productToAdd, selectedVariant, qty)
    setAddedToCart(true)
    // Don't reset — button stays as "Go to Cart"
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      style: { borderRadius: '12px', background: '#fff7ed', color: '#92400e' },
    })
  }

  const handleBuyNow = () => {
    if (!product) return
    if (!user) {
      setShowLoginModal(true)
      return
    }
    const productToAdd = magnetExtra > 0 ? { ...product, price: effectivePrice } : product
    // Navigate to checkout with only this product — don't touch the cart
    navigate('/checkout', {
      state: {
        buyNowItem: {
          ...productToAdd,
          selectedVariant,
          quantity: qty,
        }
      }
    })
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              {[1,2,3,4,5].map((i) => <div key={i} className="h-8 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  const isCustomization = product.type === 'customization'
  const wishlisted = isWishlisted(product.id)
  const catLabel = CAT_LABELS[product.category] || product.category
  const minQty = product.min_quantity || 1
  const isOutOfStock = product.stock_quantity != null && product.stock_quantity <= 0

  // Build image array from image_urls (multi) or fallback to single image_url
  const images = (Array.isArray(product.image_urls) && product.image_urls.length > 0
    ? product.image_urls
    : product.image_url ? [product.image_url] : []
  ).filter(Boolean)

  return (
    <div className="min-h-screen pt-16 pb-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-[#C8511B] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to={`/category/${product.category}`} className="hover:text-[#C8511B] transition-colors">
            {catLabel}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Back button mobile */}
        <button onClick={() => navigate(-1)}
          className="md:hidden flex items-center gap-1.5 text-sm text-[#8B3410] font-medium mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Main product section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="grid lg:grid-cols-2 gap-0">

            {/* ── Left: Image gallery ── */}
            <div className="p-6 lg:p-8 bg-[#FDF3EC]/30 flex flex-col gap-4">
              {/* Main image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-sm border border-[#FAE3D3]">
                {images[selectedImage] ? (
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">🛍️</div>
                )}
                {/* Wishlist on image */}
                <button
                  onClick={() => { if (!user) { setShowLoginModal(true); return; } toggleWishlist(product) }}
                  className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
                    wishlisted ? 'bg-red-500 text-white scale-110' : 'bg-white text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
                </button>
                {/* Share */}
                <button
                  onClick={handleShare}
                  className="absolute top-3 left-3 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-500 hover:text-[#C8511B] transition-colors"
                >
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
                </button>
              </div>

              {/* Thumbnail strip — scrollable row, only when multiple images */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setSelectedImage(i)}
                      className={`w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === i ? 'border-amber-500 scale-105' : 'border-gray-200 hover:border-amber-300'
                      }`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: Product info ── */}
            <div className="p-6 lg:p-8 flex flex-col">
              {/* Category + type badges */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="bg-[#FAE3D3] text-[#8B3410] text-xs font-semibold px-3 py-1 rounded-full">
                  {catLabel}
                </span>
                {isOutOfStock && (
                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Out of Stock
                  </span>
                )}
                {isCustomization && (
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" className="w-3 h-3"><path d="M16.003 2C8.28 2 2 8.28 2 16.003c0 2.478.65 4.897 1.885 7.02L2 30l7.18-1.858A13.94 13.94 0 0 0 16.003 30C23.72 30 30 23.72 30 16.003 30 8.28 23.72 2 16.003 2zm0 25.455a11.41 11.41 0 0 1-5.82-1.594l-.418-.248-4.26 1.102 1.13-4.14-.272-.432A11.41 11.41 0 0 1 4.545 16c0-6.32 5.138-11.455 11.458-11.455S27.455 9.68 27.455 16c0 6.318-5.135 11.455-11.452 11.455zm6.29-8.573c-.345-.172-2.04-1.006-2.356-1.12-.316-.115-.546-.172-.776.172-.23.345-.89 1.12-1.09 1.35-.2.23-.4.258-.745.086-.345-.172-1.456-.537-2.773-1.71-1.025-.913-1.717-2.04-1.918-2.385-.2-.345-.022-.532.15-.703.155-.155.345-.403.517-.604.172-.2.23-.345.345-.575.115-.23.057-.432-.029-.604-.086-.172-.776-1.87-1.063-2.56-.28-.672-.564-.58-.776-.59l-.66-.012c-.23 0-.604.086-.92.432-.316.345-1.205 1.178-1.205 2.872s1.234 3.33 1.406 3.56c.172.23 2.428 3.71 5.882 5.203.822.355 1.463.567 1.963.726.824.263 1.574.226 2.167.137.66-.099 2.04-.834 2.328-1.638.287-.804.287-1.493.2-1.638-.086-.144-.316-.23-.66-.402z"/></svg> WhatsApp Only
                  </span>
                )}
              </div>

              {/* Product name */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                {product.name}
              </h1>

              {/* Rating placeholder */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= 4 ? 'text-[#D4A017] fill-[#D4A017]' : 'text-gray-200 fill-gray-200'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">4.0 · Authentic Traditional Product</span>
              </div>

              {/* Price */}
              {!isCustomization && product.price && (
                <div className="flex items-baseline gap-3 mb-5">
                  <span className="text-4xl font-bold text-[#C8511B]">₹{effectivePrice}</span>
                  {product.unit && <span className="text-gray-400 text-sm">per {product.unit}</span>}
                  {magnetExtra > 0 && (
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">+₹3 magnet</span>
                  )}
                </div>
              )}

              {isCustomization && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-5">
                  <p className="text-green-800 font-semibold text-sm mb-1">Custom Pricing</p>
                  <p className="text-green-700 text-xs">Price depends on customization. Contact us on WhatsApp for a quote.</p>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <p className="text-gray-600 text-sm leading-relaxed mb-5 border-t border-gray-100 pt-4">
                  {product.description}
                </p>
              )}

              {/* Variants */}
              {!isCustomization && product.variants && product.variants.length > 0 && (
                <div className="mb-5">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Magnet Option: <span className="text-[#C8511B]">{selectedVariant || 'Select one'}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button key={v} onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                          selectedVariant === v
                            ? 'border-[#C8511B] bg-[#FDF3EC] text-[#C8511B] shadow-sm'
                            : 'border-gray-200 text-gray-600 hover:border-[#E8895A] hover:bg-[#FDF3EC]'
                        }`}>
                        {v}
                      </button>
                    ))}
                  </div>
                  {selectedVariant === 'With Magnet (+₹3)' && (
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      🧲 Magnet adds ₹3 per piece to the base price
                    </p>
                  )}
                </div>
              )}

              {/* Quantity — with direct input */}
              {!isCustomization && (
                <div className="mb-5">
                  <div className="flex items-center gap-4 mb-3">
                    <p className="text-sm font-semibold text-gray-700">
                      Quantity <span className="text-gray-400 font-normal">(min {minQty} pcs)</span>:
                    </p>
                    <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                      <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-10 h-10 flex items-center justify-center hover:bg-[#FDF3EC] transition-colors text-gray-600 font-bold">
                        <Minus className="w-4 h-4" />
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
                        className="w-16 text-center font-bold text-gray-900 text-lg border-none outline-none bg-white py-2"
                      />
                      <button
                        onClick={() => {
                          const stock = product?.stock_quantity
                          const next = (parseInt(quantity) || 0) + 1
                          if (stock != null && next > stock) {
                            toast.error(`Only ${stock} pieces available in stock.`, {
                              icon: '📦',
                              style: { borderRadius: '12px', background: '#1c1917', color: '#fef3c7' },
                            })
                            return
                          }
                          setQuantity(next)
                        }}
                        className="w-10 h-10 flex items-center justify-center hover:bg-[#FDF3EC] transition-colors text-gray-600 font-bold">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stock warning */}
                  {product?.stock_quantity != null && qty > product.stock_quantity && (
                    <p className="text-xs text-orange-600 font-medium bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 mb-2">
                      📦 Only <strong>{product.stock_quantity} pieces</strong> available in stock.
                    </p>
                  )}

                  {/* Min order warning */}
                  {quantity < minQty && quantity > 0 && (
                    <p className="text-xs text-red-600 font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      ⚠️ Minimum order is <strong>{minQty} pieces</strong>. Add {minQty - quantity} more.
                    </p>
                  )}
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                {isCustomization ? (
                  <button
                    onClick={() => sendToWhatsApp(product.name)}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-green-200 hover:-translate-y-0.5 text-base"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" className="w-5 h-5"><path d="M16.003 2C8.28 2 2 8.28 2 16.003c0 2.478.65 4.897 1.885 7.02L2 30l7.18-1.858A13.94 13.94 0 0 0 16.003 30C23.72 30 30 23.72 30 16.003 30 8.28 23.72 2 16.003 2zm0 25.455a11.41 11.41 0 0 1-5.82-1.594l-.418-.248-4.26 1.102 1.13-4.14-.272-.432A11.41 11.41 0 0 1 4.545 16c0-6.32 5.138-11.455 11.458-11.455S27.455 9.68 27.455 16c0 6.318-5.135 11.455-11.452 11.455zm6.29-8.573c-.345-.172-2.04-1.006-2.356-1.12-.316-.115-.546-.172-.776.172-.23.345-.89 1.12-1.09 1.35-.2.23-.4.258-.745.086-.345-.172-1.456-.537-2.773-1.71-1.025-.913-1.717-2.04-1.918-2.385-.2-.345-.022-.532.15-.703.155-.155.345-.403.517-.604.172-.2.23-.345.345-.575.115-.23.057-.432-.029-.604-.086-.172-.776-1.87-1.063-2.56-.28-.672-.564-.58-.776-.59l-.66-.012c-.23 0-.604.086-.92.432-.316.345-1.205 1.178-1.205 2.872s1.234 3.33 1.406 3.56c.172.23 2.428 3.71 5.882 5.203.822.355 1.463.567 1.963.726.824.263 1.574.226 2.167.137.66-.099 2.04-.834 2.328-1.638.287-.804.287-1.493.2-1.638-.086-.144-.316-.23-.66-.402z"/></svg>
                    Enquire on WhatsApp
                  </button>
                ) : (
                  <>
                    <button
                      onClick={isGoToCart ? () => navigate('/cart') : handleAddToCart}
                      disabled={!isGoToCart && (isOutOfStock || quantity < minQty || (product?.stock_quantity != null && qty > product.stock_quantity))}
                      className={`flex-1 flex items-center justify-center gap-2 font-bold py-4 rounded-2xl transition-all text-base shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${
                        isGoToCart
                          ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-200'
                          : 'bg-[#C8511B] hover:bg-[#B04516] text-white shadow-[#C8511B]/20'
                      }`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {isGoToCart ? 'Go to Cart →' : 'Add to Cart'}
                    </button>
                    <button onClick={handleBuyNow}
                      disabled={isOutOfStock || quantity < minQty || (product?.stock_quantity != null && qty > product.stock_quantity)}
                      className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-200 hover:-translate-y-0.5 text-base">
                      Buy Now
                    </button>
                  </>
                )}
              </div>

              {/* Wishlist text button */}
              <button onClick={() => { if (!user) { setShowLoginModal(true); return; } toggleWishlist(product) }}
                className={`flex items-center gap-2 text-sm font-medium mb-6 transition-colors w-fit ${
                  wishlisted ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                }`}>
                <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current text-red-500' : ''}`} />
                {wishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
              </button>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-5">
                {[
                  { icon: <Truck className="w-5 h-5 text-[#C8511B]" />, label: 'Fast Delivery', sub: 'PAN India shipping' },
                  { icon: <Shield className="w-5 h-5 text-[#C8511B]" />, label: '100% Authentic', sub: 'Guaranteed' },
                ].map((b) => (
                  <div key={b.label} className="flex flex-col items-center text-center gap-1 p-2 rounded-xl bg-[#FDF3EC]">
                    {b.icon}
                    <p className="text-xs font-semibold text-gray-800">{b.label}</p>
                    <p className="text-xs text-gray-400">{b.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product details card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Product Details</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: 'Category',    value: catLabel },
              { label: 'Type',        value: isCustomization ? 'Customization (WhatsApp)' : 'Standard' },
              product.unit    ? { label: 'Unit',     value: product.unit } : null,
              product.variants?.length ? { label: 'Available Sizes', value: product.variants.join(', ') } : null,
            ].filter(Boolean).map((row) => (
              <div key={row.label} className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-xs font-semibold text-gray-400 w-28 shrink-0 pt-0.5">{row.label}</span>
                <span className="text-sm font-medium text-gray-800">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Star className="w-5 h-5 text-[#D4A017] fill-[#D4A017]" />
            Customer Reviews
          </h2>
          <ProductReviews productId={product.id} />
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Similar Products</h2>
              <Link to={`/category/${product.category}`}
                className="text-sm text-[#C8511B] hover:text-[#8B3410] font-medium flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Login prompt modal */}
      <LoginPromptModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectTo={`/product/${productId}`}
      />
    </div>
  )
}
