export const LEGAL_PAGE_KEYS = {
  terms: 'legal-terms',
  privacy: 'legal-privacy',
  shipping: 'legal-shipping',
  refund: 'legal-refund',
  return: 'legal-return',
}

export const DEFAULT_LEGAL_CONTENT = {
  terms: {
    title: 'Terms and Conditions',
    updated: '2026-09-19',
    body: `<h2>1. Introduction</h2><p>Welcome to Apna Packaging Solution. These Terms and Conditions govern your use of our website and the purchase of products from us. By accessing our site and placing an order, you agree to be bound by these terms.</p><h2>2. Products and Pricing</h2><p>We strive to ensure that all product descriptions and prices are accurate. However, errors may occur. We reserve the right to correct any errors and to change prices at any time without notice.</p><h2>3. Orders</h2><p>Order confirmation does not signify acceptance. We reserve the right at any time after receipt of your order to accept or decline it for any reason.</p><h2>4. Intellectual Property</h2><p>All content on this site, including text, graphics, logos and images, is the property of Apna Packaging Solution or its content suppliers.</p><h2>5. Limitation of Liability</h2><p>Apna Packaging Solution shall not be liable for any damages that result from the use of, or the inability to use, the materials on this site or the performance of the products.</p><h2>6. Governing Law</h2><p>These terms are governed by the laws of India.</p>`,
  },
  privacy: {
    title: 'Privacy Policy',
    updated: '2026-09-19',
    body: `<h2>1. Information We Collect</h2><p>We collect information you provide directly to us, such as when you create an account, place an order, subscribe to our newsletter, or contact us for support. This may include your name, email address, shipping address, payment information, and phone number.</p><h2>2. How We Use Your Information</h2><p>We use the information we collect to process your orders, communicate with you, improve our services, and prevent fraud. We may also send promotional emails if you have opted in.</p><h2>3. Information Sharing</h2><p>We do not sell or rent your personal information to third parties. We may share information with service providers who perform services on our behalf, such as payment processing and shipping.</p><h2>4. Data Security</h2><p>We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access.</p><h2>5. Your Rights</h2><p>You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.</p><h2>6. Changes to This Policy</h2><p>We may update this privacy policy from time to time. We will post the new policy on this page.</p>`,
  },
  shipping: {
    title: 'Shipping Policy',
    updated: '2026-09-19',
    body: `<h2>1. Dispatch Timeline</h2><p>We aim to dispatch all confirmed orders within 2-5 business days from the date of order confirmation, depending on stock availability and order volume.</p><h2>2. Shipping Zones</h2><p>We currently ship across India. Delivery times may vary based on location, courier partner, and external factors such as weather or holidays.</p><h2>3. Tracking</h2><p>Once your order is dispatched, tracking details will be shared via email and SMS. Please monitor your courier updates for the latest status.</p><h2>4. Address Accuracy</h2><p>Customers are responsible for providing accurate shipping details. We are not liable for delays or failed deliveries caused by incorrect address information.</p>`,
  },
  refund: {
    title: 'Refund Policy',
    updated: '2026-09-19',
    body: `<h2>1. Refund Eligibility</h2><p>Refunds are processed for eligible orders where the product is damaged, defective, or not as described at the time of delivery.</p><h2>2. Request Process</h2><p>To request a refund, contact our support team within 48 hours of receiving the order and share clear photos of the issue.</p><h2>3. Processing Time</h2><p>Approved refunds are generally processed within 5-7 business days to the original payment method.</p><h2>4. Non-Refundable Cases</h2><p>Refunds are not issued for change of mind, wrong size or color selection after delivery, or orders that are accepted and used.</p>`,
  },
  return: {
    title: 'Return Policy',
    updated: '2026-09-19',
    body: `<h2>1. Return Window</h2><p>Returns are accepted only for damaged, defective, or incorrect items within 7 days of delivery.</p><h2>2. Condition of Return</h2><p>The product must be unused, in original packaging, and accompanied by proof of purchase.</p><h2>3. Exchange or Replacement</h2><p>We may offer either a replacement or refund, depending on stock availability and the nature of the issue.</p><h2>4. Pickup and Shipping</h2><p>Customers may be asked to share the item with the courier for inspection. Return shipping costs may apply in some cases.</p>`,
  },
}

function readLocalStore() {
  try {
    const raw = localStorage.getItem('pi-legal-content')
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function getLegalPageData(key) {
  const fallback = DEFAULT_LEGAL_CONTENT[key] || { title: 'Policy', updated: new Date().toISOString().slice(0, 10), body: '' }
  try {
    const stored = readLocalStore()[key]
    return { ...fallback, ...(stored || {}) }
  } catch {
    return fallback
  }
}

export function saveLegalPageData(key, patch = {}) {
  const existing = readLocalStore()
  const merged = {
    ...existing,
    [key]: {
      ...(DEFAULT_LEGAL_CONTENT[key] || {}),
      ...(existing[key] || {}),
      ...patch,
    },
  }

  try {
    localStorage.setItem('pi-legal-content', JSON.stringify(merged))
  } catch {
    // ignore storage write errors in restricted browsers
  }
}
