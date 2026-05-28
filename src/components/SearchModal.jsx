import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, ArrowRight } from 'lucide-react'
import { mockProducts } from '../lib/mockData'
import { supabase } from '../lib/supabase'

export default function SearchModal({ open, onClose }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef              = useRef(null)
  const navigate              = useNavigate()

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Search on query change
  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const q = query.toLowerCase()

    const search = async () => {
      setLoading(true)
      try {
        const { data } = await supabase
          .from('products')
          .select('id, name, category, type, price, image_url')
          .ilike('name', `%${q}%`)
          .limit(8)

        if (data && data.length > 0) {
          setResults(data)
        } else {
          // Fallback to mock data
          setResults(
            mockProducts
              .filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
              .slice(0, 8)
          )
        }
      } catch {
        setResults(
          mockProducts
            .filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
            .slice(0, 8)
        )
      }
      setLoading(false)
    }

    const timer = setTimeout(search, 250)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (product) => {
    onClose()
    navigate(`/product/${product.id}`)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search products..."
            className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 text-xs font-medium border border-gray-200 px-2">
            Esc
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex justify-center py-8">
              <span className="w-5 h-5 border-2 border-[#C8511B]/30 border-t-[#C8511B] rounded-full animate-spin" />
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-10 text-center text-gray-400 text-sm">
              No products found for "<span className="font-medium text-gray-600">{query}</span>"
            </div>
          )}

          {!loading && results.length > 0 && (
            <ul className="py-2">
              {results.map((product) => (
                <li key={product.id}>
                  <button
                    onClick={() => handleSelect(product)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FDF3EC] transition-colors text-left"
                  >
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0 bg-gray-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg shrink-0">🛍️</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{product.category?.replace('-', ' ')}</p>
                    </div>
                    {product.price && (
                      <span className="text-sm font-semibold text-[#C8511B] shrink-0">₹{product.price}</span>
                    )}
                    <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!query && (
            <div className="py-8 text-center text-gray-400 text-sm">
              Start typing to search products...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
