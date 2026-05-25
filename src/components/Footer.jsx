import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, MessageCircle, Lock, Share2, Users } from 'lucide-react'

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
            <MessageCircle className="w-5 h-5" />
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
              <a href="#" className="w-9 h-9 rounded-xl bg-white/5 hover:bg-blue-600 flex items-center justify-center transition-all text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
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

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-5 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#D4A017] mt-0.5 shrink-0" />
                <span>+91 799 706 0668</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#D4A017] mt-0.5 shrink-0" />
                <a href="mailto:Lakshmiramcollections@gmail.com" className="hover:text-[#D4A017] transition-colors break-all">
                  Lakshmiramcollections@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#D4A017] mt-0.5 shrink-0" />
                <a
                  href="https://maps.google.com/?q=Gothic+Pentagon+Clouds,+Bachupally,+Hyderabad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D4A017] transition-colors leading-relaxed"
                >
                  Gothic Pentagon Clouds,<br />
                  beside Pista House, Bachupally,<br />
                  Hyderabad, Telangana
                </a>
              </li>
            </ul>

            {/* Embedded Google Map */}
            <div className="mt-5 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
              <iframe
                title="Lakshmi Ram Collections Location"
                src="https://maps.google.com/maps?q=Gothic+Pentagon+Clouds+Bachupally+Hyderabad&output=embed&z=15"
                width="100%"
                height="180"
                style={{ border: 0, display: 'block' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href="https://maps.google.com/?q=Gothic+Pentagon+Clouds,+Bachupally,+Hyderabad"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-1.5 text-xs text-[#D4A017] hover:text-amber-300 transition-colors font-medium"
            >
              <MapPin className="w-3 h-3" /> Open in Google Maps →
            </a>
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
