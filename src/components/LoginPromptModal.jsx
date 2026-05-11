import { useNavigate } from 'react-router-dom'
import { LogIn, X, ShoppingBag } from 'lucide-react'

/**
 * Modal shown when a guest user tries to buy/add-to-cart.
 * Props:
 *   open        – boolean, controls visibility
 *   onClose     – called when user clicks Cancel or the backdrop
 *   redirectTo  – path to return to after login (default '/')
 */
export default function LoginPromptModal({ open, onClose, redirectTo = '/' }) {
  const navigate = useNavigate()

  if (!open) return null

  const handleSignIn = () => {
    onClose()
    navigate(`/login?redirect=${encodeURIComponent(redirectTo)}`)
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      {/* Modal card — stop click propagation so backdrop click doesn't close when clicking inside */}
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 bg-[#FDF3EC] rounded-2xl flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-[#C8511B]" />
          </div>
        </div>

        {/* Text */}
        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          Login to Continue
        </h2>
        <p className="text-sm text-gray-500 text-center mb-7 leading-relaxed">
          Please sign in to place your order. It only takes a moment!
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-2 bg-[#C8511B] hover:bg-[#B04516] text-white font-bold py-3.5 rounded-2xl transition-all hover:-translate-y-0.5 shadow-lg shadow-[#C8511B]/20"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3.5 rounded-2xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
