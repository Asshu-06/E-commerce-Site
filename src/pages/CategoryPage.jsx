import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, ShoppingBag, MessageCircle, SlidersHorizontal, Search, X } from 'lucide-react'
import { categories, mockProducts } from '../lib/mockData'
import { supabase } from '../lib/supabase'
import ProductList from '../components/ProductList'
import Tabs from '../components/Tabs'

const TABS = [
  { value: 'standard',      label: 'Standard',      icon: <ShoppingBag className="w-4 h-4" /> },
  { value: 'customization', label: 'Customization',  icon: <MessageCircle className="w-4 h-4" /> },
]

export default function CategoryPage() {
  const { categoryId } = useParams()
  const [activeTab, setActiveTab] = useState('standard')
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)

  const category = categories.find((c) => c.id === categoryId)

  useEffect(() => setActiveTab('standard'), [categoryId])

  useEffect(() => {
    if (!category) return
    fetchProducts()
  }, [categoryId, activeTab, category])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      let query = supabase.from('products').select('*').eq('category', categoryId)
      query = category.hasTabs ? query.eq('type', activeTab) : query.eq('type', 'standard')
      const { data, error } = await query.order('created_at', { ascending: false })
      if (!error && data && data.length > 0) { setProducts(data); setLoading(false); return }
    } catch { }
    const mocks = mockProducts.filter((p) => {
      if (p.category !== categoryId) return false
      return category?.hasTabs ? p.type === activeTab : p.type === 'standard'
    })
    setProducts(mocks)
    setLoading(false)
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-16 bg-stone-50">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Category not found</h2>
        <Link to="/" className="text-[#C8511B] hover:underline text-sm">← Back to Home</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 bg-stone-50">
      {/* Hero banner */}
      <div className="relative h-52 sm:h-64 overflow-hidden">
        <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8">
            <nav className="flex items-center gap-1.5 text-white/60 text-xs mb-3">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white font-medium">{category.name}</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{category.name}</h1>
            <p className="text-white/70 mt-1 text-sm">{category.description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {category.hasTabs && (
          <div className="mb-8">
            <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
            {activeTab === 'customization' && (
              <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-800 font-semibold text-sm">WhatsApp Customization</p>
                  <p className="text-emerald-700 text-xs mt-0.5">
                    Click any design to enquire via WhatsApp. No cart or payment needed.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        <ProductList products={products} loading={loading} />
      </div>
    </div>
  )
}
