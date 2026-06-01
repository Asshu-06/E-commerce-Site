import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'

const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE || '917997060668'

export default function Footer() {
  return (
    <footer className="bg-[#1C1917] text-gray-400">
      {/* Top CTA strip */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-white font-bold text-xl mb-1">Need a custom order?</h3>
            <p className="text-gray-400 text-sm">Chat with us on WhatsApp for personalised designs.</p>
          </div>
          <a href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent('Hello, I need help with a custom order.')}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-3 rounded-2xl transition-all hover:-translate-y-0.5 shadow-lg shadow-emerald-900/40 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" className="w-5 h-5"><path d="M16.003 2C8.28 2 2 8.28 2 16.003c0 2.478.65 4.897 1.885 7.02L2 30l7.18-1.858A13.94 13.94 0 0 0 16.003 30C23.72 30 30 23.72 30 16.003 30 8.28 23.72 2 16.003 2zm0 25.455a11.41 11.41 0 0 1-5.82-1.594l-.418-.248-4.26 1.102 1.13-4.14-.272-.432A11.41 11.41 0 0 1 4.545 16c0-6.32 5.138-11.455 11.458-11.455S27.455 9.68 27.455 16c0 6.318-5.135 11.455-11.452 11.455zm6.29-8.573c-.345-.172-2.04-1.006-2.356-1.12-.316-.115-.546-.172-.776.172-.23.345-.89 1.12-1.09 1.35-.2.23-.4.258-.745.086-.345-.172-1.456-.537-2.773-1.71-1.025-.913-1.717-2.04-1.918-2.385-.2-.345-.022-.532.15-.703.155-.155.345-.403.517-.604.172-.2.23-.345.345-.575.115-.23.057-.432-.029-.604-.086-.172-.776-1.87-1.063-2.56-.28-.672-.564-.58-.776-.59l-.66-.012c-.23 0-.604.086-.92.432-.316.345-1.205 1.178-1.205 2.872s1.234 3.33 1.406 3.56c.172.23 2.428 3.71 5.882 5.203.822.355 1.463.567 1.963.726.824.263 1.574.226 2.167.137.66-.099 2.04-.834 2.328-1.638.287-.804.287-1.493.2-1.638-.086-.144-.316-.23-.66-.402z"/></svg>
            Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-md">
                <img src="/images/logo.jpeg" alt="Lakshmi Ram Collections" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="block text-sm font-bold text-white">Lakshmi Ram Collections</span>
                <span className="block text-[10px] text-[#D4A017] uppercase tracking-widest">Authentic Products</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Crafting authentic traditional products with love for every celebration and occasion.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/lakshmiram_collection?igsh=MWNnZHE1dHE5NXJ5bA=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center transition-all hover:scale-110 text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_PHONE}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] flex items-center justify-center transition-all hover:scale-110 text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" className="w-4 h-4">
                  <path d="M16.003 2C8.28 2 2 8.28 2 16.003c0 2.478.65 4.897 1.885 7.02L2 30l7.18-1.858A13.94 13.94 0 0 0 16.003 30C23.72 30 30 23.72 30 16.003 30 8.28 23.72 2 16.003 2zm0 25.455a11.41 11.41 0 0 1-5.82-1.594l-.418-.248-4.26 1.102 1.13-4.14-.272-.432A11.41 11.41 0 0 1 4.545 16c0-6.32 5.138-11.455 11.458-11.455S27.455 9.68 27.455 16c0 6.318-5.135 11.455-11.452 11.455zm6.29-8.573c-.345-.172-2.04-1.006-2.356-1.12-.316-.115-.546-.172-.776.172-.23.345-.89 1.12-1.09 1.35-.2.23-.4.258-.745.086-.345-.172-1.456-.537-2.773-1.71-1.025-.913-1.717-2.04-1.918-2.385-.2-.345-.022-.532.15-.703.155-.155.345-.403.517-.604.172-.2.23-.345.345-.575.115-.23.057-.432-.029-.604-.086-.172-.776-1.87-1.063-2.56-.28-.672-.564-.58-.776-.59l-.66-.012c-.23 0-.604.086-.92.432-.316.345-1.205 1.178-1.205 2.872s1.234 3.33 1.406 3.56c.172.23 2.428 3.71 5.882 5.203.822.355 1.463.567 1.963.726.824.263 1.574.226 2.167.137.66-.099 2.04-.834 2.328-1.638.287-.804.287-1.493.2-1.638-.086-.144-.316-.23-.66-.402z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-5 uppercase tracking-wider">Shop</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Pasupu-Kumkuma', to: '/category/pasupu' },
                { label: 'Return Gifts',   to: '/category/gifts' },
                { label: 'Return Bags',    to: '/category/bags' },
                { label: 'My Orders',      to: '/profile' },
                { label: 'Wishlist',       to: '/profile?tab=wishlist' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-[#D4A017] transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-5 uppercase tracking-wider">Help</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/contact" className="hover:text-[#D4A017] transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-[#D4A017] transition-colors">Shipping Policy</Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-[#D4A017] transition-colors">Refund Policy</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-[#D4A017] transition-colors">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-5 uppercase tracking-wider">Why Us</h4>
            <ul className="space-y-3 text-sm">
              {['100% Authentic Products', 'Custom Designs Available', 'Secure Payments'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8511B] shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} Lakshmi Ram Collections. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Made with ❤️ in India</span>
            <Link to="/admin" className="flex items-center gap-1 hover:text-[#D4A017] transition-colors">
              <Lock className="w-3 h-3" /> Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
