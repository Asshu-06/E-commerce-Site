import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, ShoppingBag, MessageCircle, SlidersHorizontal, Search, X } from 'lucide-react'
import { categories, mockProducts } from '../lib/mockData'
import { supabase } from '../lib/supabase'
import ProductList from '../components/ProductList'
import Tabs from '../components/Tabs'

const WaIcon = ({ cls }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" className={cls}>
    <path d="M16.003 2C8.28 2 2 8.28 2 16.003c0 2.478.65 4.897 1.885 7.02L2 30l7.18-1.858A13.94 13.94 0 0 0 16.003 30C23.72 30 30 23.72 30 16.003 30 8.28 23.72 2 16.003 2zm0 25.455a11.41 11.41 0 0 1-5.82-1.594l-.418-.248-4.26 1.102 1.13-4.14-.272-.432A11.41 11.41 0 0 1 4.545 16c0-6.32 5.138-11.455 11.458-11.455S27.455 9.68 27.455 16c0 6.318-5.135 11.455-11.452 11.455zm6.29-8.573c-.345-.172-2.04-1.006-2.356-1.12-.316-.115-.546-.172-.776.172-.23.345-.89 1.12-1.09 1.35-.2.23-.4.258-.745.086-.345-.172-1.456-.537-2.773-1.71-1.025-.913-1.717-2.04-1.918-2.385-.2-.345-.022-.532.15-.703.155-.155.345-.403.517-.604.172-.2.23-.345.345-.575.115-.23.057-.432-.029-.604-.086-.172-.776-1.87-1.063-2.56-.28-.672-.564-.58-.776-.59l-.66-.012c-.23 0-.604.086-.92.432-.316.345-1.205 1.178-1.205 2.872s1.234 3.33 1.406 3.56c.172.23 2.428 3.71 5.882 5.203.822.355 1.463.567 1.963.726.824.263 1.574.226 2.167.137.66-.099 2.04-.834 2.328-1.638.287-.804.287-1.493.2-1.638-.086-.144-.316-.23-.66-.402z"/>
  </svg>
)

const TABS = [
  { value: 'standard',      label: 'Standard',      icon: <ShoppingBag className="w-4 h-4" /> },
  { value: 'customization', label: 'Customization',  icon: <WaIcon cls="w-4 h-4" /> },
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
                <WaIcon cls="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
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
