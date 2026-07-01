import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Save, ImagePlus, X, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

const MAX_SLIDES = 5
const EMPTY_SLIDE = { title: '', subtitle: '', image_url: '', link: '', active: true }

export default function AdminBanners() {
  const [slides, setSlides]   = useState([])
  const [saving, setSaving]   = useState(false)
  const [previews, setPreviews] = useState({})
  const [files, setFiles]     = useState({})
  const [tableReady, setTableReady] = useState(true)

  useEffect(() => { fetchBanners() }, [])

  const fetchBanners = async () => {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('position', { ascending: true })

    if (error) {
      setTableReady(false)
      setSlides(Array.from({ length: MAX_SLIDES }, (_, i) => ({ ...EMPTY_SLIDE, position: i + 1 })))
      return
    }

    setTableReady(true)
    if (data && data.length > 0) {
      // Fill up to MAX_SLIDES, merging existing data
      const filled = Array.from({ length: MAX_SLIDES }, (_, i) => {
        const existing = data.find(d => d.position === i + 1)
        return existing || { ...EMPTY_SLIDE, position: i + 1 }
      })
      setSlides(filled)
    } else {
      setSlides(Array.from({ length: MAX_SLIDES }, (_, i) => ({ ...EMPTY_SLIDE, position: i + 1 })))
    }
  }

  const handleChange = (idx, field, value) => {
    setSlides(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  const handleImagePick = (idx, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFiles(prev => ({ ...prev, [idx]: file }))
    setPreviews(prev => ({ ...prev, [idx]: URL.createObjectURL(file) }))
  }

  const removeImage = (idx) => {
    setFiles(prev => { const n = { ...prev }; delete n[idx]; return n })
    setPreviews(prev => { const n = { ...prev }; delete n[idx]; return n })
    handleChange(idx, 'image_url', '')
  }

  const uploadImage = async (idx) => {
    const file = files[idx]
    if (!file) return slides[idx]?.image_url || ''
    const ext  = file.name.split('.').pop().toLowerCase()
    const path = `banners/slide-${idx + 1}-${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, file, { cacheControl: '3600', upsert: true })
    if (error) throw new Error('Image upload failed: ' + error.message)
    return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await Promise.all(
        slides.map(async (slide, idx) => {
          const { bg_color, ...rest } = slide
          return {
            ...rest,
            position:  idx + 1,
            image_url: await uploadImage(idx),
          }
        })
      )

      // Upsert all slides
      const { error } = await supabase
        .from('banners')
        .upsert(updated, { onConflict: 'position' })

      if (error) throw error
      toast.success('Banners saved!')
      setFiles({})
      fetchBanners()
    } catch (err) {
      toast.error(err.message || 'Failed to save banners')
    }
    setSaving(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage up to {MAX_SLIDES} homepage banner slides</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm shadow-sm"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save All Banners'}
        </button>
      </div>

      <div className="space-y-4">
        {slides.map((slide, idx) => (
          <div key={idx} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${slide.active ? 'border-amber-200' : 'border-gray-100 opacity-60'}`}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
              <span className="font-semibold text-gray-700 text-sm">Slide {idx + 1}</span>
              <button
                onClick={() => handleChange(idx, 'active', !slide.active)}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  slide.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {slide.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {slide.active ? 'Active' : 'Hidden'}
              </button>
            </div>

            <div className="p-5 grid sm:grid-cols-2 gap-5">
              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image</label>
                {(previews[idx] || slide.image_url) ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={previews[idx] || slide.image_url}
                      alt={`Slide ${idx + 1}`}
                      className="w-full h-40 object-cover"
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors">
                    <ImagePlus className="w-8 h-8 text-gray-300 mb-2" />
                    <span className="text-sm text-gray-400">Click to upload image</span>
                    <span className="text-xs text-gray-300 mt-1">Recommended: 1200×400px</span>
                    <input type="file" accept="image/*" onChange={(e) => handleImagePick(idx, e)} className="hidden" />
                  </label>
                )}
                {/* Also allow URL input */}
                <input
                  type="text"
                  value={slide.image_url}
                  onChange={(e) => handleChange(idx, 'image_url', e.target.value)}
                  placeholder="Or paste image URL..."
                  className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              {/* Text fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => handleChange(idx, 'title', e.target.value)}
                    placeholder="e.g. New Collection Arrived"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={slide.subtitle}
                    onChange={(e) => handleChange(idx, 'subtitle', e.target.value)}
                    placeholder="e.g. Shop our latest traditional products"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    type="text"
                    value={slide.link}
                    onChange={(e) => handleChange(idx, 'link', e.target.value)}
                    placeholder="e.g. /category/pasupu"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Background Color <span className="text-gray-400 font-normal">(optional)</span></label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={slide.bg_color?.startsWith('#') ? slide.bg_color : '#1a0533'}
                      onChange={(e) => handleChange(idx, 'bg_color', e.target.value)}
                      className="w-10 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={slide.bg_color || ''}
                      onChange={(e) => handleChange(idx, 'bg_color', e.target.value)}
                      placeholder="e.g. #1a0533 or gradient CSS"
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!tableReady && (
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">📋 Setup required</p>
        <p>Run this SQL in Supabase to create the banners table:</p>
        <pre className="mt-2 bg-white rounded-lg p-3 text-xs text-gray-700 overflow-x-auto border border-amber-100">{`CREATE TABLE IF NOT EXISTS public.banners (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position   int NOT NULL UNIQUE,
  title      text,
  subtitle   text,
  image_url  text,
  link       text,
  active     boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Banners public read" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Banners auth write" ON public.banners FOR ALL TO authenticated USING (true) WITH CHECK (true);`}</pre>
      </div>
      )}
    </div>
  )
}
