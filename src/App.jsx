import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { WishlistProvider } from './context/WishlistContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import FeedbackSection from './components/FeedbackSection'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import NewArrivalsPage from './pages/NewArrivalsPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import AuthCallback from './pages/AuthCallback'
import ProfilePage from './pages/ProfilePage'
import ProductPage from './pages/ProductPage'
import { ContactPage, ShippingPolicyPage, RefundPolicyPage, PrivacyPolicyPage } from './pages/PolicyPages'
import AdminLogin from './admin/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/Dashboard'
import AdminProducts from './admin/AdminProducts'
import AdminOrders from './admin/AdminOrders'
import AdminUsers from './admin/AdminUsers'
import AdminOrderDetail from './admin/AdminOrderDetail'
import AdminCategories from './admin/AdminCategories'
import AdminBanners from './admin/AdminBanners'
import WishlistPage from './pages/WishlistPage'
import WhatsAppButton from './components/WhatsAppButton'
import InstagramButton from './components/InstagramButton'

// ── Set to true to show maintenance page to visitors ──
const MAINTENANCE_MODE = false

// Wrapper that adds Navbar + Footer
function StoreLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">{children}</div>
      <FeedbackSection />
      <Footer />
    </div>
  )
}

const MaintenancePage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-[#FAF7F2]">
    <div className="text-7xl mb-6">🪔</div>
    <h1 className="text-3xl font-bold text-[#C8511B] mb-3">We'll be back soon</h1>
    <p className="text-gray-600 text-lg max-w-md mb-2">
      Our store is currently under maintenance. We're working hard to bring you a better experience.
    </p>
    <p className="text-gray-400 text-sm">Thank you for your patience.</p>
  </div>
)

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center pt-16 px-4 text-center bg-[#FAF7F2]">
    <div className="text-7xl mb-4">🪔</div>
    <h2 className="text-2xl font-bold text-gray-700 mb-2">Page not found</h2>
    <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
    <a href="/" className="bg-[#C8511B] hover:bg-[#B04516] text-white font-semibold px-8 py-3 rounded-2xl transition-colors">
      Go Home
    </a>
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              {/* ── OAuth callback ── */}
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* ── Admin login (no layout) ── */}
              <Route path="/admin" element={<AdminLogin />} />

              {/* ── Admin panel (layout has its own auth guard) ── */}
              <Route path="/admin/*" element={<AdminLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="banners" element={<AdminBanners />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/:orderId" element={<AdminOrderDetail />} />
                <Route path="users" element={<AdminUsers />} />
              </Route>

              {/* ── Public store routes (flat, no nesting) ── */}
              <Route path="/" element={MAINTENANCE_MODE ? <MaintenancePage /> : <StoreLayout><HomePage /></StoreLayout>} />
              <Route path="/category/:categoryId" element={MAINTENANCE_MODE ? <MaintenancePage /> : <StoreLayout><CategoryPage /></StoreLayout>} />
              <Route path="/new-arrivals" element={MAINTENANCE_MODE ? <MaintenancePage /> : <StoreLayout><NewArrivalsPage /></StoreLayout>} />
              <Route path="/product/:productId" element={MAINTENANCE_MODE ? <MaintenancePage /> : <StoreLayout><ProductPage /></StoreLayout>} />
              <Route path="/cart" element={MAINTENANCE_MODE ? <MaintenancePage /> : <StoreLayout><CartPage /></StoreLayout>} />
              <Route path="/wishlist" element={MAINTENANCE_MODE ? <MaintenancePage /> : <StoreLayout><WishlistPage /></StoreLayout>} />
              <Route path="/checkout" element={MAINTENANCE_MODE ? <MaintenancePage /> : <StoreLayout><CheckoutPage /></StoreLayout>} />
              <Route path="/login" element={MAINTENANCE_MODE ? <MaintenancePage /> : <StoreLayout><LoginPage /></StoreLayout>} />
              <Route path="/profile" element={MAINTENANCE_MODE ? <MaintenancePage /> : <StoreLayout><ProfilePage /></StoreLayout>} />
              <Route path="/contact" element={MAINTENANCE_MODE ? <MaintenancePage /> : <StoreLayout><ContactPage /></StoreLayout>} />
              <Route path="/shipping-policy" element={MAINTENANCE_MODE ? <MaintenancePage /> : <StoreLayout><ShippingPolicyPage /></StoreLayout>} />
              <Route path="/refund-policy" element={MAINTENANCE_MODE ? <MaintenancePage /> : <StoreLayout><RefundPolicyPage /></StoreLayout>} />
              <Route path="/privacy-policy" element={MAINTENANCE_MODE ? <MaintenancePage /> : <StoreLayout><PrivacyPolicyPage /></StoreLayout>} />

              {/* ── 404 ── */}
              <Route path="*" element={MAINTENANCE_MODE ? <MaintenancePage /> : <StoreLayout><NotFound /></StoreLayout>} />
            </Routes>

            <Toaster position="top-right" />
            <WhatsAppButton />
            <InstagramButton />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
