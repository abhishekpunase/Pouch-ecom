import { supabase } from './supabase'

export const SUPPORT_CATEGORIES = ['Order Issue', 'Payment Issue', 'Product Issue', 'Delivery Issue', 'Return/Refund', 'Cancellation', 'Other']
export const SUPPORT_STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed']
export const SUPPORT_PRIORITIES = ['Low', 'Normal', 'High', 'Urgent']

function requireClient() {
  if (!supabase) throw new Error('Support tickets require Supabase to be configured.')
  return supabase
}

export async function createSupportTicket({ user, orderId, subject, category, description, priority = 'Normal', attachment }) {
  const client = requireClient()
  const { data: ticket, error } = await client.from('support_tickets').insert({
    user_id: user.id,
    order_id: orderId || null,
    subject: subject.trim(),
    category,
    description: description.trim(),
    priority,
  }).select().single()
  if (error) throw error

  let attachmentData = {}
  if (attachment) attachmentData = await uploadSupportAttachment(user.id, ticket.id, attachment)
  const { error: messageError } = await client.from('ticket_messages').insert({
    ticket_id: ticket.id,
    sender_id: user.id,
    sender_type: 'customer',
    message: description.trim(),
    ...attachmentData,
  })
  if (messageError) throw messageError
  return ticket
}

export async function fetchMySupportTickets(userId) {
  const client = requireClient()
  const { data, error } = await client.from('support_tickets').select('*').eq('user_id', userId).order('updated_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchMySupportTicket(ticketId, userId) {
  const client = requireClient()
  const { data: ticket, error } = await client.from('support_tickets').select('*').eq('id', ticketId).eq('user_id', userId).single()
  if (error) throw error
  const { data: messages, error: messageError } = await client.from('ticket_messages').select('*').eq('ticket_id', ticketId).order('created_at')
  if (messageError) throw messageError
  return { ticket, messages: messages || [] }
}

export async function sendSupportMessage({ user, ticketId, message, attachment }) {
  const client = requireClient()
  let attachmentData = {}
  if (attachment) attachmentData = await uploadSupportAttachment(user.id, ticketId, attachment)
  const { data, error } = await client.from('ticket_messages').insert({
    ticket_id: ticketId,
    sender_id: user.id,
    sender_type: 'customer',
    message: message.trim(),
    ...attachmentData,
  }).select().single()
  if (error) throw error
  return data
}

export async function uploadSupportAttachment(userId, ticketId, file) {
  const client = requireClient()
  if (file.size > 10 * 1024 * 1024) throw new Error('Attachment must be smaller than 10 MB')
  if (!['image/', 'application/pdf'].some((type) => file.type.startsWith(type))) throw new Error('Only images and PDF files are supported')
  const path = `${userId}/${ticketId}/${crypto.randomUUID()}-${file.name}`
  const { error } = await client.storage.from('support-attachments').upload(path, file, { upsert: false })
  if (error) throw error
  return { attachment_url: path, attachment_name: file.name, attachment_type: file.type }
}

export async function createSupportSignedUrl(path) {
  const client = requireClient()
  const { data, error } = await client.storage.from('support-attachments').createSignedUrl(path, 300)
  if (error) throw error
  return data.signedUrl
}

export async function fetchSupportNotifications(userId) {
  const client = requireClient()
  const { data, error } = await client.from('support_notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20)
  if (error) throw error
  return data || []
}
