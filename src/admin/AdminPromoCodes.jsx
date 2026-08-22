import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Pencil, Trash2, Save, X, Tag } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = {
  code: '', description: '', discount_type: 'percent', discount_value: '',
  min_order: '', max_discount: '', active: true, usage_limit: '', expiry_date: '',
  applicable_categories: []
}

export default function AdminPromoCodes() {
  const [promos, setPromos]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(EMPTY)
  const [saving, setSaving]       = useState(false)
  const [allCategories, setAllCategories] = useState([
    { slug: 'pasupu', name: 'Pasupu-Kumkuma' },
    { slug: 'gifts', name: 'Return Gifts' },
    { slug: 'bags', name: 'Return Bags' },
  ])

  useEffect(() => {
    fetchPromos()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data } = await supabase.from('categories').select('slug, name').order('created_at', { ascending: true })
      if (data && data.length > 0) setAllCategories(data)
    } catch { }
  }

  const fetchPromos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setPromos(data)
    setLoading(false)
  }

  const openNew  = () => { setForm(EMPTY); setEditing('new') }
  const openEdit = (p) => {
    setForm({
      code:                   p.code || '',
      description:            p.description || '',
      discount_type:          p.discount_type || 'percent',
      discount_value:         p.discount_value ?? '',
      min_order:              p.min_order ?? '',
      max_discount:           p.max_discount ?? '',
      active:                 p.active ?? true,
      usage_limit:            p.usage_limit ?? '',
      expiry_date:            p.expiry_date ? p.expiry_date.slice(0, 10) : '',
      applicable_categories:  Array.isArray(p.applicable_categories) ? p.applicable_categories : [],
    })
    setEditing(p)
  }

  const f = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const handleSave = async () => {
    if (!form.code.trim())          { toast.error('Code is required'); return }
    if (!form.discount_value)       { toast.error('Discount value is required'); return }
    setSaving(true)
    try {
      const payload = {
        code:                   form.code.trim().toUpperCase(),
        description:            form.description.trim() || null,
        discount_type:          form.discount_type,
        discount_value:         parseFloat(form.discount_value),
        min_order:              form.min_order !== '' ? parseFloat(form.min_order) : null,
        max_discount:           form.max_discount !== '' ? parseFloat(form.max_discount) : null,
        active:                 form.active,
        usage_limit:            form.usage_limit !== '' ? parseInt(form.usage_limit) : null,
        expiry_date:            form.expiry_date || null,
        applicable_categories:  form.applicable_categories.length > 0 ? form.applicable_categories : null,
      }
      if (editing === 'new') {
        const { error } = await supabase.from('promo_codes').insert([payload])
        if (error) throw error
        toast.success('Promo code created!')
      } else {
        const { error } = await supabase.from('promo_codes').update(payload).eq('id', editing.id)
        if (error) throw error
        toast.success('Promo code updated!')
      }
      setEditing(null)
      fetchPromos()
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    }
    setSaving(false)
  }

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete promo code "${p.code}"?`)) return
    const { error } = await supabase.from('promo_codes').delete().eq('id', p.id)
    if (error) { toast.error(error.message); return }
    toast.success('Deleted')
    fetchPromos()
  }

  const toggleActive = async (p) => {
    const { error } = await supabase.from('promo_codes').update({ active: !p.active }).eq('id', p.id)
    if (error) { toast.error(error.message); return }
    setPromos(prev => prev.map(x => x.id === p.id ? { ...x, active: !x.active } : x))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promo Codes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage discount codes for customers</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm shadow-sm">
          <Plus className="w-4 h-4" /> Add Promo Code
        </button>
      </div>

      {/* SQL setup hint removed — table already created */}


      {/* Form */}
      {editing && (
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">{editing === 'new' ? 'New Promo Code' : `Edit — ${editing.code}`}</h2>
            <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Code * <span className="text-gray-400 font-normal">(auto-uppercased)</span></label>
              <input name="code" value={form.code} onChange={f} placeholder="e.g. SAVE10"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 uppercase" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description <span className="text-gray-400 font-normal">(shown to customer)</span></label>
              <input name="description" value={form.description} onChange={f} placeholder="e.g. Get 10% off on all orders"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Discount Type *</label>
              <select name="discount_type" value={form.discount_type} onChange={f}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white">
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Discount Value * {form.discount_type === 'percent' ? '(%)' : '(₹)'}
              </label>
              <input name="discount_value" type="number" value={form.discount_value} onChange={f}
                placeholder={form.discount_type === 'percent' ? 'e.g. 10' : 'e.g. 50'}
                min="0" step={form.discount_type === 'percent' ? '1' : '1'}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Min Order Amount (₹) <span className="text-gray-400 font-normal">(optional)</span></label>
              <input name="min_order" type="number" value={form.min_order} onChange={f} placeholder="e.g. 200"
                min="0" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
            {form.discount_type === 'percent' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Max Discount (₹) <span className="text-gray-400 font-normal">(optional cap)</span></label>
                <input name="max_discount" type="number" value={form.max_discount} onChange={f} placeholder="e.g. 100"
                  min="0" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Usage Limit <span className="text-gray-400 font-normal">(optional — total uses)</span></label>
              <input name="usage_limit" type="number" value={form.usage_limit} onChange={f} placeholder="e.g. 100 (blank = unlimited)"
                min="1" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Expiry Date <span className="text-gray-400 font-normal">(optional)</span></label>
              <input name="expiry_date" type="date" value={form.expiry_date} onChange={f}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" id="active" name="active" checked={form.active} onChange={f}
                className="w-4 h-4 rounded accent-amber-500" />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">Active (visible to customers)</label>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Applicable Categories <span className="text-gray-400 font-normal">(leave all unchecked = applies to entire bill)</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {allCategories.map((cat) => (
                  <label key={cat.slug} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.applicable_categories.includes(cat.slug)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...form.applicable_categories, cat.slug]
                          : form.applicable_categories.filter(c => c !== cat.slug)
                        setForm(prev => ({ ...prev, applicable_categories: updated }))
                      }}
                      className="w-4 h-4 rounded accent-amber-500"
                    />
                    <span className="text-sm text-gray-700">{cat.name}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                If selected, discount applies only to items from those categories. If none selected, discount applies to the whole order.
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Promo Code'}
            </button>
            <button onClick={() => setEditing(null)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : promos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Tag className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-400 text-sm">No promo codes yet. Click "Add Promo Code" to create one.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Code</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Discount</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Min Order</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Usage</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Expiry</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Status</th>
                <th className="text-right px-5 py-3.5 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {promos.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-mono font-bold text-[#C8511B] bg-[#FDF3EC] px-2.5 py-1 rounded-lg text-xs">{p.code}</span>
                    {p.description && <p className="text-xs text-gray-400 mt-0.5">{p.description}</p>}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-gray-800">
                    {p.discount_type === 'percent'
                      ? `${p.discount_value}%${p.max_discount ? ` (max ₹${p.max_discount})` : ''}`
                      : `₹${p.discount_value}`}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">{p.min_order ? `₹${p.min_order}` : <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3.5 text-gray-600">
                    {p.usage_count || 0}{p.usage_limit ? `/${p.usage_limit}` : ''}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs">
                    {p.expiry_date ? new Date(p.expiry_date).toLocaleDateString('en-IN') : <span className="text-gray-300">No expiry</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => toggleActive(p)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {p.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
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
