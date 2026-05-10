// ── Shipping logic ────────────────────────────────────────────────────────
// Min order: 20 pieces
// Shipping tiers based on total quantity:
//   ≤100  → AP/TS: ₹80,  Others: ₹100
//   ≤200  → AP/TS: ₹150, Others: ₹170
//   ≤300  → AP/TS: ₹200, Others: ₹220
//   ≤400  → AP/TS: ₹250, Others: ₹270
//   +100 more pieces → +₹50 each tier

export const MIN_ORDER_QTY = 20

// AP & Telangana city/address keywords
const AP_TS_KEYWORDS = [
  'andhra', 'telangana', 'ap', 'ts',
  'hyderabad', 'vijayawada', 'visakhapatnam', 'vizag', 'warangal',
  'tirupati', 'guntur', 'nellore', 'kurnool', 'kadapa', 'anantapur',
  'karimnagar', 'nizamabad', 'khammam', 'rajahmundry', 'eluru',
  'ongole', 'srikakulam', 'vizianagaram', 'bhimavaram', 'tenali',
  'machilipatnam', 'adilabad', 'mahabubnagar', 'medak', 'nalgonda',
  'sangareddy', 'suryapet', 'skota', 'vsp', 'hyd', 'sec', 'secunderabad',
]

export function isAPTS(city = '', address = '') {
  const text = (city + ' ' + address).toLowerCase()
  return AP_TS_KEYWORDS.some((k) => text.includes(k))
}

/**
 * Calculate shipping charge based on total quantity and location.
 * @param {number} totalQty  - total number of pieces ordered
 * @param {boolean} apTs     - true if AP or Telangana
 * @returns {number} shipping charge in ₹
 */
export function calcShipping(totalQty, apTs) {
  if (totalQty <= 0) return 0

  // Base tiers: every 100 pieces adds ₹50 to both AP/TS and Others
  // Tier 1: 1–100   → 80 / 100
  // Tier 2: 101–200 → 130 / 150  (but spec says 150/170, so base is 150/170)
  // Using spec values directly:
  const tiers = [
    { max: 100,  apTs: 80,  other: 100 },
    { max: 200,  apTs: 150, other: 170 },
    { max: 300,  apTs: 200, other: 220 },
    { max: 400,  apTs: 250, other: 270 },
  ]

  for (const tier of tiers) {
    if (totalQty <= tier.max) {
      return apTs ? tier.apTs : tier.other
    }
  }

  // Beyond 400: each additional 100 pieces adds ₹50
  const extra = Math.ceil((totalQty - 400) / 100)
  const base  = apTs ? 250 : 270
  return base + extra * 50
}

/**
 * Get a human-readable shipping tier label.
 */
export function shippingTierLabel(totalQty, apTs) {
  const charge = calcShipping(totalQty, apTs)
  return `₹${charge} (${apTs ? 'AP/TS' : 'Other state'})`
}
