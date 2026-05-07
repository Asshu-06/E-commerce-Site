import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, ShoppingBag, MessageCircle } from 'lucide-react'
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
  const [activeTab, setActiveTab]   = useState('standard')
  const [products, setProducts]     = useState([])
  const [loading, setLoading]       = useState(true)

  const category = categories.find((c) => c.id === categoryId)

  // Reset tab when category changes
  useEffect(() => setActiveTab('standard'), [categoryId])

  // Fetch products from Supabase, fall back to mock data
  useEffect(() => {
    if (!category) return
    fetchProducts()
  }, [categoryId, activeTab, category])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      // Build query
      let query = supabase
        .from('products')
        .select('*')
        .eq('category', categoryId)
        .order('created_at', { ascending: false })

      // For categories with tabs, filter by type
      if (category.hasTabs) {
        query = query.eq('type', activeTab)
      } else {
        query = query.eq('type', 'standard')
      }

      const { data, error } = await query

      if (!error && data) {
        if (data.length > 0) {
          // Supabase has products — use them
          setProducts(data)
        } else {
          // Supabase returned empty — fall back to mock for this category/tab
          setProducts(getMockProducts())
        }
      } else {
        setProducts(getMockProducts())
      }
    } catch {
      setProducts(getMockProducts())
    }
    setLoading(false)
  }

  const getMockProducts = () =>
    mockProducts.filter((p) => {
      if (p.category !== categoryId) return false
      if (category?.hasTabs) return p.type === activeTab
      return p.type === 'standard'
    })

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-16">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Category not found</h2>
        <Link to="/" className="text-amber-600 hover:underline text-sm">← Back to Home</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Category hero banner */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <img
          src={category.image_url}
          alt={category.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <nav className="flex items-center gap-1.5 text-white/70 text-sm mb-3">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white font-medium">{category.name}</span>
            </nav>
            <h1 className="text-2xl sm:text-4xl font-bold text-white">{category.name}</h1>
            <p className="text-white/80 mt-1 text-sm sm:text-base">{category.description}</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs — only for Pasupu-Kumkuma */}
        {category.hasTabs && (
          <div className="mb-8">
            <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
            {activeTab === 'customization' && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-800 font-medium text-sm">WhatsApp Customization</p>
                  <p className="text-green-700 text-xs mt-0.5">
                    Click on any design below to enquire via WhatsApp. No cart or payment needed — we'll handle everything personally.
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
