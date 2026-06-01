import { supabase } from './supabase'

/**
 * Deduct stock for all items in an order.
 * Silently skips items where stock_quantity is null (no stock tracking).
 */
export async function deductStock(orderItems) {
  if (!Array.isArray(orderItems) || orderItems.length === 0) return

  for (const item of orderItems) {
    if (!item.id || !item.quantity) continue
    try {
      // Fetch current stock
      const { data: product, error } = await supabase
        .from('products')
        .select('id, stock_quantity')
        .eq('id', String(item.id))
        .single()

      if (error || !product || product.stock_quantity == null) continue

      const newStock = Math.max(0, product.stock_quantity - item.quantity)
      await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', String(item.id))
    } catch (err) {
      console.warn(`Stock deduction failed for product ${item.id}:`, err)
    }
  }
}
