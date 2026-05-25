// ── Shipping logic ────────────────────────────────────────────────────────
// Min order: 20 pieces
// Flat PAN India shipping tiers based on total quantity:
//   ≤100  → ₹80
//   ≤200  → ₹150
//   ≤300  → ₹200
//   ≤400  → ₹250
//   +100 more pieces → +₹50 each tier

export const MIN_ORDER_QTY = 20

/**
 * Calculate shipping charge based on total quantity.
 * Same rate applies PAN India.
 * @param {number} totalQty - total number of pieces ordered
 * @returns {number} shipping charge in ₹
 */
export function calcShipping(totalQty) {
  if (totalQty <= 0) return 0

  const tiers = [
    { max: 100, charge: 80  },
    { max: 200, charge: 150 },
    { max: 300, charge: 200 },
    { max: 400, charge: 250 },
  ]

  for (const tier of tiers) {
    if (totalQty <= tier.max) return tier.charge
  }

  // Beyond 400: each additional 100 pieces adds ₹50
  const extra = Math.ceil((totalQty - 400) / 100)
  return 250 + extra * 50
}

/**
 * Get a human-readable shipping tier label.
 */
export function shippingTierLabel(totalQty) {
  return `₹${calcShipping(totalQty)} (PAN India)`
}

// Kept for backward compatibility — no longer affects shipping rate
export function isAPTS(city = '', address = '') {
  return true
}
