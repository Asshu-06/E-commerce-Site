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
            <div className="w-full h-full flex items-center"
              style={{ background: slide.bg_color || 'linear-gradient(135deg, #1a0533 0%, #2d0a5e 100%)' }}>
              {/* Text left */}
              <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-14 py-4 min-w-0">
                {slide.badge && (
                  <span className="inline-block bg-purple-500/80 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full mb-2 w-fit tracking-wide uppercase">
                    {slide.badge}
                  </span>
                )}
                {slide.title && (
                  <h2 className="text-white text-lg sm:text-2xl lg:text-3xl font-bold leading-tight mb-1">
                    {slide.title}
                  </h2>
                )}
                {slide.subtitle && (
                  <p className="text-purple-300 text-xs sm:text-sm font-medium mb-1">{slide.subtitle}</p>
                )}
                {slide.description && (
                  <p className="text-white/60 text-[11px] sm:text-sm mb-3">{slide.description}</p>
                )}
                {slide.price && (
                  <p className="text-white font-bold text-base sm:text-lg mb-3">₹{slide.price}</p>
                )}
                {slide.link && (
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(slide.link) }}
                    className="self-start bg-white/20 hover:bg-white/30 border border-white/30 text-white font-semibold px-4 py-1.5 rounded-full text-xs sm:text-sm transition-all"
                  >
                    Explore →
                  </button>
                )}
              </div>
              {/* Image right — fully visible */}
              <div className="flex-shrink-0 flex items-center justify-center pr-6 sm:pr-10 lg:pr-14 py-4">
                <img
                  src={slide.image_url}
                  alt={slide.title || `Slide ${i + 1}`}
                  className="h-24 sm:h-32 lg:h-40 w-auto object-contain rounded-2xl shadow-2xl"
                  style={{ maxWidth: '35%' }}
                />
              </div>
            </div>
          ) : (
            // ── Fallback: dark gradient background only ─────────────────────
            <div className="w-full h-full flex flex-col justify-center px-6 sm:px-12"
              style={{ background: slide.bg_color || 'linear-gradient(135deg, #1C1917 0%, #3D1A0A 100%)' }}>
              {slide.title && (
                <h2 className="text-white text-xl sm:text-3xl font-bold mb-2">{slide.title}</h2>
              )}
              {slide.subtitle && (
                <p className="text-white/70 text-sm sm:text-base">{slide.subtitle}</p>
              )}
              {slide.link && (
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(slide.link) }}
                  className="mt-4 self-start bg-[#C8511B] hover:bg-[#B04516] text-white font-semibold px-5 py-2 rounded-full text-sm transition-all shadow-lg"
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
