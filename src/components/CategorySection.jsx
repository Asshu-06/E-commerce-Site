import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { categories } from '../lib/mockData'

export default function CategorySection() {
  const navigate = useNavigate()

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section header */}
      <div className="text-center mb-14">
        <span className="inline-block text-xs font-bold tracking-widest uppercase text-[#C8511B] mb-3">Collections</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
          Shop by Category
        </h2>
        <p className="text-gray-500 max-w-lg mx-auto">
          Handpicked traditional products for every celebration and occasion.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat, i) => (
          <button key={cat.id} onClick={() => navigate(cat.path)}
            className="group relative overflow-hidden rounded-3xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 card-hover"
            style={{ animationDelay: `${i * 100}ms` }}>

            {/* Image */}
            <div className="relative h-72 overflow-hidden">
              <img src={cat.image_url} alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {/* Shimmer on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              {cat.hasTabs && (
                <span className="inline-block bg-amber-400 text-amber-900 text-[11px] font-bold px-2.5 py-1 rounded-full mb-2 uppercase tracking-wide">
                  Standard + Custom
                </span>
              )}
              <h3 className="text-xl font-bold text-white mb-1">{cat.name}</h3>
              <p className="text-white/70 text-sm mb-4 line-clamp-2">{cat.description}</p>
              <div className="flex items-center gap-2 text-amber-300 text-sm font-semibold group-hover:gap-3 transition-all duration-300">
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
