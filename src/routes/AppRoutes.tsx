import { Routes, Route, Navigate } from 'react-router-dom';
import CatalogPage from '../pages/Catalog';
import ProductDetailPage from '../pages/ProductDetail';
import CartPage from '../pages/Cart';
import CheckoutPage from '../pages/Checkout';
import OrdersPage from '../pages/Orders';
import OrderDetailPage from '../pages/OrderDetail';
import ProfilePage from '../pages/Profile';
import LoginPage from '../pages/Login';
import AuthCallbackPage from '../pages/AuthCallback';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/catalog" replace />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/product/:sku" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/account/orders" element={<OrdersPage />} />
      <Route path="/account/orders/:orderId" element={<OrderDetailPage />} />
      <Route path="/account/profile" element={<ProfilePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
    </Routes>
  );
}
