import { AuthProvider } from '@/context/AuthContext.jsx'
import { CartProvider } from '@/context/CartContext.jsx'

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  )
}
