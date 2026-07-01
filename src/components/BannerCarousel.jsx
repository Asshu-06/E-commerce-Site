import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function BannerCarousel() {
  const [slides, setSlides]     = useState([])
  const [current, setCurrent]   = useState(0)
  const [loading, setLoading]   = useState(true)
  const navigate                = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('position', { ascending: true })
      if (data && data.length > 0) setSlides(data)
      setLoading(false)
    }
    fetch()
  }, [])

  const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), [slides.length])
  const prev = () => setCurrent(c => (c - 1 + slides.length) % slides.length)

  // Auto-advance every 4s
  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(next, 4000)
    return () => clearInterval(t)
  }, [slides.length, next])

  if (loading || slides.length === 0) return null

  const s = slides[current]

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gray-900"
      style={{ aspectRatio: '16/6', minHeight: '160px', maxHeight: '420px' }}>

      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          onClick={() => slide.link && navigate(slide.link)}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'} ${slide.link ? 'cursor-pointer' : ''}`}
        >
          {slide.image_url ? (
            // ── Card layout: colored bg + text left + image right ──────────
            <div className="w-full h-full flex items-center overflow-hidden"
              style={{ background: slide.bg_color || 'linear-gradient(135deg, #7B1E1E 0%, #C8511B 100%)' }}>
              {/* Text left */}
              <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-14 py-4 min-w-0 z-10">
                {slide.title && (
                  <h2 className="text-white text-xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-2 drop-shadow-lg">
                    {slide.title}
                  </h2>
                )}
                {slide.subtitle && (
                  <p className="text-white/90 text-sm sm:text-base font-medium mb-1 drop-shadow">{slide.subtitle}</p>
                )}
                {slide.price && (
                  <p className="text-white font-bold text-lg sm:text-2xl mb-3">₹{slide.price}</p>
                )}
                {slide.link && (
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(slide.link) }}
                    className="self-start bg-white text-[#C8511B] hover:bg-white/90 font-bold px-5 py-2 rounded-full text-sm transition-all shadow-lg"
                  >
                    Explore →
                  </button>
                )}
              </div>
              {/* Image right — fills half the banner height */}
              <div className="h-full flex items-end justify-end" style={{ minWidth: '40%', maxWidth: '45%' }}>
                <img
                  src={slide.image_url}
                  alt={slide.title || `Slide ${i + 1}`}
                  className="h-full w-full object-cover object-center"
                  style={{ maskImage: 'linear-gradient(to left, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, black 60%, transparent 100%)' }}
                />
              </div>
            </div>
          ) : (
            // ── Fallback: gradient background with text ─────────────────────
            <div className="w-full h-full flex flex-col justify-center px-6 sm:px-12"
              style={{ background: slide.bg_color || 'linear-gradient(135deg, #7B1E1E 0%, #C8511B 100%)' }}>
              {slide.title && (
                <h2 className="text-white text-xl sm:text-3xl font-bold mb-2">{slide.title}</h2>
              )}
              {slide.subtitle && (
                <p className="text-white/80 text-sm sm:text-base">{slide.subtitle}</p>
              )}
              {slide.link && (
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(slide.link) }}
                  className="mt-4 self-start bg-white text-[#C8511B] font-bold px-5 py-2 rounded-full text-sm transition-all shadow-lg"
                >
                  Shop Now →
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev() }}
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next() }}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
              className={`rounded-full transition-all ${i === current ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
