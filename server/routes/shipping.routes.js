import crypto from 'node:crypto'
import { Router } from 'express'
import { PICKUP_LOCATION, PICKUP_PIN } from '../config/env.js'
import { requireAdmin } from '../middleware/auth.js'
import { demoRates, shiprocketReady, shiprocketToken } from '../services/shiprocket.service.js'

const router = Router()

router.post('/rates', async (req, res) => {
  try {
    const delivery = String(req.body?.pincode || '').trim()
    const weight = Math.max(0.5, Number(req.body?.weight) || 0.5)
    const cod = Boolean(req.body?.cod)
    if (!/^\d{6}$/.test(delivery)) {
      return res.status(400).json({ error: 'Enter a valid 6-digit pincode' })
    }
    if (!shiprocketReady) {
      return res.json({ demo: true, pickup: PICKUP_PIN, rates: demoRates(cod) })
    }
    const token = await shiprocketToken()
    const qs = new URLSearchParams({
      pickup_postcode: PICKUP_PIN,
      delivery_postcode: delivery,
      weight: String(weight),
      cod: cod ? '1' : '0',
    })
    const r = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/serviceability?${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await r.json()
    const list = data?.data?.available_courier_companies || data?.available_courier_companies || []
    const rates = list
      .map((c) => ({
        courier_company_id: c.courier_company_id,
        courier_name: c.courier_name,
        rate: Number(c.rate || c.freight_charge || 0),
        etd: c.etd || c.estimated_delivery_days || '',
        freight_charge: Number(c.freight_charge || c.rate || 0),
      }))
      .filter((c) => c.rate > 0)
      .sort((a, b) => a.rate - b.rate)
      .slice(0, 6)
    res.json({ demo: false, pickup: PICKUP_PIN, rates: rates.length ? rates : demoRates(cod) })
  } catch (err) {
    res.json({ demo: true, pickup: PICKUP_PIN, rates: demoRates(Boolean(req.body?.cod)), warning: err.message })
  }
})

router.post('/create', requireAdmin, async (req, res) => {
  try {
    const order = req.body?.order
    if (!order) return res.status(400).json({ error: 'Missing order' })
    const addr = order.shipping_address || {}
    if (!shiprocketReady) {
      const awb = `SR${Date.now().toString().slice(-10)}`
      return res.json({
        demo: true,
        shipment_id: `ship_demo_${crypto.randomBytes(4).toString('hex')}`,
        shiprocket_order_id: `sr_demo_${crypto.randomBytes(3).toString('hex')}`,
        awb,
        courier: order.courier_name || 'Delhivery',
        tracking_url: `https://shiprocket.co/tracking/${awb}`,
      })
    }
    const token = await shiprocketToken()
    const items = (order.items || []).map((i) => ({
      name: i.name,
      sku: i.productId || i.slug || 'SKU',
      units: i.qty || 1,
      selling_price: i.price || 0,
    }))
    const payload = {
      order_id: String(order.id).slice(0, 40),
      order_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      pickup_location: PICKUP_LOCATION,
      billing_customer_name: addr.name || 'Customer',
      billing_last_name: '',
      billing_address: addr.address || 'Address',
      billing_city: addr.city || 'City',
      billing_pincode: addr.pincode,
      billing_state: addr.state || 'Delhi',
      billing_country: 'India',
      billing_email: order.email,
      billing_phone: addr.phone,
      shipping_is_billing: true,
      order_items: items,
      payment_method: order.payment_method === 'cod' ? 'COD' : 'Prepaid',
      sub_total: Number(order.subtotal || order.total || 0),
      length: 20,
      breadth: 15,
      height: 8,
      weight: Math.max(0.5, Number(order.weight) || 0.5),
    }
    const r = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    })
    const data = await r.json()
    if (!r.ok && !data?.order_id) {
      return res.status(400).json({ error: data?.message || 'Shiprocket create failed', details: data })
    }
    const shipmentId = data.shipment_id
    let awb = data.awb_code || ''
    if (shipmentId && order.courier_company_id) {
      const assign = await fetch('https://apiv2.shiprocket.in/v1/external/courier/assign/awb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          shipment_id: shipmentId,
          courier_id: order.courier_company_id,
        }),
      })
      const assigned = await assign.json()
      awb = assigned?.response?.data?.awb_code || assigned?.awb_code || awb
    }
    res.json({
      demo: false,
      shipment_id: shipmentId,
      shiprocket_order_id: data.order_id,
      awb,
      courier: order.courier_name || data.courier_name,
      tracking_url: awb ? `https://shiprocket.co/tracking/${awb}` : '',
      raw: data,
    })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Shiprocket error' })
  }
})

export default router
