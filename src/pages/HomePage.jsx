import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import CategorySection from '../components/CategorySection'
import { Sparkles, Shield, Truck, Star, ArrowRight, MessageCircle } from 'lucide-react'
import { mockProducts } from '../lib/mockData'
import ProductCard from '../components/ProductCard'

const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE || '918639006849'

function useInView(ref) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) entry.target.classList.add('in-view') },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref])
}

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
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
            {[
              { icon: <Truck className="w-5 h-5 text-[#C8511B]" />,    title: 'Free Delivery',     sub: 'On all orders' },
              { icon: <Shield className="w-5 h-5 text-[#C8511B]" />,   title: '100% Authentic',    sub: 'Verified products' },
              { icon: <Sparkles className="w-5 h-5 text-[#C8511B]" />, title: 'Custom Designs',    sub: 'WhatsApp us' },
              { icon: <Star className="w-5 h-5 text-[#C8511B]" />,     title: '500+ Happy Buyers', sub: 'Trusted store' },
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

      {/* Banner — customization CTA */}
      <AnimatedSection>
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-10 sm:p-14">
            {/* Decorative circles */}
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
                className="flex items-center gap-2.5 bg-white text-orange-600 font-bold px-8 py-4 rounded-2xl hover:bg-orange-50 transition-all hover:-translate-y-1 shadow-xl shadow-black/20 shrink-0 text-base">
                <MessageCircle className="w-5 h-5" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Testimonials */}
      <AnimatedSection>
        <section className="py-20 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-bold tracking-widest uppercase text-[#C8511B] block mb-2">Reviews</span>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">What customers say</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 stagger-children">
              {[
                { name: 'Priya S.',   text: 'Beautiful pasupu kumkuma sets! Perfect for our wedding return gifts. Everyone loved them.', stars: 5 },
                { name: 'Lakshmi R.', text: 'The customization via WhatsApp was so convenient. Loved the baby shower theme design!', stars: 5 },
                { name: 'Anitha M.', text: 'Ordered 100 jute bags for our function. Great quality and fast delivery. Highly recommend!', stars: 5 },
              ].map((t, i) => (
                <div key={t.name} className="bg-stone-50 rounded-2xl p-6 border border-gray-100 animate-fade-up">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold">
                      {t.name[0]}
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>
    </main>
  )
}
