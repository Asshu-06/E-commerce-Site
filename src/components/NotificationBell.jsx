import { useState, useEffect, useRef } from 'react'
import { Bell, X, CheckCheck, ShoppingBag } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { markRead, markAllRead } from '../lib/notifications'
import { useNavigate } from 'react-router-dom'

const TYPE_COLORS = {
  success: 'bg-green-100 text-green-700',
  error:   'bg-red-100 text-red-700',
  warning: 'bg-orange-100 text-orange-700',
  info:    'bg-blue-100 text-blue-700',
  order:   'bg-amber-100 text-amber-700',
  payment: 'bg-purple-100 text-purple-700',
  cancel:  'bg-red-100 text-red-700',
}

export default function NotificationBell({ userId, forAdmin = false, transparent = false }) {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen]                   = useState(false)
  const ref                               = useRef(null)
  const navigate                          = useNavigate()

  const unread = notifications.filter(n => !n.is_read).length

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30)

      if (forAdmin) {
        query = query.eq('for_admin', true)
      } else {
        query = query.eq('user_id', userId)
      }

      const { data } = await query
      if (data) setNotifications(data)
    } catch { }
  }

  useEffect(() => {
    if (!userId && !forAdmin) return
    fetchNotifications()

    // Real-time subscription
    const channel = supabase
      .channel(`notifications-${forAdmin ? 'admin' : userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: forAdmin ? 'for_admin=eq.true' : `user_id=eq.${userId}`,
      }, () => {
        fetchNotifications()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [userId, forAdmin])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleClick = async (n) => {
    if (!n.is_read) {
      await markRead(n.id)
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x))
    }
    setOpen(false)
    if (n.order_id) {
      if (forAdmin) navigate(`/admin/orders/${n.order_id}`)
      else navigate('/profile')
    }
  }

  const handleMarkAll = async () => {
    await markAllRead({ userId, forAdmin })
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const timeAgo = (ts) => {
    const diff = Date.now() - new Date(ts).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`relative p-2.5 rounded-xl transition-all duration-200 ${
          transparent ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-600'
        }`}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-bold text-gray-900 text-sm">
              Notifications {unread > 0 && <span className="ml-1 bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full">{unread}</span>}
            </span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={handleMarkAll} className="text-xs text-[#C8511B] hover:underline flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                    !n.is_read ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded-lg mt-0.5 ${TYPE_COLORS[n.type] || 'bg-gray-100 text-gray-600'}`}>
                    {n.type === 'order' ? '🛒' : n.type === 'payment' ? '💳' : n.type === 'cancel' ? '❌' : n.type === 'success' ? '✅' : n.type === 'error' ? '🚫' : 'ℹ️'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold text-gray-900 ${!n.is_read ? 'font-bold' : ''}`}>{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
