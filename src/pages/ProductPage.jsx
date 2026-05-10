import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart, Heart, MessageCircle, ChevronRight,
  Star, Truck, Shield, RotateCcw, Plus, Minus,
  Share2, Check, ArrowLeft
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { mockProducts, categories } from '../lib/mockData'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { sendToWhatsApp } from '../lib/whatsapp'
import ProductCard from '../components/ProductCard'
import ProductReviews from '../components/ProductReviews'
import toast from 'react-hot-toast'

const CAT_LABELS = { pasupu: 'Pasupu-Kumkuma', gifts: 'Return Gifts', bags: 'Return Bags' }

export default function ProductPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()

  const [product, setProduct]           = useState(null)
  const [related, setRelated]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [selectedVariant, setSelectedVariant] = useState('')
  const [quantity, setQuantity]         = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [addedToCart, setAddedToCart]   = useState(false)
  const [copied, setCopied]             = useState(false)

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
    addItem(product, selectedVariant, quantity)
    setAddedToCart(true)
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      style: { borderRadius: '12px', background: '#fff7ed', color: '#92400e' },
    })
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleBuyNow = () => {
    if (!product) return
    addItem(product, selectedVariant, quantity)
    navigate('/checkout')
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

  // Build image array (main + placeholder extras for gallery feel)
  const images = [product.image_url].filter(Boolean)

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
                  onClick={() => toggleWishlist(product)}
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

              {/* Thumbnail strip (if multiple images) */}
              {images.length > 1 && (
                <div className="flex gap-2 justify-center">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setSelectedImage(i)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
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
                {isCustomization && (
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" /> WhatsApp Only
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
                  <span className="text-4xl font-bold text-[#C8511B]">₹{product.price}</span>
                  {product.unit && <span className="text-gray-400 text-sm">per {product.unit}</span>}
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
                    Size / Variant: <span className="text-[#C8511B]">{selectedVariant}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button key={v} onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                          selectedVariant === v
                            ? 'border-amber-500 bg-[#FDF3EC] text-[#8B3410] shadow-sm'
                            : 'border-gray-200 text-gray-600 hover:border-amber-300 hover:bg-[#FDF3EC]'
                        }`}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              {!isCustomization && (
                <div className="flex items-center gap-4 mb-6">
                  <p className="text-sm font-semibold text-gray-700">Quantity:</p>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-[#FDF3EC] transition-colors text-gray-600 font-bold text-lg">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-gray-900 text-lg">{quantity}</span>
                    <button onClick={() => setQuantity((q) => q + 1)}
                      className="w-10 h-10 flex items-center justify-center hover:bg-[#FDF3EC] transition-colors text-gray-600 font-bold text-lg">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-400">
                    Total: <span className="font-bold text-[#C8511B]">₹{((product.price || 0) * quantity).toLocaleString()}</span>
                  </span>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                {isCustomization ? (
                  <button
                    onClick={() => sendToWhatsApp(product.name)}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-green-200 hover:-translate-y-0.5 text-base"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Enquire on WhatsApp
                  </button>
                ) : (
                  <>
                    <button onClick={handleAddToCart}
                      className={`flex-1 flex items-center justify-center gap-2 font-bold py-4 rounded-2xl transition-all text-base shadow-lg hover:-translate-y-0.5 ${
                        addedToCart
                          ? 'bg-green-500 text-white shadow-green-200'
                          : 'bg-[#C8511B] hover:bg-[#B04516] text-white shadow-[#C8511B]/20'
                      }`}>
                      {addedToCart ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                      {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
                    </button>
                    <button onClick={handleBuyNow}
                      className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-200 hover:-translate-y-0.5 text-base">
                      Buy Now
                    </button>
                  </>
                )}
              </div>

              {/* Wishlist text button */}
              <button onClick={() => toggleWishlist(product)}
                className={`flex items-center gap-2 text-sm font-medium mb-6 transition-colors w-fit ${
                  wishlisted ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                }`}>
                <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current text-red-500' : ''}`} />
                {wishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
              </button>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-5">
                {[
                  { icon: <Truck className="w-5 h-5 text-[#C8511B]" />, label: 'Fast Delivery', sub: 'AP/TS ₹80 · Others ₹100' },
                  { icon: <Shield className="w-5 h-5 text-[#C8511B]" />, label: '100% Authentic', sub: 'Guaranteed' },
                  { icon: <RotateCcw className="w-5 h-5 text-[#C8511B]" />, label: 'Easy Returns', sub: '7 day policy' },
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
    </div>
  )
}
