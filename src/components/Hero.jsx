import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Play } from 'lucide-react'

export default function Hero() {
  const [visible, setVisible] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200)
    return () => clearTimeout(t)
  }, [])

  // Animated particle canvas fallback
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = []
    const particleCount = 60

    class Particle {
      constructor() {
        this.reset()
      }
      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 1
        this.speedY = Math.random() * 0.5 + 0.2
        this.speedX = (Math.random() - 0.5) * 0.3
        this.opacity = Math.random() * 0.5 + 0.3
        this.color = Math.random() > 0.5 ? '#fbbf24' : '#dc2626' // amber or red
      }
      update() {
        this.y += this.speedY
        this.x += this.speedX
        if (this.y > canvas.height) this.reset()
      }
      draw() {
        ctx.fillStyle = this.color
        ctx.globalAlpha = this.opacity
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.update()
        p.draw()
      })
      requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-black">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        {/* Fallback gradient + canvas particles */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 via-red-900/50 to-black" />
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Video element — replace src with your video */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          poster="/images/pasupukumkuma-couple.jpeg"
        >
          {/* 
            REPLACE THESE WITH YOUR VIDEO FILES:
            Generate using Runway ML / Kling AI with prompt:
            "Cinematic slow motion, golden turmeric powder and deep red kumkuma flowing from brass container, 
            warm golden lighting, soft depth of field, dark background, luxury traditional Indian aesthetic, 4K"
          */}
          <source src="/videos/hero-background.mp4" type="video/mp4" />
          <source src="/videos/hero-background.webm" type="video/webm" />
        </video>

        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />
      </div>

      {/* Parallax content container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
        <div className="max-w-3xl">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm border border-amber-400/30 text-amber-200 text-sm font-medium px-5 py-2 rounded-full mb-8 transition-all duration-1000 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Handcrafted with Love</span>
          </div>

          {/* Main heading */}
          <h1
            className={`text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6 transition-all duration-1000 delay-100 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <span className="text-white drop-shadow-2xl">Authentic </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 drop-shadow-lg animate-gradient">
              Traditional
            </span>
            <br />
            <span className="text-white drop-shadow-2xl">Products</span>
          </h1>

          {/* Subtitle */}
          <p
            className={`text-xl sm:text-2xl text-amber-100 font-medium mb-4 drop-shadow-lg transition-all duration-1000 delay-200 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Pasupu-Kumkuma, Return Gifts &amp; Bags
          </p>

          <p
            className={`text-base sm:text-lg text-gray-300 mb-10 leading-relaxed max-w-xl drop-shadow-md transition-all duration-1000 delay-300 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Celebrate every occasion with our curated collection of traditional items. From classic pasupu sets to
            beautifully crafted return gifts — all made with authentic materials.
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-wrap gap-4 mb-12 transition-all duration-1000 delay-500 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <Link
              to="/category/pasupu"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-10 py-4 rounded-full shadow-2xl shadow-amber-500/40 transition-all hover:shadow-amber-500/60 hover:-translate-y-1 active:translate-y-0"
            >
              Shop Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/category/gifts"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md hover:bg-white/20 border-2 border-white/30 text-white font-semibold px-10 py-4 rounded-full transition-all hover:-translate-y-1 active:translate-y-0"
            >
              View Gifts
            </Link>
          </div>

          {/* Stats */}
          <div
            className={`flex flex-wrap gap-8 transition-all duration-1000 delay-700 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            {[
              { value: '500+', label: 'Happy Customers' },
              { value: '50+', label: 'Products' },
              { value: '100%', label: 'Authentic' },
            ].map((stat) => (
              <div key={stat.label} className="backdrop-blur-sm bg-white/5 px-5 py-3 rounded-xl border border-white/10">
                <div className="text-3xl font-bold text-amber-400 drop-shadow-lg">{stat.value}</div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Barani image — bottom right ── */}
      <div
        className={`absolute bottom-0 right-0 pointer-events-none transition-all duration-1000 delay-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        {/* Glow behind image */}
        <div className="absolute inset-0 rounded-tl-3xl blur-3xl bg-gradient-to-tl from-amber-500/30 via-red-600/20 to-transparent scale-110" />

        {/* Floating animation wrapper */}
        <div className="animate-float">
          <img
            src="/images/image.png"
            alt="Pasupu Kumkuma Barani"
            className="
              w-[280px] sm:w-[360px] md:w-[420px] lg:w-[500px] xl:w-[560px]
              object-contain object-bottom
              drop-shadow-[0_0_60px_rgba(245,158,11,0.35)]
              select-none
            "
            style={{
              maskImage: 'linear-gradient(to top, black 60%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to top, black 60%, transparent 100%)',
            }}
          />
        </div>

        {/* Scattered powder particles on floor */}
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none">
          <div className="absolute bottom-2 left-8 w-24 h-3 bg-amber-500/20 blur-xl rounded-full" />
          <div className="absolute bottom-1 right-12 w-32 h-3 bg-red-600/20 blur-xl rounded-full" />
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce transition-opacity duration-1000 delay-1000 ${
          visible ? 'opacity-60' : 'opacity-0'
        }`}
      >
        <span className="text-xs text-white/60 uppercase tracking-wider font-medium">Scroll</span>
        <div className="w-0.5 h-10 bg-gradient-to-b from-amber-400/80 to-transparent rounded-full" />
      </div>

      {/* Cinematic vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]" />
    </section>
  )
}
