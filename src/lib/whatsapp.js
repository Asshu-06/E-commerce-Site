const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE || '918639006849'

/**
 * Opens WhatsApp with a pre-filled message for customization enquiry.
 * @param {string} productName - The name of the customization design
 */
export function sendToWhatsApp(productName) {
  const message = `Hello, I am interested in customization design: ${productName}`
  const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

/**
 * Opens WhatsApp for a general order enquiry.
 * @param {string} message - Custom message
 */
export function sendOrderToWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}
