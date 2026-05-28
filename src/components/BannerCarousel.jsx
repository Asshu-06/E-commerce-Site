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

  const slide = slides[current]

  return (
    <div className="relative w-full overflow-hidden bg-gray-900" style={{ aspectRatio: '3/1', maxHeight: '400px' }}>
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {s.image_url && (
            <img src={s.image_url} alt={s.title || `Slide ${i + 1}`} className="w-full h-full object-cover" />
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

          {/* Text */}
          {(s.title || s.subtitle) && (
            <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-16">
              {s.title && (
                <h2 className="text-white text-2xl sm:text-4xl font-bold drop-shadow-lg mb-2 max-w-lg">{s.title}</h2>
              )}
              {s.subtitle && (
                <p className="text-white/80 text-sm sm:text-lg max-w-md drop-shadow">{s.subtitle}</p>
              )}
              {s.link && (
                <button
                  onClick={() => navigate(s.link)}
                  className="mt-4 self-start bg-[#C8511B] hover:bg-[#B04516] text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-all hover:-translate-y-0.5 shadow-lg"
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
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
