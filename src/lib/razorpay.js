const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || ''

// Dynamically load Razorpay script
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload  = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/**
 * Open Razorpay checkout (client-only, no server-side order creation)
 * QR and all payment methods work without order_id for direct payments.
 */
export async function openRazorpay({ amount, orderId, name, email, phone, description, onSuccess, onFailure }) {
  const loaded = await loadRazorpayScript()
  if (!loaded) {
    alert('Razorpay failed to load. Check your internet connection.')
    onFailure?.('script_load_failed')
    return
  }

  const options = {
    key:         RAZORPAY_KEY_ID,
    amount:      Math.round(amount * 100), // ₹ to paise
    currency:    'INR',
    name:        'Shubham Traditions',
    description: description || 'Order Payment',
    image:       `${window.location.origin}/favicon.svg`,
    // ⚠️ Do NOT pass order_id unless created server-side via Razorpay API
    // Passing undefined or a fake ID breaks QR generation
    prefill: {
      name:    name  || '',
      email:   email || '',
      contact: phone || '',
    },
    notes: {
      internal_order_id: orderId || '',
    },
    theme: {
      color: '#f59e0b',
    },
    config: {
      display: {
        // Show all payment methods including UPI QR
        blocks: {
          utib: { name: 'Pay via UPI', instruments: [{ method: 'upi' }] },
          other: { name: 'Other Payment Methods', instruments: [
            { method: 'card' },
            { method: 'netbanking' },
            { method: 'wallet' },
          ]},
        },
        sequence: ['block.utib', 'block.other'],
        preferences: { show_default_blocks: false },
      },
    },
    handler: (response) => {
      // response.razorpay_payment_id is available here
      onSuccess?.(response)
    },
    modal: {
      ondismiss: () => {
        onFailure?.('dismissed')
      },
      animation: true,
    },
  }

  const rzp = new window.Razorpay(options)
  rzp.on('payment.failed', (response) => {
    onFailure?.(response.error?.description || 'Payment failed')
  })
  rzp.open()
}
