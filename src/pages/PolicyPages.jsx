import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

const PHONE   = '+91 799 706 0668'
const EMAIL   = 'Lakshmiramcollections@gmail.com'
const WHATSAPP = '917997060668'

function PolicyLayout({ title, children }) {
  return (
    <div className="min-h-screen pt-20 pb-16 bg-[#FAF7F2]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#C8511B]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium">{title}</span>
        </nav>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">{title}</h1>
          <div className="prose prose-sm max-w-none text-gray-600 space-y-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ContactPage() {
  return (
    <PolicyLayout title="Contact Us">
      <p>We'd love to hear from you! Reach out to us through any of the channels below.</p>
      <div className="space-y-4 not-prose">
        <div className="bg-[#FDF3EC] rounded-2xl p-5 border border-[#FAE3D3]">
          <p className="font-semibold text-gray-900 mb-1">📞 Phone</p>
          <a href={`tel:${PHONE.replace(/\s/g,'')}`} className="text-[#C8511B] font-medium hover:underline">{PHONE}</a>
        </div>
        <div className="bg-[#FDF3EC] rounded-2xl p-5 border border-[#FAE3D3]">
          <p className="font-semibold text-gray-900 mb-1">✉️ Email</p>
          <a href={`mailto:${EMAIL}`} className="text-[#C8511B] font-medium hover:underline break-all">{EMAIL}</a>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200">
          <p className="font-semibold text-gray-900 mb-1">💬 WhatsApp</p>
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer"
            className="text-emerald-600 font-medium hover:underline">Chat on WhatsApp →</a>
        </div>
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
          <p className="font-semibold text-gray-900 mb-1">📍 Address</p>
          <p className="text-gray-600 text-sm">Gothic Pentagon Clouds, beside Pista House,<br />Bachupally, Hyderabad, Telangana</p>
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-4">We typically respond within 1–2 hours on WhatsApp.</p>
    </PolicyLayout>
  )
}

export function ShippingPolicyPage() {
  return (
    <PolicyLayout title="Shipping Policy">
      <p>We ship PAN India. All orders are processed within 1–2 business days after payment confirmation.</p>

      <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Shipping Charges</h2>
      <div className="not-prose overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
          <thead className="bg-[#FDF3EC]">
            <tr>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-700">Order Quantity</th>
              <th className="text-right px-4 py-2.5 font-semibold text-gray-700">Shipping Charge</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              ['≤ 100 pcs', '₹80'],
              ['≤ 200 pcs', '₹150'],
              ['≤ 300 pcs', '₹200'],
              ['≤ 400 pcs', '₹250'],
              ['400+ pcs',  '+₹50 per 100 pcs'],
            ].map(([qty, charge]) => (
              <tr key={qty} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 text-gray-600">{qty}</td>
                <td className="px-4 py-2.5 text-right font-semibold text-[#C8511B]">{charge}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Minimum Order</h2>
      <p>Minimum order quantity is <strong>20 pieces</strong> per order.</p>

      <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Delivery Time</h2>
      <p>Orders are typically delivered within <strong>5–7 business days</strong> after dispatch. Remote areas may take longer.</p>

      <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Tracking</h2>
      <p>Once your order is shipped, we will share the tracking details via WhatsApp or email.</p>

      <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">International Orders</h2>
      <p>For international orders, please contact us on WhatsApp at <strong>{PHONE}</strong> for a custom shipping quote.</p>
    </PolicyLayout>
  )
}

export function RefundPolicyPage() {
  return (
    <PolicyLayout title="Refund Policy">
      <p>We want you to be completely satisfied with your purchase. Please read our refund policy carefully.</p>

      <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Eligibility for Refund</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>Items must be reported within <strong>48 hours</strong> of delivery.</li>
        <li>Products must be unused and in original packaging.</li>
        <li>Damaged or defective items are eligible for full refund or replacement.</li>
      </ul>

      <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Non-Refundable Items</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>Customized / personalized orders cannot be returned.</li>
        <li>Items damaged due to misuse or improper handling.</li>
        <li>Orders where incorrect address was provided by the customer.</li>
      </ul>

      <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Refund Process</h2>
      <ol className="list-decimal list-inside space-y-1">
        <li>Contact us on WhatsApp with your order ID and photos of the issue.</li>
        <li>Our team will review within 24 hours.</li>
        <li>Approved refunds are processed within <strong>5–7 business days</strong> to your original payment method.</li>
      </ol>

      <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Contact for Refunds</h2>
      <p>WhatsApp: <a href={`https://wa.me/${WHATSAPP}`} className="text-[#C8511B] hover:underline" target="_blank" rel="noopener noreferrer">{PHONE}</a></p>
      <p>Email: <a href={`mailto:${EMAIL}`} className="text-[#C8511B] hover:underline">{EMAIL}</a></p>
    </PolicyLayout>
  )
}

export function PrivacyPolicyPage() {
  return (
    <PolicyLayout title="Privacy Policy">
      <p>At Lakshmi Ram Collections, we are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information.</p>

      <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Information We Collect</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>Name, phone number, and email address when you place an order.</li>
        <li>Delivery address for shipping purposes.</li>
        <li>Payment confirmation screenshots (stored securely).</li>
        <li>Usage data such as pages visited (via analytics).</li>
      </ul>

      <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">How We Use Your Information</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>To process and deliver your orders.</li>
        <li>To contact you about your order status.</li>
        <li>To improve our products and services.</li>
        <li>We do <strong>not</strong> sell or share your data with third parties.</li>
      </ul>

      <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Data Security</h2>
      <p>Your data is stored securely using Supabase infrastructure with industry-standard encryption. Payment screenshots are stored in a private, access-controlled storage bucket.</p>

      <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Cookies</h2>
      <p>We use minimal cookies for authentication and session management only. No advertising or tracking cookies are used.</p>

      <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Your Rights</h2>
      <p>You may request deletion of your account and associated data by contacting us at <a href={`mailto:${EMAIL}`} className="text-[#C8511B] hover:underline">{EMAIL}</a>.</p>

      <h2 className="text-lg font-bold text-gray-900 mt-6 mb-2">Contact</h2>
      <p>For any privacy concerns, reach us at <a href={`mailto:${EMAIL}`} className="text-[#C8511B] hover:underline">{EMAIL}</a>.</p>

      <p className="text-xs text-gray-400 mt-6">Last updated: May 2026</p>
    </PolicyLayout>
  )
}
