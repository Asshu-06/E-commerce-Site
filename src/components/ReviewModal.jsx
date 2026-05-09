import { useState } from 'react'
import { Star, X, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function ReviewModal({ order, product, onClose, onSubmitted }) {
  const { user } = useAuth()
  const [rating, setRating]   = useState(0)
  const [hover, setHover]     = useState(0)
  const [title, setTitle]     = useState('')
  const [body, setBody]       = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) { toast.error('Please select a star rating'); return }
    if (!body.trim()) { toast.error('Please write your review'); return }
    setLoading(true)
    try {
      const { error } = await supabase.from('reviews').insert([{
        user_id:    user.id,
        order_id:   order.id,
        product_id: String(product.id || product.product_id),
        rating,
        title:      title.trim() || null,
        body:       body.trim(),
        user_name:  user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer',
      }])
      if (error) throw error
      toast.success('Review submitted! Thank you 🙏')
      onSubmitted?.()
      onClose()
    } catch (err) {
      if (err.message?.includes('unique')) {
        toast.error('You have already reviewed this product.')
      } else {
        toast.error(err.message || 'Failed to submit review')
      }
    }
    setLoading(false)
  }

  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Write a Review</h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[260px]">{product.name || product.product?.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Product image */}
          {(product.image_url || product.product?.image_url) && (
            <div className="flex items-center gap-3 bg-[#FAF7F2] rounded-2xl p-3">
              <img src={product.image_url || product.product?.image_url} alt=""
                className="w-14 h-14 rounded-xl object-cover shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 text-sm line-clamp-2">{product.name || product.product?.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">Order #{order.id?.slice(0, 8)}</p>
              </div>
            </div>
          )}

          {/* Star rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Your Rating *</label>
            <div className="flex items-center gap-1.5">
              {[1,2,3,4,5].map((s) => (
                <button key={s} type="button"
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(s)}
                  className="transition-transform hover:scale-110 active:scale-95">
                  <Star className={`w-9 h-9 transition-colors ${
                    s <= (hover || rating) ? 'text-[#D4A017] fill-[#D4A017]' : 'text-gray-200 fill-gray-200'
                  }`} />
                </button>
              ))}
              {(hover || rating) > 0 && (
                <span className="ml-2 text-sm font-semibold text-[#C8511B]">
                  {labels[hover || rating]}
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Review Title (optional)</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Beautiful quality!"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8895A] focus:border-transparent" />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Review *</label>
            <textarea value={body} onChange={e => setBody(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={4} required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8895A] focus:border-transparent resize-none" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-[#C8511B] hover:bg-[#B04516] disabled:bg-[#E8895A] text-white font-bold py-3 rounded-2xl transition-all text-sm">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Send className="w-4 h-4" />}
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
