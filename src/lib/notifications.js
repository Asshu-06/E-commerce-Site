import { supabase } from './supabase'

// ── Core insert ────────────────────────────────────────────────────────────
async function insert(payload) {
  try {
    await supabase.from('notifications').insert([payload])
  } catch (err) {
    console.warn('Notification insert failed:', err)
  }
}

// ── Admin notifications ────────────────────────────────────────────────────
export const notifyAdmin = {
  newOrder: (order) => insert({
    for_admin: true, user_id: null,
    type: 'order', title: '🛒 New Order Received',
    message: `${order.user_name} placed an order of ₹${order.total_price}`,
    order_id: order.id, is_read: false,
  }),
  paymentUploaded: (order) => insert({
    for_admin: true, user_id: null,
    type: 'payment', title: '📸 Payment Screenshot Uploaded',
    message: `${order.user_name} uploaded a payment screenshot for ₹${order.total_price}`,
    order_id: order.id, is_read: false,
  }),
  orderCancelled: (order) => insert({
    for_admin: true, user_id: null,
    type: 'cancel', title: '❌ Order Cancelled by Customer',
    message: `${order.user_name} cancelled order ₹${order.total_price}. Reason: ${order.cancel_reason || 'Not provided'}`,
    order_id: order.id, is_read: false,
  }),
}

// ── User notifications ─────────────────────────────────────────────────────
export const notifyUser = {
  orderConfirmed: (userId, order) => insert({
    for_admin: false, user_id: userId,
    type: 'success', title: '✅ Order Confirmed',
    message: `Your order of ₹${order.total_price} has been confirmed! We'll ship it soon.`,
    order_id: order.id, is_read: false,
  }),
  orderShipped: (userId, order) => insert({
    for_admin: false, user_id: userId,
    type: 'info', title: '🚚 Order Shipped',
    message: `Your order of ₹${order.total_price} has been shipped and is on its way!`,
    order_id: order.id, is_read: false,
  }),
  orderDelivered: (userId, order) => insert({
    for_admin: false, user_id: userId,
    type: 'success', title: '📦 Order Delivered',
    message: `Your order of ₹${order.total_price} has been delivered. Enjoy!`,
    order_id: order.id, is_read: false,
  }),
  paymentRejected: (userId, order) => insert({
    for_admin: false, user_id: userId,
    type: 'error', title: '❌ Payment Rejected',
    message: `Your payment for order ₹${order.total_price} was rejected. Reason: ${order.rejection_reason || 'Contact support'}`,
    order_id: order.id, is_read: false,
  }),
  refundInitiated: (userId, order) => insert({
    for_admin: false, user_id: userId,
    type: 'info', title: '💸 Refund Initiated',
    message: `A refund of ₹${order.total_price} has been initiated for your cancelled order. Expected in 3-5 business days.`,
    order_id: order.id, is_read: false,
  }),
  refundCompleted: (userId, order) => insert({
    for_admin: false, user_id: userId,
    type: 'success', title: '✅ Refund Completed',
    message: `Your refund of ₹${order.total_price} has been processed successfully.`,
    order_id: order.id, is_read: false,
  }),
}

// ── Mark read ──────────────────────────────────────────────────────────────
export async function markRead(id) {
  await supabase.from('notifications').update({ is_read: true }).eq('id', id)
}

export async function markAllRead({ userId, forAdmin }) {
  if (forAdmin) {
    await supabase.from('notifications').update({ is_read: true }).eq('for_admin', true)
  } else {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId)
  }
}
