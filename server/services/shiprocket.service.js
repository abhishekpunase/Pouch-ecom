import { PICKUP_PIN, SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD, shiprocketReady } from '../config/env.js'

let shipToken = null
let shipTokenAt = 0

export function demoRates(cod) {
  const bump = cod ? 15 : 0
  return [
    { courier_company_id: 1, courier_name: 'Delhivery', rate: 72 + bump, etd: '4-5 days', freight_charge: 72 + bump },
    { courier_company_id: 12, courier_name: 'Blue Dart', rate: 110 + bump, etd: '2-3 days', freight_charge: 110 + bump },
    { courier_company_id: 43, courier_name: 'DTDC', rate: 80 + bump, etd: '4-6 days', freight_charge: 80 + bump },
    { courier_company_id: 54, courier_name: 'Xpressbees', rate: 68 + bump, etd: '3-5 days', freight_charge: 68 + bump },
  ]
}

export async function shiprocketToken() {
  if (shipToken && Date.now() - shipTokenAt < 1000 * 60 * 50) return shipToken
  const r = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: SHIPROCKET_EMAIL, password: SHIPROCKET_PASSWORD }),
  })
  const data = await r.json()
  if (!data?.token) throw new Error(data?.message || 'Shiprocket login failed')
  shipToken = data.token
  shipTokenAt = Date.now()
  return shipToken
}

export { PICKUP_PIN, shiprocketReady }
