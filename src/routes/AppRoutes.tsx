import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth } from '../auth/RequireAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Lazy load route components for code splitting
const CatalogPage = lazy(() => import('../pages/Catalog'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetail'));
const CartPage = lazy(() => import('../pages/Cart'));
const CheckoutPage = lazy(() => import('../pages/Checkout'));
const OrderConfirmationPage = lazy(() => import('../pages/OrderConfirmation'));
const OrdersPage = lazy(() => import('../pages/Orders'));
const OrderDetailPage = lazy(() => import('../pages/OrderDetail'));
const ProfilePage = lazy(() => import('../pages/Profile'));
const LoginPage = lazy(() => import('../pages/Login'));
const AuthCallbackPage = lazy(() => import('../pages/AuthCallback'));
const SilentCallbackPage = lazy(() => import('../pages/SilentCallback'));

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Navigate to="/catalog" replace />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/product/:sku" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route
          path="/checkout/confirmation/:orderId"
          element={
            <RequireAuth>
              <OrderConfirmationPage />
            </RequireAuth>
          }
        />
        <Route
          path="/account/orders"
          element={
            <RequireAuth>
              <OrdersPage />
            </RequireAuth>
          }
        />
        <Route
          path="/account/orders/:orderId"
          element={
            <RequireAuth>
              <OrderDetailPage />
            </RequireAuth>
          }
        />
        <Route
          path="/account/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/auth/silent-callback" element={<SilentCallbackPage />} />
      </Routes>
    </Suspense>
  );
}
