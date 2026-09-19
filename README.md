# Apna Packaging Solution

Premium standup pouches store: React · Vite · Supabase · **Razorpay** · **Shiprocket**.

## Run locally

```bash
npm install
copy .env.example .env
npm run dev
```

- Store: http://localhost:5173
- **Admin:** http://localhost:5173/admin  
  Sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env` (defaults: `admin@apnapackagingsolution.com` / `admin123`). Change these before production.

`npm run dev` starts Vite **and** the API on port 8787 (admin auth, Razorpay, Shiprocket, image uploads). After pulling admin changes, restart this command so the API picks up new routes.

## Folder structure

```
paunch-ecom/
├── public/                 # static assets + product images / uploads
├── supabase/               # SQL schema
├── server/                 # Express API (port 8787)
│   ├── index.js            # process bootstrap
│   ├── app.js              # middleware + route mount
│   ├── config/env.js
│   ├── middleware/auth.js
│   ├── routes/             # admin, payments, shipping, upload, health
│   └── services/           # Shiprocket client
└── src/
    ├── main.jsx            # Vite entry
    ├── app/                # providers + router
    ├── layouts/            # store + admin shells
    ├── pages/              # store, account, content, legal, admin
    ├── components/         # layout, catalog, admin UI
    ├── context/            # cart + auth
    ├── data/catalog.js     # categories + products
    ├── services/           # API, Supabase, admin client
    └── styles/
```

Imports use the `@/` alias (`src/`).

## Admin

| Page | What it does |
| --- | --- |
| `/admin` | Revenue, 7-day chart, alerts, latest orders |
| `/admin/orders` | Search, filters, CSV export, status + Shiprocket AWB |
| `/admin/products` | Search, stock toggle, duplicate, image upload, variants |
| `/admin/customers` | Spend and order history from checkouts |
| `/admin/messages` | Contact inbox (read / reply / delete) |
| `/admin/shipping` | Shiprocket connection status |
| `/admin/settings` | Razorpay, Shiprocket and admin env |

## Razorpay

1. Create a test account at [Razorpay](https://dashboard.razorpay.com).
2. Copy `.env.example` to `.env` and put `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` in **`.env`** (the server does not read `.env.example`). Restart `npm run dev`.
3. Checkout → **Pay with Razorpay** opens the Razorpay popup (UPI / card / netbanking). The order is saved only after the server verifies the payment signature and Razorpay confirms the payment is captured.

Without keys, online payment is blocked with an error (no fake "paid" orders). COD still works.

## Shiprocket

1. Create an API user in the [Shiprocket](https://app.shiprocket.in) dashboard.
2. Set `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`, pickup pincode and pickup location name.
3. Checkout fetches courier rates by pincode.
4. Admin order page → **Create Shiprocket shipment** generates AWB + tracking link.

Without keys, demo couriers (Delhivery, Blue Dart, DTDC, Xpressbees) are shown.

## Supabase (optional)

Run `supabase/schema.sql`. Products, orders and contact messages sync when URL + anon key are set.
>>>>>>> origin/main
