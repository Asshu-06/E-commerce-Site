import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Pencil, Trash2, Save, X, ImagePlus } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = { name: '', description: '', image_url: '' }

// Auto-generate slug from name
const toSlug = (name) => name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

async function uploadCategoryImage(file) {
  const ext  = file.name.split('.').pop().toLowerCase()
  const path = `categories/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('product-images').upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [editing, setEditing]       = useState(null)
  const [form, setForm]             = useState(EMPTY)
  const [saving, setSaving]         = useState(false)
  const [imageFile, setImageFile]   = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) { console.warn('Categories table not found:', error.message); setCategories([]) }
    else setCategories(data || [])
    setLoading(false)
  }

  const openNew = () => {
    setForm(EMPTY); setEditing('new')
    setImageFile(null); setImagePreview('')
  }
  const openEdit = (cat) => {
    setForm({ name: cat.name || '', description: cat.description || '', image_url: cat.image_url || '' })
    setEditing(cat)
    setImageFile(null); setImagePreview(cat.image_url || '')
  }

  const handleImagePick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Category name is required'); return }
    setSaving(true)
    try {
      const slug = toSlug(form.name)
      let finalImageUrl = form.image_url.trim()
      if (imageFile) {
        try { finalImageUrl = await uploadCategoryImage(imageFile) }
        catch { toast.error('Image upload failed — saving without image') }
      }
      const payload = {
        name:        form.name.trim(),
        slug,
        description: form.description.trim() || null,
        image_url:   finalImageUrl || null,
      }

      if (editing === 'new') {
        const { error } = await supabase.from('categories').insert([payload])
        if (error) throw error
        toast.success('Category created!')
      } else {
        // Never change slug on edit — products are linked to it
        const { error } = await supabase.from('categories')
          .update({ name: form.name.trim(), description: form.description.trim() || null, image_url: finalImageUrl || null })
          .eq('id', editing.id)
        if (error) throw error
        toast.success('Category updated!')
      }
      setEditing(null)
      fetchCategories()
    } catch (err) {
      toast.error(err.message || 'Failed to save category')
    }
    setSaving(false)
  }

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"? This cannot be undone.`)) return
    const { error } = await supabase.from('categories').delete().eq('id', cat.id)
    if (error) { toast.error(error.message); return }
    toast.success('Category deleted')
    fetchCategories()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage store categories</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm shadow-sm">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Form panel */}
      {editing && (
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">{editing === 'new' ? 'New Category' : 'Edit Category'}</h2>
            <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {/* Left: text fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Pasupu-Kumkuma"
                  autoFocus
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
                {form.name && (
                  <p className="text-xs text-gray-400 mt-1">Slug: <span className="font-mono">{toSlug(form.name)}</span></p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400 font-normal">(shown on category page)</span></label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Traditional turmeric & kumkuma sets for every occasion"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image URL <span className="text-gray-400 font-normal">(or upload below)</span></label>
                <input
                  value={form.image_url}
                  onChange={(e) => setForm(f => ({ ...f, image_url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
            </div>

            {/* Right: image upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image Upload</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-full rounded-xl border-2 border-dashed border-gray-200 hover:border-amber-400 bg-gray-50 hover:bg-amber-50 transition-all cursor-pointer overflow-hidden group"
                style={{ aspectRatio: '3/1' }}
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium flex items-center gap-2">
                        <ImagePlus className="w-4 h-4" /> Change Image
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400 group-hover:text-amber-500">
                    <ImagePlus className="w-8 h-8" />
                    <p className="text-xs font-medium">Click to upload banner image</p>
                    <p className="text-xs text-gray-300">Recommended: 1200×400px</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
              {imagePreview && (
                <button type="button"
                  onClick={() => { setImagePreview(''); setImageFile(null); setForm(f => ({ ...f, image_url: '' })) }}
                  className="mt-1.5 text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                  <X className="w-3 h-3" /> Remove image
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Category'}
            </button>
            <button onClick={() => setEditing(null)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <span className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-amber-100 p-12 text-center">
          <div className="text-5xl mb-3">🗂️</div>
          <p className="text-gray-500 text-sm">No categories yet. Click "Add Category" to create one.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Category</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Slug</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Banner</th>
                <th className="text-right px-5 py-3.5 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900">{cat.name}</p>
                    {cat.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{cat.description}</p>}
                  </td>
                  <td className="px-4 py-3.5 text-gray-400 font-mono text-xs">{cat.slug}</td>
                  <td className="px-4 py-3.5">
                    {cat.image_url
                      ? <img src={cat.image_url} alt="" className="w-20 h-8 object-cover rounded-lg border border-gray-100" />
                      : <span className="text-xs text-gray-300">No image</span>
                    }
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(cat)}
                        className="p-2 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(cat)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

