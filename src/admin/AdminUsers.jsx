import { useEffect, useState } from 'react'
import { Search, RefreshCw, User, ShoppingCart, Heart, ChevronRight, X, Package, IndianRupee } from 'lucide-react'
import { supabase } from '../lib/supabase'

const CAT_LABELS = { pasupu: 'Pasupu-Kumkuma', gifts: 'Return Gifts', bags: 'Return Bags' }

export default function AdminUsers() {
  const [users, setUsers]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDetail, setUserDetail]     = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [activeTab, setActiveTab]       = useState('wishlist')

  useEffect(() => { fetchUsers() }, [])

  // ── Fetch all users who have orders or wishlists ──────────────────────
  const fetchUsers = async () => {
    setLoading(true)
    try {
      // Get unique users from orders
      const { data: orders } = await supabase
        .from('orders')
        .select('user_id, user_name, phone, email, created_at')
        .not('user_id', 'is', null)
        .order('created_at', { ascending: false })

      // Get unique users from wishlists
      const { data: wishlists } = await supabase
        .from('wishlists')
        .select('user_id, created_at')
        .order('created_at', { ascending: false })

      // Get cart data
      const { data: carts } = await supabase
        .from('carts')
        .select('user_id, items')

      // Merge and deduplicate by user_id
      const userMap = {}

      if (orders) {
        orders.forEach((o) => {
          if (!o.user_id) return
          if (!userMap[o.user_id]) {
            userMap[o.user_id] = {
              user_id:      o.user_id,
              user_name:    o.user_name || 'Unknown',
              phone:        o.phone || '',
              email:        o.email || '',
              orderCount:   0,
              wishlistCount: 0,
              cartCount:    0,
            }
          }
          userMap[o.user_id].orderCount++
        })
      }

      if (wishlists) {
        wishlists.forEach((w) => {
          if (!w.user_id) return
          if (!userMap[w.user_id]) {
            userMap[w.user_id] = {
              user_id:      w.user_id,
              user_name:    'User',
              phone:        '',
              email:        '',
              orderCount:   0,
              wishlistCount: 0,
              cartCount:    0,
            }
          }
          userMap[w.user_id].wishlistCount++
        })
      }

      if (carts) {
        carts.forEach((c) => {
          if (!c.user_id) return
          const count = Array.isArray(c.items) ? c.items.reduce((s, i) => s + (i.quantity || 1), 0) : 0
          if (userMap[c.user_id]) {
            userMap[c.user_id].cartCount = count
          }
        })
      }

      setUsers(Object.values(userMap))
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  // ── Fetch wishlist + orders for a specific user ───────────────────────
  const fetchUserDetail = async (user) => {
    setSelectedUser(user)
    setDetailLoading(true)
    setUserDetail(null)

    try {
      const [wishlistRes, ordersRes, cartRes] = await Promise.all([
        supabase.from('wishlists').select('*').eq('user_id', user.user_id).order('created_at', { ascending: false }),
        supabase.from('orders').select('*').eq('user_id', user.user_id).order('created_at', { ascending: false }),
        supabase.from('carts').select('*').eq('user_id', user.user_id).single(),
      ])

      setUserDetail({
        wishlist: wishlistRes.data || [],
        orders:   ordersRes.data   || [],
        cart:     cartRes.data?.items || [],
        cartUpdatedAt: cartRes.data?.updated_at || null,
      })
    } catch (err) {
      console.error(err)
    }
    setDetailLoading(false)
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return !q || u.user_name?.toLowerCase().includes(q) || u.phone?.includes(q) || u.email?.toLowerCase().includes(q)
  })

  return (
    <div className="flex gap-6 h-full">

      {/* ── Left: User list ── */}
      <div className={`${selectedUser ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-80 shrink-0`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">User Activity</h1>
            <p className="text-gray-500 text-xs mt-0.5">{users.length} users tracked</p>
          </div>
          <button onClick={fetchUsers}
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white" />
        </div>

        {/* User cards */}
        <div className="space-y-2 overflow-y-auto flex-1">
          {loading ? (
            [1,2,3,4].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <User className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            filtered.map((u) => (
              <button key={u.user_id} onClick={() => { fetchUserDetail(u); setActiveTab('cart') }}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedUser?.user_id === u.user_id
                    ? 'bg-amber-50 border-amber-300 shadow-sm'
                    : 'bg-white border-gray-100 hover:border-amber-200 hover:bg-amber-50/50'
                }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <span className="text-amber-700 font-bold text-sm">
                      {(u.user_name || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{u.user_name}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email || u.phone || 'No contact'}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                </div>
                <div className="flex items-center gap-3 mt-2 ml-13">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <ShoppingCart className="w-3 h-3" /> {u.orderCount} orders
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Heart className="w-3 h-3 text-red-400" /> {u.wishlistCount} saved
                  </span>
                  {u.cartCount > 0 && (
                    <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                      🛒 {u.cartCount} in cart
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Right: User detail ── */}
      {selectedUser ? (
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => setSelectedUser(null)}
              className="lg:hidden p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50">
              <X className="w-4 h-4 text-gray-500" />
            </button>
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <span className="text-amber-700 font-bold text-lg">
                {(selectedUser.user_name || 'U')[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{selectedUser.user_name}</h2>
              <p className="text-sm text-gray-500">{selectedUser.email || selectedUser.phone}</p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
                {selectedUser.orderCount} orders
              </span>
              <span className="bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <Heart className="w-3 h-3 fill-current" /> {selectedUser.wishlistCount} saved
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-5">
            {[
              { key: 'cart',     label: '🛒 Cart',     count: userDetail?.cart?.length },
              { key: 'wishlist', label: '❤️ Wishlist', count: userDetail?.wishlist?.length },
              { key: 'orders',   label: '📦 Orders',   count: userDetail?.orders?.length },
            ].map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-300'
                }`}>
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {detailLoading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <>
              {/* ── Cart tab ── */}
              {activeTab === 'cart' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-sm">
                      Current Cart ({userDetail?.cart?.length || 0} items)
                    </h3>
                    {userDetail?.cartUpdatedAt && (
                      <span className="text-xs text-gray-400">
                        Last updated: {new Date(userDetail.cartUpdatedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  {!userDetail?.cart?.length ? (
                    <div className="text-center py-12 text-gray-400">
                      <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Cart is empty</p>
                    </div>
                  ) : (
                    <>
                      <div className="divide-y divide-gray-50">
                        {userDetail.cart.map((item, i) => (
                          <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-amber-50/30 transition-colors">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name}
                                className="w-14 h-14 rounded-xl object-cover shrink-0 bg-gray-100" />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                <Package className="w-6 h-6 text-gray-300" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                {item.selectedVariant && (
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                    {item.selectedVariant}
                                  </span>
                                )}
                                <span className="text-xs text-gray-400">Qty: {item.quantity}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-bold text-amber-600">₹{((item.price || 0) * item.quantity).toLocaleString()}</p>
                              <p className="text-xs text-gray-400">₹{item.price} each</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Cart total */}
                      <div className="px-5 py-4 bg-amber-50 border-t border-amber-100 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Total Items</p>
                          <p className="font-bold text-gray-900">
                            {userDetail.cart.reduce((s, i) => s + i.quantity, 0)} items
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Cart Value</p>
                          <p className="text-xl font-bold text-amber-600">
                            ₹{userDetail.cart.reduce((s, i) => s + (i.price || 0) * i.quantity, 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── Wishlist tab ── */}
              {activeTab === 'wishlist' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm">
                      Saved Products ({userDetail?.wishlist?.length || 0})
                    </h3>
                  </div>
                  {!userDetail?.wishlist?.length ? (
                    <div className="text-center py-12 text-gray-400">
                      <Heart className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No wishlist items</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {/* Group by category */}
                      {Object.entries(
                        userDetail.wishlist.reduce((acc, item) => {
                          const cat = item.product?.category || 'other'
                          if (!acc[cat]) acc[cat] = []
                          acc[cat].push(item)
                          return acc
                        }, {})
                      ).map(([cat, items]) => (
                        <div key={cat}>
                          <div className="px-5 py-2 bg-gray-50">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                              {CAT_LABELS[cat] || cat} ({items.length})
                            </span>
                          </div>
                          {items.map((item) => {
                            const p = item.product
                            return (
                              <div key={item.id} className="flex items-center gap-4 px-5 py-4 hover:bg-amber-50/30 transition-colors">
                                {p?.image_url ? (
                                  <img src={p.image_url} alt={p.name}
                                    className="w-14 h-14 rounded-xl object-cover shrink-0 bg-gray-100" />
                                ) : (
                                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                    <Package className="w-6 h-6 text-gray-300" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 text-sm truncate">{p?.name}</p>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {p?.type === 'customization' ? 'WhatsApp only'
                                      : p?.price ? `₹${p.price}` : ''}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    p?.type === 'customization'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {p?.type === 'customization' ? 'Custom' : 'Standard'}
                                  </span>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Orders tab ── */}
              {activeTab === 'orders' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm">
                      Order History ({userDetail?.orders?.length || 0})
                    </h3>
                  </div>
                  {!userDetail?.orders?.length ? (
                    <div className="text-center py-12 text-gray-400">
                      <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No orders yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {userDetail.orders.map((order) => (
                        <div key={order.id} className="px-5 py-4 hover:bg-amber-50/30 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-mono text-xs text-gray-400">
                                  #{order.id?.slice(0, 8)}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-700'
                                  : order.status === 'cancelled' ? 'bg-red-100 text-red-700'
                                  : order.status === 'shipped' ? 'bg-purple-100 text-purple-700'
                                  : order.status === 'confirmed' ? 'bg-blue-100 text-blue-700'
                                  : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {order.status}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  order.payment_status === 'paid' ? 'bg-green-100 text-green-700'
                                  : order.payment_status === 'rejected' ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {order.payment_method === 'upi' ? '📱' : '🚚'} {order.payment_status || 'pending'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400">
                                {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                {' · '}{Array.isArray(order.items) ? order.items.length : 0} item(s)
                                {' · '}{order.address}
                              </p>
                            </div>
                            <span className="font-bold text-amber-600 shrink-0">
                              ₹{order.total_price?.toLocaleString()}
                            </span>
                          </div>
                          {/* Items preview */}
                          {Array.isArray(order.items) && order.items.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {order.items.map((item, i) => (
                                <span key={i} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">
                                  {item.name} ×{item.quantity}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center text-gray-300 flex-col gap-3">
          <User className="w-16 h-16 opacity-20" />
          <p className="text-sm">Select a user to view their activity</p>
        </div>
      )}
    </div>
  )
}
