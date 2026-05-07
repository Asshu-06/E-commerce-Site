import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { categories } from '../lib/mockData'

export default function CategorySection() {
  const navigate = useNavigate()

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Our{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
            Collections
          </span>
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto text-base sm:text-lg">
          Explore our handpicked traditional product categories, crafted for every celebration.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => navigate(cat.path)}
            className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label={`Browse ${cat.name}`}
          >
            {/* Image */}
            <div className="relative h-56 sm:h-64 overflow-hidden">
              <img
                src={cat.image_url}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </div>

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              {cat.hasTabs && (
                <span className="inline-block bg-amber-400 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full mb-2">
                  Standard + Customization
                </span>
              )}
              <h3 className="text-xl font-bold text-white mb-1">{cat.name}</h3>
              <p className="text-white/80 text-sm mb-3 line-clamp-2">{cat.description}</p>
              <div className="flex items-center gap-1.5 text-amber-300 text-sm font-medium group-hover:gap-3 transition-all duration-200">
                <span>Explore</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
