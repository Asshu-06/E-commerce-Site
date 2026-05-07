import { Link } from 'react-router-dom'
import { Leaf, Phone, Mail, MapPin, MessageCircle, Lock } from 'lucide-react'

const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE || '918639006849'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="block text-base font-bold text-white">Shubham</span>
                <span className="block text-xs text-amber-400 -mt-0.5">Traditions</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Authentic traditional products crafted with love for every celebration and occasion.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Home', to: '/' },
                { label: 'Pasupu-Kumkuma', to: '/category/pasupu' },
                { label: 'Return Gifts', to: '/category/gifts' },
                { label: 'Return Bags', to: '/category/bags' },
                { label: 'Cart', to: '/cart' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-amber-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <span>+91 863 900 6849</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <span>hello@shubhamtraditions.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <span>Hyderabad, Telangana, India</span>
              </li>
            </ul>
          </div>

          {/* WhatsApp CTA */}
          <div>
            <h4 className="text-white font-semibold mb-4">Need Help?</h4>
            <p className="text-sm text-gray-400 mb-4">
              Chat with us on WhatsApp for customization orders and enquiries.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent('Hello, I need help with my order.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Shubham Traditions. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <p>Made with ❤️ for traditional celebrations</p>
            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-gray-600 hover:text-amber-400 transition-colors"
            >
              <Lock className="w-3 h-3" />
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
