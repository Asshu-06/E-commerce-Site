import { useEffect, useState, useRef } from 'react'
import { Plus, Pencil, Trash2, X, Save, ImagePlus, Package, Search, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { mockProducts } from '../lib/mockData'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  name: '', category: 'pasupu', type: 'standard',
  price: '', unit: 'set', description: '', image_url: '', variants: '',
}
const CAT_LABELS = { pasupu: 'Pasupu-Kumkuma', gifts: 'Return Gifts', bags: 'Return Bags' }
const CATEGORIES  = ['pasupu', 'gifts', 'bags']

async function uploadToSupabase(file) {
  const ext      = file.name.split('.').pop().toLowerCase()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const path     = `products/${fileName}`
  const { error } = await supabase.storage.from('product-images').upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
}

function fileToDataUrl(file) {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload  = () => res(r.result)
    r.onerror = rej
    r.readAsDataURL(file)
  })
}

export default function AdminProducts() {
  const [products,        setProducts]        = useState([])
  const [dbConnected,     setDbConnected]     = useState(false)
  const [storageReady,    setStorageReady]    = useState(false)
  const [loading,         setLoading]         = useState(true)
  const [showModal,       setShowModal]       = useState(false)
  const [editProduct,     setEditProduct]     = useState(null)
  const [form,            setForm]            = useState(EMPTY_FORM)
  const [saving,          setSaving]          = useState(false)
  const [uploadProgress,  setUploadProgress]  = useState('')
  const [imageFile,       setImageFile]       = useState(null)
  const [imagePreview,    setImagePreview]    = useState('')
  const [deleteTarget,    setDeleteTarget]    = useState(null)
  const [deleting,        setDeleting]        = useState(false)
  const [filterCat,       setFilterCat]       = useState('all')
  const [search,          setSearch]          = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => { init() }, [])

  const init = async () => {
    setLoading(true)
    await fetchProducts()
    await checkStorage()
    setLoading(false)
  }

  // ── Fetch: Supabase rows + mock rows that aren't in Supabase yet ──────────
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        // Keep mock products that haven't been migrated to Supabase
        const dbIds   = new Set(data.map((p) => String(p.id)))
        const mocks   = mockProducts.filter((p) => !dbIds.has(String(p.id)))
        setProducts([...data, ...mocks])
        setDbConnected(true)
        return
      }
    } catch { /* fall through */ }

    // Supabase unavailable — show mock only
    setProducts(mockProducts)
    setDbConnected(false)
  }

  const checkStorage = async () => {
    try {
      const { error } = await supabase.storage.from('product-images').list('products', { limit: 1 })
      setStorageReady(!error)
    } catch { setStorageReady(false) }
  }

  // ── Open Add ──────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditProduct(null)
    setForm(EMPTY_FORM)
    setImageFile(null)
    setImagePreview('')
    setUploadProgress('')
    setShowModal(true)
  }

  // ── Open Edit ─────────────────────────────────────────────────────────────
  const openEdit = (p) => {
    setEditProduct(p)
    setForm({
      name:        p.name        || '',
      category:    p.category    || 'pasupu',
      type:        p.type        || 'standard',
      price:       p.price       ?? '',
      unit:        p.unit        || 'set',
      description: p.description || '',
      image_url:   p.image_url   || '',   // kept for save logic
      variants:    Array.isArray(p.variants) ? p.variants.join(', ') : (p.variants || ''),
    })
    setImageFile(null)
    setImagePreview(p.image_url || '')   // show existing image immediately
    setUploadProgress('')
    setShowModal(true)
  }

  // ── Image file picked ─────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/'))    { toast.error('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024)       { toast.error('Image must be under 5MB');     return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    // clear manual URL since we have a file now
    setForm((f) => ({ ...f, image_url: '' }))
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Product name is required'); return }
    setSaving(true)
    setUploadProgress('')

    try {
      // Determine final image URL
      // Priority: new file upload > manual URL input > existing product image
      let finalImageUrl = form.image_url.trim() || editProduct?.image_url || ''

      if (imageFile) {
        if (storageReady) {
          setUploadProgress('Uploading image...')
          try {
            finalImageUrl = await uploadToSupabase(imageFile)
          } catch (err) {
            console.warn('Storage upload failed, using base64:', err)
            setUploadProgress('Using local image...')
            finalImageUrl = await fileToDataUrl(imageFile)
          }
        } else {
          setUploadProgress('Converting image...')
          finalImageUrl = await fileToDataUrl(imageFile)
        }
      }

      const payload = {
        name:        form.name.trim(),
        category:    form.category,
        type:        form.type,
        price:       form.price !== '' ? parseFloat(form.price) : null,
        unit:        form.unit.trim()        || null,
        description: form.description.trim() || null,
        image_url:   finalImageUrl           || null,
        variants:    form.variants
          ? form.variants.split(',').map((v) => v.trim()).filter(Boolean)
          : [],
      }

      setUploadProgress(editProduct ? 'Updating...' : 'Saving...')

      if (editProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', editProduct.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('products').insert([payload])
        if (error) throw error
      }

      toast.success(editProduct ? 'Product updated!' : 'Product added!')
      setShowModal(false)
      await fetchProducts()   // refresh list
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to save product')
    } finally {
      setSaving(false)
      setUploadProgress('')
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const { error } = await supabase.from('products').delete().eq('id', deleteTarget.id)
      if (error) throw error
      toast.success(`"${deleteTarget.name}" deleted`)
      setDeleteTarget(null)
      await fetchProducts()
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    }
    setDeleting(false)
  }

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = products.filter((p) => {
    const matchCat    = filterCat === 'all' || p.category === filterCat
    const matchSearch = !search.trim() || p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} total products</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm shadow-sm">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Banners */}
      {!dbConnected && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-sm text-red-800">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          Supabase not connected — showing mock data only.
        </div>
      )}
      {dbConnected && !storageReady && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-sm text-blue-800">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          Storage bucket <strong>product-images</strong> not found — images stored as base64.
          Create it in Supabase → Storage for cloud hosting.
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', ...CATEGORIES].map((cat) => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filterCat === cat ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-300'
              }`}>
              {cat === 'all' ? 'All' : CAT_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Product</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Category</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Type</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Price</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover shrink-0 bg-gray-100"
                            onError={(e) => { e.target.style.display = 'none' }} />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-gray-300" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900 line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{CAT_LABELS[p.category] || p.category}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        p.type === 'standard' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>{p.type}</span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-900">
                      {p.price ? `₹${p.price}` : <span className="text-gray-400 text-xs">WhatsApp only</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)}
                          className="p-2 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(p)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-14 text-gray-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No products found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-gray-900 text-lg">{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">

              {/* Image upload area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                <div onClick={() => fileInputRef.current?.click()}
                  className="relative w-full h-44 rounded-xl border-2 border-dashed border-gray-200 hover:border-amber-400 bg-gray-50 hover:bg-amber-50 transition-all cursor-pointer overflow-hidden group">
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-medium flex items-center gap-2">
                          <ImagePlus className="w-5 h-5" /> Change Image
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400 group-hover:text-amber-500 transition-colors">
                      <ImagePlus className="w-10 h-10" />
                      <p className="text-sm font-medium">Click to upload image</p>
                      <p className="text-xs">PNG, JPG, WEBP — max 5MB</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

                {uploadProgress && (
                  <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1.5">
                    <span className="w-3 h-3 border border-amber-400 border-t-amber-600 rounded-full animate-spin" />
                    {uploadProgress}
                  </p>
                )}

                {/* URL input — only show when no image selected/previewed */}
                {!imagePreview && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 mb-1">Or paste image URL</p>
                    {/* type="text" so local paths like /images/... are accepted */}
                    <input
                      type="text"
                      value={form.image_url}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, image_url: e.target.value }))
                        if (e.target.value) setImagePreview(e.target.value)
                      }}
                      placeholder="/images/photo.jpg or https://..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  </div>
                )}

                {/* Show clear button if image is set */}
                {imagePreview && (
                  <button type="button"
                    onClick={() => { setImagePreview(''); setImageFile(null); setForm((f) => ({ ...f, image_url: '' })) }}
                    className="mt-2 text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                    <X className="w-3 h-3" /> Remove image
                  </button>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Product Name <span className="text-red-400">*</span>
                </label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Classic Pasupu Kumkuma Set" required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
              </div>

              {/* Category + Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category <span className="text-red-400">*</span></label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white">
                    <option value="pasupu">Pasupu-Kumkuma</option>
                    <option value="gifts">Return Gifts</option>
                    <option value="bags">Return Bags</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Type <span className="text-red-400">*</span></label>
                  <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white">
                    <option value="standard">Standard (Add to Cart)</option>
                    <option value="customization">Customization (WhatsApp)</option>
                  </select>
                </div>
              </div>

              {/* Price + Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Price (₹) {form.type === 'customization' && <span className="text-gray-400 font-normal text-xs">(optional)</span>}
                  </label>
                  <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="e.g. 150" min="0" step="0.01"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit</label>
                  <input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                    placeholder="set, piece, pack"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                </div>
              </div>

              {/* Variants */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Variants <span className="text-gray-400 font-normal text-xs">(comma separated)</span>
                </label>
                <input value={form.variants} onChange={(e) => setForm((f) => ({ ...f, variants: e.target.value }))}
                  placeholder="Small, Medium, Large"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short product description..." rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none" />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                  {saving ? (
                    <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{uploadProgress || 'Saving...'}</>
                  ) : (
                    <><Save className="w-4 h-4" />{editProduct ? 'Update Product' : 'Add Product'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Custom Delete Confirm Modal ──────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Delete Product</h3>
                <p className="text-sm text-gray-500">This cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-3 mb-5">
              Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                {deleting
                  ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <Trash2 className="w-4 h-4" />}
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
