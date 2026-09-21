import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import StoreLayout from '@/layouts/StoreLayout'
import AdminGuard from '@/layouts/admin/AdminGuard'
import AdminLayout from '@/layouts/admin/AdminLayout'
import Home from '@/pages/store/Home'
import Products from '@/pages/store/Products'
import ProductDetail from '@/pages/store/ProductDetail'
import Category from '@/pages/store/Category'
import SampleKit from '@/pages/store/SampleKit'
import BulkOrder from '@/pages/store/BulkOrder'
import Cart from '@/pages/store/Cart'
import Checkout from '@/pages/store/Checkout'
import OrderSuccess from '@/pages/store/OrderSuccess'
import About from '@/pages/content/About'
import Contact from '@/pages/content/Contact'
import PrivacyPolicy from '@/pages/legal/PrivacyPolicy'
import Terms from '@/pages/legal/Terms'
import ShippingPolicy from '@/pages/legal/ShippingPolicy'
import RefundPolicy from '@/pages/legal/RefundPolicy'
import ReturnPolicy from '@/pages/legal/ReturnPolicy'
import Auth from '@/pages/account/Auth'
import Account from '@/pages/account/Account'
import Support from '@/pages/account/Support'
import SupportTicket from '@/pages/account/SupportTicket'
import AdminLogin from '@/pages/admin/AdminLogin'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminProducts from '@/pages/admin/AdminProducts'
import AdminProductForm from '@/pages/admin/AdminProductForm'
import AdminOrders from '@/pages/admin/AdminOrders'
import AdminOrderDetail from '@/pages/admin/AdminOrderDetail'
import AdminMessages from '@/pages/admin/AdminMessages'
import AdminShipping from '@/pages/admin/AdminShipping'
import AdminCustomers from '@/pages/admin/AdminCustomers'
import AdminWebsite from '@/pages/admin/AdminWebsite'
import AdminPayments from '@/pages/admin/AdminPayments'
import AdminLegal from '@/pages/admin/AdminLegal'
import AdminSettings from '@/pages/admin/AdminSettings'
import AdminCoupons from '@/pages/admin/AdminCoupons'
import AdminSupport from '@/pages/admin/AdminSupport'
import AdminSupportDetail from '@/pages/admin/AdminSupportDetail'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/:id" element={<AdminProductForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="shipping" element={<AdminShipping />} />
          <Route path="website" element={<AdminWebsite />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="legal" element={<AdminLegal />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="support/:id" element={<AdminSupportDetail />} />
        </Route>
        <Route element={<StoreLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/free-sample-kit" element={<SampleKit />} />
          <Route path="/products/sample-kit" element={<SampleKit />} />
          <Route path="/sample-kit" element={<SampleKit />} />
          <Route path="/bulk-order" element={<BulkOrder />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<Terms />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/return-policy" element={<ReturnPolicy />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/sign-in" element={<Auth mode="sign-in" />} />
          <Route path="/sign-up" element={<Auth mode="sign-up" />} />
          <Route path="/account" element={<Account />} />
          <Route path="/account/support" element={<Support />} />
          <Route path="/account/support/:id" element={<SupportTicket />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
