import nodemailer from 'nodemailer'
import { ADMIN_EMAIL, MAIL_FROM, MAIL_FROM_NAME, SMTP_ENCRYPTION, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USER } from '../config/env.js'

function getTransport() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) throw new Error('SMTP is not configured. Add the SMTP host, username, and password in Admin Settings.')
  const port = Number(SMTP_PORT) || 587
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('SMTP port must be a number between 1 and 65535.')
  const secure = SMTP_ENCRYPTION === 'SSL' || port === 465
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
    requireTLS: SMTP_ENCRYPTION === 'TLS',
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  })
}

function sender() {
  return { name: MAIL_FROM_NAME, address: MAIL_FROM || SMTP_USER }
}

function safe(value) {
  return String(value ?? '').replace(/[<&>"']/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' })[character])
}

export async function sendTestEmail() {
  await getTransport().sendMail({ from: sender(), to: ADMIN_EMAIL, subject: 'Apna Packaging SMTP integration test', text: 'Your Apna Packaging SMTP integration is working.' })
}

export async function sendContactEmail({ name, email, phone, message }) {
  await getTransport().sendMail({
    from: sender(),
    to: ADMIN_EMAIL,
    replyTo: email,
    subject: `New website enquiry from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || '-'}\n\n${message}`,
    html: `<h2>New website enquiry</h2><p><b>Name:</b> ${safe(name)}</p><p><b>Email:</b> ${safe(email)}</p><p><b>Phone:</b> ${safe(phone || '-')}</p><p>${safe(message).replace(/\n/g, '<br>')}</p>`,
  })
}

export async function sendOrderEmail(order) {
  const customer = order.shipping_address?.name || 'Customer'
  const items = (order.items || []).map((item) => `${item.name || item.productName || 'Item'} x ${item.qty || 1}`).join('\n')
  await getTransport().sendMail({
    from: sender(),
    to: [ADMIN_EMAIL, order.email].filter(Boolean).join(', '),
    subject: `Order received: ${order.id}`,
    text: `Order ${order.id}\nCustomer: ${customer}\nEmail: ${order.email}\nTotal: INR ${order.total}\n\nItems:\n${items}`,
    html: `<h2>Order received</h2><p><b>Order:</b> ${safe(order.id)}</p><p><b>Customer:</b> ${safe(customer)}</p><p><b>Email:</b> ${safe(order.email)}</p><p><b>Total:</b> INR ${safe(order.total)}</p><p>${safe(items).replace(/\n/g, '<br>')}</p>`,
  })
}