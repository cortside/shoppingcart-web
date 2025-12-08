/**
 * Order Confirmation Page
 * Displays after successful order placement
 * Route: /checkout/confirmation/:orderId
 */

import { useParams, Navigate } from 'react-router-dom';
import OrderConfirmation from '../Checkout/components/OrderConfirmation';

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();

  // If no orderId, redirect to catalog
  if (!orderId) {
    return <Navigate to="/catalog" replace />;
  }

  return <OrderConfirmation orderResourceId={orderId} />;
}
