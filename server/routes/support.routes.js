import { Router } from 'express'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '../middleware/auth.js'
import { SUPABASE_SERVICE_ROLE_KEY } from '../config/env.js'

const router = Router()

function supportClient() {
  const url = process.env.VITE_SUPABASE_URL
  if (!url || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin support')
  return createClient(url, SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
}

router.use(requireAdmin)

router.get('/', async (_req, res) => {
  try {
    const client = supportClient()
    const { data, error } = await client.from('support_tickets').select('*').order('updated_at', { ascending: false })
    if (error) throw error
    const tickets = await Promise.all((data || []).map(async (ticket) => {
      const user = ticket.user_id ? (await client.auth.admin.getUserById(ticket.user_id)).data.user : null
      return { ...ticket, customer: user ? { id: user.id, email: user.email, name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer', phone: user.user_metadata?.phone || '' } : null }
    }))
    res.json(tickets)
  } catch (error) { res.status(503).json({ error: error.message || 'Support service unavailable' }) }
})

router.get('/:id', async (req, res) => {
  try {
    const client = supportClient()
    const { data: ticket, error } = await client.from('support_tickets').select('*').eq('id', req.params.id).single()
    if (error) throw error
    const [{ data: messages }, { data: notes }] = await Promise.all([
      client.from('ticket_messages').select('*').eq('ticket_id', req.params.id).order('created_at'),
      client.from('ticket_internal_notes').select('*').eq('ticket_id', req.params.id).order('created_at'),
    ])
    let order = null
    if (ticket.order_id) order = (await client.from('orders').select('*').eq('id', ticket.order_id).maybeSingle()).data
    const customer = ticket.user_id ? (await client.auth.admin.getUserById(ticket.user_id)).data.user : null
    res.json({ ticket, messages: messages || [], notes: notes || [], order, customer: customer ? { id: customer.id, email: customer.email, name: customer.user_metadata?.full_name || customer.email?.split('@')[0] || 'Customer', phone: customer.user_metadata?.phone || '', created_at: customer.created_at } : null })
  } catch (error) { res.status(404).json({ error: error.message || 'Ticket not found' }) }
})

router.patch('/:id', async (req, res) => {
  const allowed = ['status', 'priority', 'assigned_admin_id']
  const patch = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)))
  if (!Object.keys(patch).length) return res.status(400).json({ error: 'No ticket fields to update' })
  try {
    const client = supportClient()
    const { data, error } = await client.from('support_tickets').update(patch).eq('id', req.params.id).select().single()
    if (error) throw error
    if (patch.status) await client.from('support_notifications').insert({ user_id: data.user_id, ticket_id: data.id, kind: 'ticket_status', title: `Ticket ${data.ticket_number} updated`, body: `Status changed to ${patch.status}` })
    res.json(data)
  } catch (error) { res.status(400).json({ error: error.message || 'Could not update ticket' }) }
})

router.post('/:id/messages', async (req, res) => {
  try {
    const client = supportClient()
    const { data: ticket, error: ticketError } = await client.from('support_tickets').select('id,user_id,ticket_number').eq('id', req.params.id).single()
    if (ticketError) throw ticketError
    const message = String(req.body?.message || '').trim()
    if (!message) return res.status(400).json({ error: 'Message is required' })
    const { data, error } = await client.from('ticket_messages').insert({ ticket_id: ticket.id, sender_id: null, sender_type: 'admin', message }).select().single()
    if (error) throw error
    await client.from('support_notifications').insert({ user_id: ticket.user_id, ticket_id: ticket.id, kind: 'ticket_reply', title: `Reply on ${ticket.ticket_number}`, body: message.slice(0, 160) })
    await client.from('support_tickets').update({ status: 'In Progress' }).eq('id', ticket.id)
    res.json(data)
  } catch (error) { res.status(400).json({ error: error.message || 'Could not send reply' }) }
})

router.post('/:id/notes', async (req, res) => {
  const note = String(req.body?.note || '').trim()
  if (!note) return res.status(400).json({ error: 'Note is required' })
  try {
    const client = supportClient()
    const { data, error } = await client.from('ticket_internal_notes').insert({ ticket_id: req.params.id, admin_id: null, note }).select().single()
    if (error) throw error
    res.json(data)
  } catch (error) { res.status(400).json({ error: error.message || 'Could not add note' }) }
})

export default router
