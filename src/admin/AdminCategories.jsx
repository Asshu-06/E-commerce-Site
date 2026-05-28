import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Pencil, Trash2, Save, X, ImagePlus } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = { name: '', description: '', image_url: '', slug: '', has_tabs: false }

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [editing, setEditing]       = useState(null)   // null | 'new' | row object
  const [form, setForm]             = useState(EMPTY)
  const [saving, setSaving]         = useState(false)
  const [imageFile, setImageFile]   = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      // Table may not exist yet — show empty state
      console.warn('Categories table not found:', error.message)
      setCategories([])
    } else {
      setCategories(data || [])
    }
    setLoading(false)
  }

  const openNew = () => {
    setForm(EMPTY)
    setImageFile(null)
    setImagePreview('')
    setEditing('new')
  }

  const openEdit = (cat) => {
    setForm({
      name:        cat.name        || '',
      description: cat.description || '',
      image_url:   cat.image_url   || '',
      slug:        cat.slug        || '',
      has_tabs:    cat.has_tabs    || false,
    })
    setImageFile(null)
    setImagePreview(cat.image_url || '')
    setEditing(cat)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleImagePick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const uploadImage = async () => {
    if (!imageFile) return form.image_url
    try {
      const ext  = imageFile.name.split('.').pop().toLowerCase()
      const path = `categories/${Date.now()}.${ext}`
      const { error } = await supabase.storage
        .from('product-images')
        .upload(path, imageFile, { cacheControl: '3600', upsert: true })
      if (error) {
        console.warn('Image upload failed (non-blocking):', error.message)
        return form.image_url  // fall back to URL field
      }
      return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
    } catch (err) {
      console.warn('Image upload exception (non-blocking):', err)
      return form.image_url
    }
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Category name is required'); return }
    if (!form.slug.trim()) { toast.error('Slug is required (e.g. pasupu, gifts, bags)'); return }
    setSaving(true)
    try {
      const imageUrl = await uploadImage()
      const payload  = { ...form, image_url: imageUrl }

      if (editing === 'new') {
        const { error } = await supabase.from('categories').insert([payload])
        if (error) throw error
        toast.success('Category created!')
      } else {
        const { error } = await supabase.from('categories').update(payload).eq('id', editing.id)
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">{editing === 'new' ? 'New Category' : 'Edit Category'}</h2>
            <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Pasupu-Kumkuma"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug * <span className="text-gray-400 font-normal">(URL key)</span></label>
              <input name="slug" value={form.slug} onChange={handleChange} placeholder="e.g. pasupu"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                placeholder="Short description shown on the category card"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL <span className="text-gray-400 font-normal">(or upload below)</span></label>
              <input name="image_url" value={form.image_url} onChange={handleChange} placeholder="https://..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
              <label className="flex items-center gap-2 cursor-pointer border border-dashed border-gray-300 rounded-xl px-3 py-2 hover:border-amber-400 transition-colors">
                <ImagePlus className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">{imageFile ? imageFile.name : 'Choose file'}</span>
                <input type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
              </label>
            </div>
            {imagePreview && (
              <div className="sm:col-span-2">
                <img src={imagePreview} alt="Preview" className="h-32 w-full object-cover rounded-xl border border-gray-100" />
              </div>
            )}
            <div className="sm:col-span-2 flex items-center gap-2">
              <input type="checkbox" id="has_tabs" name="has_tabs" checked={form.has_tabs} onChange={handleChange}
                className="w-4 h-4 accent-amber-500 rounded" />
              <label htmlFor="has_tabs" className="text-sm text-gray-700">Has Standard / Customization tabs</label>
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
          <p className="text-xs text-gray-400 mt-2">Make sure the <code className="bg-gray-100 px-1 rounded">categories</code> table exists in Supabase.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {cat.image_url && (
                <img src={cat.image_url} alt={cat.name} className="w-full h-36 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{cat.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">/{cat.slug}</p>
                    {cat.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description}</p>}
                    {cat.has_tabs && (
                      <span className="inline-block mt-2 text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                        Standard + Custom tabs
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => openEdit(cat)}
                      className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(cat)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
