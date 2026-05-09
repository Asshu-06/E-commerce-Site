import { useEffect, useState } from 'react'
import { Star, ThumbsUp, User } from 'lucide-react'
import { supabase } from '../lib/supabase'

function StarDisplay({ rating, size = 'sm' }) {
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <Star key={s} className={`${sz} ${s <= rating ? 'text-[#D4A017] fill-[#D4A017]' : 'text-gray-200 fill-gray-200'}`} />
      ))}
    </div>
  )
}

export default function ProductReviews({ productId }) {
  const [reviews, setReviews]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [summary, setSummary]   = useState({ avg: 0, count: 0, dist: [0,0,0,0,0] })

  useEffect(() => {
    if (!productId) return
    fetchReviews()
  }, [productId])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', String(productId))
        .order('created_at', { ascending: false })

      if (!error && data) {
        setReviews(data)
        if (data.length > 0) {
          const avg = data.reduce((s, r) => s + r.rating, 0) / data.length
          const dist = [0,0,0,0,0]
          data.forEach(r => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++ })
          setSummary({ avg: Math.round(avg * 10) / 10, count: data.length, dist })
        }
      }
    } catch { }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
      </div>
    )
  }

  return (
    <div>
      {/* Summary */}
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-6 bg-[#FAF7F2] rounded-2xl p-6 mb-6 border border-[#FAE3D3]">
          {/* Average */}
          <div className="flex flex-col items-center justify-center sm:border-r sm:border-[#FAE3D3] sm:pr-6 shrink-0">
            <span className="text-5xl font-bold text-[#C8511B]">{summary.avg}</span>
            <StarDisplay rating={Math.round(summary.avg)} size="md" />
            <span className="text-xs text-gray-400 mt-1">{summary.count} review{summary.count !== 1 ? 's' : ''}</span>
          </div>
          {/* Distribution */}
          <div className="flex-1 space-y-1.5">
            {[5,4,3,2,1].map((star) => {
              const count = summary.dist[star - 1]
              const pct   = summary.count > 0 ? Math.round((count / summary.count) * 100) : 0
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-3 shrink-0">{star}</span>
                  <Star className="w-3 h-3 text-[#D4A017] fill-[#D4A017] shrink-0" />
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#D4A017] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-6 text-right shrink-0">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Review list */}
      {reviews.length === 0 ? (
        <div className="text-center py-10 bg-[#FAF7F2] rounded-2xl border border-[#FAE3D3]">
          <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-600 text-sm">No reviews yet</p>
          <p className="text-gray-400 text-xs mt-1">Be the first to review this product after purchase.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C8511B] to-[#A83E14] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {(r.user_name || 'C')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{r.user_name || 'Customer'}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <StarDisplay rating={r.rating} />
              </div>
              {r.title && <p className="font-semibold text-gray-900 text-sm mb-1">{r.title}</p>}
              {r.body && <p className="text-gray-600 text-sm leading-relaxed">{r.body}</p>}
              <div className="mt-3 flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                  ✓ Verified Purchase
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
