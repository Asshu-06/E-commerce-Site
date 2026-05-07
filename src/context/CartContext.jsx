import { createContext, useContext, useReducer, useEffect } from 'react'

const CartContext = createContext(null)

const STORAGE_KEY = 'shubham_cart'

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

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [], () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
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

  const clearCart = () => dispatch({ type: 'CLEAR_CART' })

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
