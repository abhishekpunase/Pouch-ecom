import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { SITE, GST_RATE } from '@/data/catalog'

const CartContext = createContext(null)
const STORAGE_KEY = 'pi-cart'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  })
  const [quote, setQuote] = useState(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const api = useMemo(() => {
    const count = items.reduce((n, i) => n + i.qty, 0)
    const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0)
    const gst = Math.round(subtotal * GST_RATE)
    const shipping =
      subtotal >= SITE.freeShippingFrom || subtotal === 0 ? 0 : quote?.rate ?? SITE.shippingFee
    const total = subtotal + gst + shipping

    function addItem(item) {
      const isSample = item.isSample || item.productId === 'sample-kit'
      if (isSample && items.some((p) => p.productId === 'sample-kit' || p.isSample)) {
        return false
      }
      setItems((prev) => {
        const key = `${item.productId}-${item.sizeId}-${item.colourId}-${item.packId}`
        const existing = prev.find((p) => p.key === key)
        if (existing) {
          return prev.map((p) => {
            if (p.key !== key) return p
            const nextQty = p.qty + item.qty
            return {
              ...p,
              qty: nextQty,
              price: item.price,
              packLabel: p.packId === 'pcs' ? `${nextQty} pcs` : p.packLabel,
            }
          })
        }
        return [...prev, { ...item, key, isSample }]
      })
      return true
    }

    function updateQty(key, qty) {
      const item = items.find((p) => p.key === key)
      if ((item?.isSample || item?.productId === 'sample-kit') && qty > 1) return
      const min = item?.packId === 'pcs' ? 100 : 1
      if (qty < min) {
        setItems((prev) => prev.filter((p) => p.key !== key))
        return
      }
      setItems((prev) => prev.map((p) => (p.key === key ? { ...p, qty, packLabel: p.packId === 'pcs' ? `${qty} pcs` : p.packLabel } : p)))
    }

    function remove(key) {
      setItems((prev) => prev.filter((p) => p.key !== key))
    }

    function setShippingQuote(next) {
      setQuote(next)
    }

    function clear() {
      setItems([])
      setQuote(null)
    }

    return { items, count, subtotal, gst, shipping, total, quote, addItem, updateQty, remove, clear, setShippingQuote }
  }, [items, quote])

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
