import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import CategorySection from '../components/CategorySection'
import { Sparkles, Shield, Truck, Star, ArrowRight, MessageCircle, MapPin, Package } from 'lucide-react'
import { mockProducts } from '../lib/mockData'
import ProductCard from '../components/ProductCard'

const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE || '917997060668'

function AnimatedSection({ children, className = '' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`transition-all duration-700 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    } ${className}`}>
      {children}
    </div>
  )
}

export default function HomePage() {
  const featuredProducts = mockProducts.filter(p => p.type === 'standard').slice(0, 4)

  return (
    <main className="bg-stone-50">
      <Hero />

      {/* Trust bar */}
      <div className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {[
              { icon: <Truck className="w-5 h-5 text-[#C8511B]" />,    title: 'Fast Delivery',  sub: 'PAN India shipping' },
              { icon: <Shield className="w-5 h-5 text-[#C8511B]" />,   title: '100% Authentic', sub: 'Verified products' },
              { icon: <Sparkles className="w-5 h-5 text-[#C8511B]" />, title: 'Custom Designs', sub: 'WhatsApp us' },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-3 px-6 py-5">
                <div className="w-10 h-10 bg-[#FDF3EC] rounded-xl flex items-center justify-center shrink-0">{f.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                  <p className="text-xs text-gray-400">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <AnimatedSection>
        <CategorySection />
      </AnimatedSection>

      {/* Featured products */}
      <AnimatedSection>
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-[#C8511B] block mb-2">Featured</span>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Best Sellers</h2>
            </div>
            <Link to="/category/pasupu"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-[#C8511B] transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
            {featuredProducts.map((p) => (
              <div key={p.id} className="animate-fade-up">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      </AnimatedSection>

      {/* Shipping charges info */}
      <AnimatedSection>
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-10">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FDF3EC] rounded-xl flex items-center justify-center">
                <Truck className="w-5 h-5 text-[#C8511B]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Delivery Charges</h3>
                <p className="text-xs text-gray-400">Minimum order: 20 pieces · Charges based on quantity</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              {/* PAN India — single unified table */}
              <div className="p-6 sm:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-5 h-5 text-emerald-600" />
                  <p className="font-bold text-gray-900">PAN India Shipping</p>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">All States</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-x-12 space-y-1.5 text-sm">
                  {[
                    { qty: '≤ 100 pcs', price: '₹80' },
                    { qty: '≤ 200 pcs', price: '₹150' },
                    { qty: '≤ 300 pcs', price: '₹200' },
                    { qty: '≤ 400 pcs', price: '₹250' },
                    { qty: '400+ pcs',  price: '+₹50 per 100' },
                  ].map((r) => (
                    <div key={r.qty} className="flex justify-between text-gray-600">
                      <span>{r.qty}</span>
                      <span className="font-semibold text-[#C8511B]">{r.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Banner — customization CTA */}
      <AnimatedSection>
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#C8511B] via-orange-500 to-red-500 p-10 sm:p-14">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full" />
            <div className="absolute -bottom-16 -left-10 w-80 h-80 bg-white/5 rounded-full" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
              <div>
                <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                  Custom Orders
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
                  Want a personalised<br />Pasupu-Kumkuma set?
                </h2>
                <p className="text-white/80 text-base max-w-md">
                  Baby shower, wedding, housewarming — we create custom designs for every occasion. Chat with us on WhatsApp.
                </p>
              </div>
              <a href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent('Hello, I want a custom Pasupu-Kumkuma set.')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 bg-white text-[#C8511B] font-bold px-8 py-4 rounded-2xl hover:bg-orange-50 transition-all hover:-translate-y-1 shadow-xl shadow-black/20 shrink-0 text-base">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" className="w-5 h-5"><path d="M16.003 2C8.28 2 2 8.28 2 16.003c0 2.478.65 4.897 1.885 7.02L2 30l7.18-1.858A13.94 13.94 0 0 0 16.003 30C23.72 30 30 23.72 30 16.003 30 8.28 23.72 2 16.003 2zm0 25.455a11.41 11.41 0 0 1-5.82-1.594l-.418-.248-4.26 1.102 1.13-4.14-.272-.432A11.41 11.41 0 0 1 4.545 16c0-6.32 5.138-11.455 11.458-11.455S27.455 9.68 27.455 16c0 6.318-5.135 11.455-11.452 11.455zm6.29-8.573c-.345-.172-2.04-1.006-2.356-1.12-.316-.115-.546-.172-.776.172-.23.345-.89 1.12-1.09 1.35-.2.23-.4.258-.745.086-.345-.172-1.456-.537-2.773-1.71-1.025-.913-1.717-2.04-1.918-2.385-.2-.345-.022-.532.15-.703.155-.155.345-.403.517-.604.172-.2.23-.345.345-.575.115-.23.057-.432-.029-.604-.086-.172-.776-1.87-1.063-2.56-.28-.672-.564-.58-.776-.59l-.66-.012c-.23 0-.604.086-.92.432-.316.345-1.205 1.178-1.205 2.872s1.234 3.33 1.406 3.56c.172.23 2.428 3.71 5.882 5.203.822.355 1.463.567 1.963.726.824.263 1.574.226 2.167.137.66-.099 2.04-.834 2.328-1.638.287-.804.287-1.493.2-1.638-.086-.144-.316-.23-.66-.402z"/></svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </main>
  )
}
