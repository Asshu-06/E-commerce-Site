import Hero from '../components/Hero'
import CategorySection from '../components/CategorySection'
import { Sparkles, Shield, Truck } from 'lucide-react'

const features = [
  {
    icon: <Sparkles className="w-6 h-6 text-amber-500" />,
    title: 'Authentic Products',
    desc: 'Every item is sourced from trusted artisans and traditional makers.',
  },
  {
    icon: <Shield className="w-6 h-6 text-amber-500" />,
    title: 'Quality Assured',
    desc: 'We ensure premium quality in every product we deliver.',
  },
  {
    icon: <Truck className="w-6 h-6 text-amber-500" />,
    title: 'Fast Delivery',
    desc: 'Quick and safe delivery to your doorstep across India.',
  },
]

export default function HomePage() {
  return (
    <main>
      <Hero />

      {/* Features strip */}
      <section className="bg-white border-y border-amber-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CategorySection />

      {/* Testimonials */}
      <section className="bg-amber-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { name: 'Priya S.', text: 'Beautiful pasupu kumkuma sets! Perfect for our wedding return gifts.', stars: 5 },
              { name: 'Lakshmi R.', text: 'The customization option via WhatsApp was so convenient. Loved the baby shower theme!', stars: 5 },
              { name: 'Anitha M.', text: 'Great quality jute bags. Ordered 100 pieces for our function and everyone loved them.', stars: 5 },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 text-left">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <span key={i} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-4 italic">"{t.text}"</p>
                <p className="text-gray-900 font-semibold text-sm">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
