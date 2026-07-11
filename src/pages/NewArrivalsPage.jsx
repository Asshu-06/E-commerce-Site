import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { mockProducts } from '../lib/mockData'
import ProductCard from '../components/ProductCard'
import ProductSkeleton from '../components/ProductSkeleton'

export default function NewArrivalsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(40)
        if (!error && data && data.length > 0) {
          setProducts(data)
          setLoading(false)
          return
        }
      } catch { }
      setProducts(mockProducts.slice().reverse().slice(0, 20))
      setLoading(false)
    }
    fetch()
  }, [])

  return (
    <div className="min-h-screen pt-16 pb-16 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <span className="text-xs font-bold tracking-widest uppercase text-[#C8511B] block mb-2">Just In</span>
          <h1 className="text-3xl font-bold text-gray-900">New Arrivals</h1>
          <p className="text-gray-500 mt-1 text-sm">Our latest products, freshly added</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">🛍️</div>
            <p>No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
