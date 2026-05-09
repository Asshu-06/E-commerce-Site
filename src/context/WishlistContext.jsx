import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const WishlistContext = createContext(null)

// Per-user localStorage key for offline fallback
const wishlistKey = (userId) => userId ? `shubham_wishlist_${userId}` : null

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(false)

  // Load wishlist when user changes
  useEffect(() => {
    if (user) {
      fetchWishlist()
    } else {
      setItems([])
    }
  }, [user])

  const fetchWishlist = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (!error && data) {
        setItems(data)
        // Sync to localStorage as cache
        const key = wishlistKey(user.id)
        if (key) localStorage.setItem(key, JSON.stringify(data))
      } else {
        // Fallback to localStorage cache
        const key = wishlistKey(user.id)
        if (key) {
          const cached = localStorage.getItem(key)
          if (cached) setItems(JSON.parse(cached))
        }
      }
    } catch {
      const key = wishlistKey(user.id)
      if (key) {
        const cached = localStorage.getItem(key)
        if (cached) setItems(JSON.parse(cached))
      }
    }
    setLoading(false)
  }

  const isWishlisted = useCallback((productId) => {
    return items.some((i) => i.product_id === String(productId))
  }, [items])

  const addToWishlist = async (product) => {
    if (!user) {
      toast.error('Please sign in to save to wishlist')
      return
    }
    const productId = String(product.id)
    if (isWishlisted(productId)) return

    const newItem = {
      user_id:    user.id,
      product_id: productId,
      product:    {
        id:          product.id,
        name:        product.name,
        category:    product.category,
        type:        product.type,
        price:       product.price,
        image_url:   product.image_url,
        description: product.description,
        variants:    product.variants,
      },
    }

    // Optimistic update
    const tempItem = { ...newItem, id: `temp-${Date.now()}`, created_at: new Date().toISOString() }
    setItems((prev) => [tempItem, ...prev])

    try {
      const { data, error } = await supabase.from('wishlists').insert([newItem]).select().single()
      if (error) throw error
      // Replace temp with real
      setItems((prev) => prev.map((i) => i.id === tempItem.id ? data : i))
      toast.success('Added to wishlist ❤️', {
        style: { borderRadius: '12px', background: '#fff7ed', color: '#92400e' },
      })
    } catch (err) {
      // Revert optimistic update
      setItems((prev) => prev.filter((i) => i.id !== tempItem.id))
      toast.error(err.message || 'Failed to add to wishlist')
    }
  }

  const removeFromWishlist = async (productId) => {
    if (!user) return
    const pid = String(productId)

    // Optimistic update
    const prev = items
    setItems((p) => p.filter((i) => i.product_id !== pid))

    try {
      const { error } = await supabase.from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', pid)
      if (error) throw error
      toast.success('Removed from wishlist', {
        style: { borderRadius: '12px', background: '#fff7ed', color: '#92400e' },
      })
    } catch (err) {
      setItems(prev) // revert
      toast.error(err.message || 'Failed to remove from wishlist')
    }
  }

  const toggleWishlist = (product) => {
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  // Group by category
  const itemsByCategory = items.reduce((acc, item) => {
    const cat = item.product?.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  return (
    <WishlistContext.Provider value={{
      items, loading, isWishlisted,
      addToWishlist, removeFromWishlist, toggleWishlist,
      itemsByCategory, fetchWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
