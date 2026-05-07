import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import ProductCard from './ProductCard'
import ProductSkeleton from './ProductSkeleton'

export default function ProductList({ products, loading = false }) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let list = [...products]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      )
    }

    if (sortBy === 'price-asc') list.sort((a, b) => (a.price || 0) - (b.price || 0))
    else if (sortBy === 'price-desc') list.sort((a, b) => (b.price || 0) - (a.price || 0))
    else if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name))

    return list
  }, [products, search, sortBy])

  return (
    <div>
      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-colors ${
            showFilters ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-amber-100 p-4 mb-6 flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              Sort By
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'default', label: 'Default' },
                { value: 'price-asc', label: 'Price: Low → High' },
                { value: 'price-desc', label: 'Price: High → Low' },
                { value: 'name', label: 'Name A–Z' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    sortBy === opt.value
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-gray-500 mb-4">
          {filtered.length} {filtered.length === 1 ? 'product' : 'products'} found
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
          : filtered.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No products found</h3>
          <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
          <button
            onClick={() => { setSearch(''); setSortBy('default') }}
            className="mt-4 text-amber-600 hover:text-amber-700 text-sm font-medium underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
