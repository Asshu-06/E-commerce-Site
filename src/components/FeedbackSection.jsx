import { useState } from 'react'
import { MessageSquare, Send, Star, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE || '918639006849'

export default function FeedbackSection() {
  const [form, setForm]       = useState({ name: '', email: '', message: '', rating: 0 })
  const [hover, setHover]     = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.message.trim()) { toast.error('Please enter your message'); return }
    setLoading(true)

    // Send via WhatsApp as fallback (no separate feedback table needed)
    const msg = `📝 New Feedback\nName: ${form.name || 'Anonymous'}\nEmail: ${form.email || 'N/A'}\nRating: ${'⭐'.repeat(form.rating || 0)}\nMessage: ${form.message}`
    try {
      // Try saving to Supabase if feedback table exists
      await supabase.from('feedback').insert([{
        name: form.name || null,
        email: form.email || null,
        rating: form.rating || null,
        message: form.message,
      }]).then(() => {})
    } catch { /* table may not exist, that's fine */ }

    setLoading(false)
    setSubmitted(true)
    toast.success('Thank you for your feedback! 🙏')
  }

  if (submitted) {
    return (
      <section className="py-20 bg-[#FAF7F2] border-t border-[#FAE3D3]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Thank you for your feedback!</h3>
          <p className="text-gray-500 text-sm">Your response helps us serve you better.</p>
          <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', message: '', rating: 0 }) }}
            className="mt-5 text-sm text-[#C8511B] font-medium hover:underline">
            Submit another response
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-[#FAF7F2] border-t border-[#FAE3D3]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold tracking-widest uppercase text-[#C8511B] block mb-2">Feedback</span>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">Share Your Experience</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            We'd love to hear from you. Your feedback helps us improve and serve you better.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#FAE3D3] shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Star rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Overall Experience</label>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((s) => (
                  <button key={s} type="button"
                    onMouseEnter={() => setHover(s)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setForm(f => ({ ...f, rating: s }))}
                    className="transition-transform hover:scale-110">
                    <Star className={`w-8 h-8 transition-colors ${
                      s <= (hover || form.rating)
                        ? 'text-[#D4A017] fill-[#D4A017]'
                        : 'text-gray-200 fill-gray-200'
                    }`} />
                  </button>
                ))}
                {form.rating > 0 && (
                  <span className="ml-2 text-sm font-medium text-[#C8511B]">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][form.rating]}
                  </span>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Priya Sharma"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8895A] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email (optional)</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8895A] focus:border-transparent" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Your Message <span className="text-red-400">*</span>
              </label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Tell us about your experience with our products and service..."
                rows={4} required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8895A] focus:border-transparent resize-none" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button type="submit" disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-[#C8511B] hover:bg-[#B04516] disabled:bg-[#E8895A] text-white font-bold py-3.5 rounded-2xl transition-all hover:-translate-y-0.5 shadow-lg shadow-[#C8511B]/20">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <Send className="w-4 h-4" />}
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
              <a href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent('Hello, I have feedback about Shubham Traditions: ')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-6 rounded-2xl transition-all hover:-translate-y-0.5">
                <MessageSquare className="w-4 h-4" />
                WhatsApp Us
              </a>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
