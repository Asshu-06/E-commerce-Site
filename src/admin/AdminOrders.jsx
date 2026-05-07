import { useEffect, useState } from 'react'
import { Search, RefreshCw, ChevronDown, X, Eye } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  shipped:   'bg-purple-100 text-purple-700 border-purple-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) setOrders(data)
    } catch { /* Supabase not configured */ }
    setLoading(false)
  }

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
      if (error) throw error
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o))
      if (selectedOrder?.id === orderId) setSelectedOrder((o) => ({ ...o, status: newStatus }))
      toast.success(`Order marked as ${newStatus}`)
    } catch (err) {
      toast.error(err.message || 'Failed to update status')
    }
    setUpdatingId(null)
  }

  const filtered = orders.filter((o) => {
    const matchSearch = !search.trim() ||
      o.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.phone?.includes(search) ||
      o.id?.toString().includes(search)
    const matchStatus = filterStatus === 'all' || o.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} total orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, order ID..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white text-gray-700 capitalize"
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      {/* Status summary pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {STATUS_OPTIONS.map((s) => {
          const count = orders.filter((o) => o.status === s).length
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors capitalize ${
                filterStatus === s ? STATUS_COLORS[s] : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {s} ({count})
            </button>
          )
        })}
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 text-gray-400">
            <p className="text-sm">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Customer</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Date</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Amount</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Status</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{order.user_name}</p>
                      <p className="text-xs text-gray-400">{order.phone}</p>
                    </td>
                    <td className="px-4 py-4 text-gray-500 text-xs">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-900">
                      ₹{order.total_price?.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative inline-block">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className={`appearance-none pl-3 pr-7 py-1.5 rounded-full text-xs font-medium border cursor-pointer focus:outline-none capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s} className="capitalize bg-white text-gray-800">{s}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
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

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Customer info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name</span>
                  <span className="font-medium text-gray-900">{selectedOrder.user_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium text-gray-900">{selectedOrder.phone}</span>
                </div>
                {selectedOrder.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-gray-900">{selectedOrder.email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Address</span>
                  <span className="font-medium text-gray-900 text-right max-w-[60%]">{selectedOrder.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment</span>
                  <span className="font-medium text-gray-900 uppercase text-xs">{selectedOrder.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium text-gray-900">
                    {new Date(selectedOrder.created_at).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Items Ordered</h3>
                <div className="space-y-2">
                  {(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-amber-50 rounded-xl px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        {item.variant && <p className="text-xs text-gray-500">{item.variant} · Qty: {item.quantity}</p>}
                      </div>
                      <span className="font-semibold text-amber-700">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total + status */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Total Amount</p>
                  <p className="text-xl font-bold text-amber-600">₹{selectedOrder.total_price?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Update Status</p>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                    disabled={updatingId === selectedOrder.id}
                    className={`pl-3 pr-7 py-1.5 rounded-full text-xs font-medium border cursor-pointer focus:outline-none capitalize ${STATUS_COLORS[selectedOrder.status]}`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s} className="capitalize bg-white text-gray-800">{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
