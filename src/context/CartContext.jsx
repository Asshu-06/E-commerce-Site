import { createContext, useContext, useReducer, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const CartContext = createContext(null)

const GUEST_CART_KEY = 'shubham_cart_guest'
const userCartKey = (userId) => `shubham_cart_${userId}`

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find(
        (i) => i.id === action.payload.id && i.selectedVariant === action.payload.selectedVariant
      )
      if (existing) {
        return state.map((i) =>
          i.id === action.payload.id && i.selectedVariant === action.payload.selectedVariant
            ? { ...i, quantity: i.quantity + (action.payload.quantity || 1) }
            : i
        )
      }
      return [...state, { ...action.payload, quantity: action.payload.quantity || 1 }]
    }
    case 'REMOVE_ITEM':
      return state.filter(
        (i) => !(i.id === action.payload.id && i.selectedVariant === action.payload.selectedVariant)
      )
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return state.filter(
          (i) => !(i.id === action.payload.id && i.selectedVariant === action.payload.selectedVariant)
        )
      }
      return state.map((i) =>
        i.id === action.payload.id && i.selectedVariant === action.payload.selectedVariant
          ? { ...i, quantity: action.payload.quantity }
          : i
      )
    }
    case 'CLEAR_CART':
      return []
    case 'LOAD_CART':
      return action.payload
    default:
      return state
  }
}

function loadCartFromStorage(key) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  } catch { return [] }
}

// Sync cart to Supabase (debounced)
let syncTimer = null
async function syncCartToSupabase(userId, items) {
  if (!userId) return
  clearTimeout(syncTimer)
  syncTimer = setTimeout(async () => {
    try {
      await supabase.from('carts').upsert(
        { user_id: userId, items, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
    } catch { /* non-critical */ }
  }, 1000) // debounce 1s
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [], () => loadCartFromStorage(GUEST_CART_KEY))
  const currentKeyRef = useRef(GUEST_CART_KEY)
  const userIdRef     = useRef(null)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const key = userCartKey(session.user.id)
        currentKeyRef.current = key
        userIdRef.current = session.user.id
        const userCart = loadCartFromStorage(key)
        dispatch({ type: 'LOAD_CART', payload: userCart })
      } else if (event === 'SIGNED_OUT') {
        userIdRef.current = null
        currentKeyRef.current = GUEST_CART_KEY
        localStorage.removeItem(GUEST_CART_KEY)
        dispatch({ type: 'CLEAR_CART' })
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const key = userCartKey(session.user.id)
        currentKeyRef.current = key
        userIdRef.current = session.user.id
        const userCart = loadCartFromStorage(key)
        dispatch({ type: 'LOAD_CART', payload: userCart })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Persist to localStorage + sync to Supabase on every cart change
  useEffect(() => {
    localStorage.setItem(currentKeyRef.current, JSON.stringify(cart))
    if (userIdRef.current) {
      syncCartToSupabase(userIdRef.current, cart)
    }
  }, [cart])

  const addItem = (product, selectedVariant, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { ...product, selectedVariant, quantity } })
  }

  const removeItem = (id, selectedVariant) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id, selectedVariant } })
  }

  const updateQuantity = (id, selectedVariant, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, selectedVariant, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
    localStorage.removeItem(currentKeyRef.current)
    // Clear in Supabase too
    if (userIdRef.current) {
      supabase.from('carts').upsert(
        { user_id: userIdRef.current, items: [], updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      ).then(() => {}).catch(() => {})
    }
  }

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
