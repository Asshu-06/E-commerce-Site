import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import AuthCallback from './pages/AuthCallback'
import ProfilePage from './pages/ProfilePage'
import AdminLogin from './admin/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/Dashboard'
import AdminProducts from './admin/AdminProducts'
import AdminOrders from './admin/AdminOrders'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* OAuth callback */}
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Admin login */}
            <Route path="/admin" element={<AdminLogin />} />

            {/* Admin panel — layout handles its own auth guard internally */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
            </Route>

            {/* Public store */}
            <Route
              path="/*"
              element={
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <div className="flex-1">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/category/:categoryId" element={<CategoryPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="*" element={
                        <div className="min-h-screen flex flex-col items-center justify-center pt-16 px-4 text-center">
                          <div className="text-7xl mb-4">🪔</div>
                          <h2 className="text-2xl font-bold text-gray-700 mb-2">Page not found</h2>
                          <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
                          <a href="/" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-full transition-colors">Go Home</a>
                        </div>
                      } />
                    </Routes>
                  </div>
                  <Footer />
                </div>
              }
            />
          </Routes>
          <Toaster position="top-right" />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
