import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Toaster, toast } from 'sonner'
import {
  Bell,
  Boxes,
  ExternalLink,
  FileText,
  Globe,
  Infinity,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Mail,
  Menu,
  Package,
  Settings,
  Truck,
  TicketPercent,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import {
  adminFetchMessages,
  adminFetchOrders,
  adminFetchSupportTickets,
  adminLogout,
  getAdminEmail,
  markMessageRead,
  unreadMessageCount,
} from '@/services/admin'

const READ_NOTIFICATIONS_KEY = 'pi-admin-read-notifications'

function readNotificationIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_NOTIFICATIONS_KEY) || '[]'))
  } catch {
    return new Set()
  }
}

function saveNotificationIds(ids) {
  localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify([...ids].slice(-100)))
}

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: Boxes },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/messages', label: 'Messages', icon: Mail },
  { to: '/admin/support', label: 'Support', icon: LifeBuoy },
  { to: '/admin/shipping', label: 'Shipping', icon: Truck },
  { to: '/admin/website', label: 'Website', icon: Globe },
  { to: '/admin/payments', label: 'Payments', icon: Wallet },
  { to: '/admin/coupons', label: 'Coupons', icon: TicketPercent },
  { to: '/admin/legal', label: 'Legal', icon: FileText },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const [pending, setPending] = useState(0)
  const [unread, setUnread] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [supportPending, setSupportPending] = useState(0)

  useEffect(() => {
    setOpen(false)
    Promise.all([adminFetchOrders(), adminFetchMessages(), adminFetchSupportTickets()]).then(([orders, messages, supportTickets]) => {
      const recent = Array.isArray(orders) ? orders : []
      const readNotifications = readNotificationIds()
      const seen = JSON.parse(localStorage.getItem('pi-admin-seen-orders') || '[]')
      const seenSet = new Set(seen)
      const newOrders = recent.filter((order) => order?.id && !seenSet.has(order.id)).slice(0, 3)

      if (newOrders.length > 0) {
        newOrders.forEach((order) => {
          const customer = order.shipping_address?.name || order.email || 'customer'
          toast.success(`New order: ${customer} • ${order.total ? '₹' + Number(order.total).toLocaleString('en-IN') : 'pending'}`)
        })
      }

      const nextSeen = recent.slice(0, 20).map((order) => order.id).filter(Boolean)
      localStorage.setItem('pi-admin-seen-orders', JSON.stringify(nextSeen))

      const nextNotifications = []
      const seenSupport = new Set(JSON.parse(localStorage.getItem('pi-admin-seen-support') || '[]'))
      const newSupport = (supportTickets || []).filter((ticket) => !seenSupport.has(ticket.id)).slice(0, 3)
      newSupport.forEach((ticket) => nextNotifications.push({ id: `support-${ticket.id}`, type: 'support', title: 'New support ticket', text: `${ticket.ticket_number} · ${ticket.subject}`, href: `/admin/support/${ticket.id}` }))
      localStorage.setItem('pi-admin-seen-support', JSON.stringify((supportTickets || []).slice(0, 30).map((ticket) => ticket.id)))
      const unpaidAwb = recent.filter((o) => !o.awb && o.status !== 'cancelled' && o.status !== 'delivered')
      unpaidAwb.slice(0, 3).forEach((o) => {
        const id = `order-${o.id}`
        if (!readNotifications.has(id)) {
          nextNotifications.push({
            id,
            type: 'order',
            title: 'New order',
            text: `${o.shipping_address?.name || o.email || 'Customer'} • ₹${Number(o.total || 0).toLocaleString('en-IN')}`,
            href: `/admin/orders/${o.id}`,
          })
        }
      })
      const unreadMessages = unreadMessageCount(messages)
      if (unreadMessages > 0) {
        nextNotifications.push({
          id: 'messages-alert',
          type: 'message',
          title: 'Unread messages',
          text: `${unreadMessages} message${unreadMessages === 1 ? '' : 's'} waiting`,
          href: '/admin/messages',
          messageIds: messages.filter((message) => message.id).map((message) => message.id),
        })
      }

      setPending(nextNotifications.filter((item) => item.type === 'order').length)
      setUnread(unreadMessages)
      setNotifications(nextNotifications)
      setSupportPending(newSupport.length)
    })
  }, [location.pathname])

  const email = getAdminEmail()

  function signOut() {
    adminLogout()
    navigate('/admin/login')
  }

  function reviewNotification(item) {
    const readIds = readNotificationIds()
    readIds.add(item.id)
    saveNotificationIds(readIds)
    if (item.type === 'message') {
      item.messageIds?.forEach((id) => markMessageRead(id))
    }
    setNotifications((current) => current.filter((notification) => notification.id !== item.id))
    if (item.type === 'order') setPending((count) => Math.max(0, count - 1))
    if (item.type === 'message') setUnread((count) => Math.max(0, count - 1))
    if (item.type === 'support') setSupportPending((count) => Math.max(0, count - 1))
    setAlertOpen(false)
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          className={({ isActive }) =>
            `flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
              isActive ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`
          }
        >
          <span className="flex items-center gap-2.5">
            <l.icon className="h-4 w-4" />
            {l.label}
          </span>
          {l.to === '/admin/orders' && pending > 0 && (
            <span className="rounded-full bg-white/20 px-1.5 text-[10px] font-bold">{pending}</span>
          )}
          {l.to === '/admin/messages' && unread > 0 && (
            <span className="rounded-full bg-white/20 px-1.5 text-[10px] font-bold">{unread}</span>
          )}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="flex min-h-screen bg-[#f4f6f8] font-sans text-slate-900">
      <aside className="hidden w-[260px] shrink-0 flex-col bg-slate-950 text-white print:hidden lg:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl gradient-btn">
              <Infinity className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] tracking-[0.2em] text-emerald-400 uppercase">Apna Packaging</p>
              <p className="text-base font-bold">Admin</p>
            </div>
          </div>
        </div>
        {nav}
        <button
          type="button"
          onClick={signOut}
          className="m-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden print:hidden">
          <div className="absolute inset-0 bg-slate-950/50" onClick={() => setOpen(false)} />
          <aside className="relative flex h-full w-[260px] flex-col bg-slate-950 text-white">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <p className="font-bold">Menu</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
            <button type="button" onClick={signOut} className="m-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur print:hidden md:px-8">
          <button type="button" className="rounded-lg p-2 text-slate-600 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Operations</p>
            <p className="hidden text-xs text-slate-400 sm:block">Catalogue · Razorpay · Shiprocket</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setAlertOpen((v) => !v)}
                className="relative inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {(pending + unread + supportPending) > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {pending + unread + supportPending}
                  </span>
                )}
              </button>

              {alertOpen && (
                <div className="absolute right-0 top-full mt-3 w-[320px] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 px-2 pb-2">
                    <p className="text-sm font-semibold text-slate-800">Notifications</p>
                    <button type="button" onClick={() => setAlertOpen(false)} className="text-xs text-slate-500 hover:text-slate-800">Close</button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-2 py-4 text-sm text-slate-500">No alerts right now.</div>
                  ) : (
                    <div className="max-h-[320px] overflow-y-auto">
                      {notifications.map((item) => (
                        <Link
                          key={item.id}
                          to={item.href}
                          onClick={() => reviewNotification(item)}
                          className="block rounded-xl px-2 py-2.5 transition hover:bg-slate-50"
                        >
                          <div className="flex items-start gap-2">
                            <span className={`mt-1 h-2.5 w-2.5 rounded-full ${item.type === 'message' ? 'bg-sky-500' : 'bg-emerald-500'}`} />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                              <p className="mt-0.5 text-xs text-slate-500">{item.text}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Store <ExternalLink className="h-3 w-3" />
            </Link>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pr-3 pl-1">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                {email.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden max-w-[160px] truncate text-xs text-slate-600 md:inline">{email}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  )
}
