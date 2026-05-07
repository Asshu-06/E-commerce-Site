import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Package, IndianRupee, Clock, TrendingUp, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { mockProducts } from '../lib/mockData'

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped:   'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function Dashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      if (!error && data) setOrders(data)
    } catch {
      // Supabase not configured yet
    }
    setLoading(false)
  }

  const totalRevenue = orders.reduce((s, o) => s + (o.total_price || 0), 0)
  const pendingCount = orders.filter((o) => o.status === 'pending').length
  const productCount = mockProducts.filter((p) => p.type === 'standard').length

  const stats = [
    {
      label: 'Total Orders',
      value: orders.length,
      icon: <ShoppingBag className="w-6 h-6 text-amber-500" />,
      bg: 'bg-amber-50',
    },
    {
      label: 'Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: <IndianRupee className="w-6 h-6 text-green-500" />,
      bg: 'bg-green-50',
    },
    {
      label: 'Pending Orders',
      value: pendingCount,
      icon: <Clock className="w-6 h-6 text-orange-500" />,
      bg: 'bg-orange-50',
    },
    {
      label: 'Products',
      value: productCount,
      icon: <Package className="w-6 h-6 text-purple-500" />,
      bg: 'bg-purple-50',
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            Recent Orders
          </h2>
          <Link
            to="/admin/orders"
            className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No orders yet</p>
            <p className="text-xs mt-1">Orders will appear here once customers start purchasing.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{order.user_name}</p>
                  <p className="text-xs text-gray-400">{order.phone} · {new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900 text-sm">₹{order.total_price?.toLocaleString()}</span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
