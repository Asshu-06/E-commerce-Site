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
              <a href="#" className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-xs font-bold text-gray-400">
                IG
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-xs font-bold text-gray-400">
                FB
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
              {['100% Authentic Products', 'AP/TS: ₹80 · Others: ₹100 Shipping', 'Custom Designs Available', 'Secure Payments', '7-Day Return Policy'].map((t) => (
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
