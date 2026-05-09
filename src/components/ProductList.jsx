import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import ProductCard from './ProductCard'
import ProductSkeleton from './ProductSkeleton'

export default function ProductList({ products, loading = false }) {
  const [search, setSearch]   = useState('')
  const [sortBy, setSortBy]   = useState('default')
  const [showSort, setShowSort] = useState(false)

  const sortOptions = [
    { value: 'default',    label: 'Default' },
    { value: 'price-asc',  label: 'Price: Low → High' },
    { value: 'price-desc', label: 'Price: High → Low' },
    { value: 'name',       label: 'Name A–Z' },
  ]

  const filtered = useMemo(() => {
    let list = [...products]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
    }
    if (sortBy === 'price-asc')  list.sort((a, b) => (a.price || 0) - (b.price || 0))
    if (sortBy === 'price-desc') list.sort((a, b) => (b.price || 0) - (a.price || 0))
    if (sortBy === 'name')       list.sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [products, search, sortBy])

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search products..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E8895A] focus:border-transparent" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <button onClick={() => setShowSort(v => !v)}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-sm font-medium text-gray-700 px-4 py-2.5 rounded-xl transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">{sortOptions.find(o => o.value === sortBy)?.label || 'Sort'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSort ? 'rotate-180' : ''}`} />
          </button>
          {showSort && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100 py-1.5 z-20">
              {sortOptions.map((opt) => (
                <button key={opt.value} onClick={() => { setSortBy(opt.value); setShowSort(false) }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    sortBy === opt.value ? 'text-[#C8511B] bg-[#FDF3EC] font-semibold' : 'text-gray-700 hover:bg-gray-50'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {!loading && (
          <span className="text-sm text-gray-400 hidden sm:block">
            {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
          </span>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
          : filtered.map((p) => <ProductCard key={p.id} product={p} />)
        }
      </div>

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No products found</h3>
          <p className="text-gray-400 text-sm mb-5">Try adjusting your search.</p>
          <button onClick={() => { setSearch(''); setSortBy('default') }}
            className="text-[#C8511B] hover:text-[#8B3410] text-sm font-semibold underline">
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
