import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder } from '../../api/shoppingCartApi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import Button from '../../components/common/Button';
import type { Order } from '../../types/Orders';

const OrderDetailPage = memo(function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
      if (!orderId) {
        setError('Order ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getOrder(orderId);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order:', err);
        setError(err instanceof Error ? err.message : 'Failed to load order details');
      } finally {
        setLoading(false);
      }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleBackToOrders = useCallback(() => {
    navigate('/account/orders');
  }, [navigate]);

  const subtotal = useMemo(() => {
    return order?.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) ?? 0;
  }, [order?.items]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <ErrorMessage message={error} />
        <div className="mt-4">
          <Button onClick={handleBackToOrders} variant="secondary">
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-gray-600">Order not found</p>
        <div className="mt-4">
          <Button onClick={handleBackToOrders} variant="secondary">
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleBackToOrders}
          className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
        >
          ← Back to Orders
        </button>
        <h1 className="text-3xl font-bold">Order Details</h1>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b">
          <div>
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-medium">{order.orderResourceId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Order Date</p>
            <p className="font-medium">{formatDate(order.createdDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-medium capitalize">{order.status}</p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Items</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.orderItemId} className="flex justify-between items-center border-b pb-4 last:border-b-0 last:pb-0">
              <div className="flex-1">
                <p className="font-medium">{item.sku}</p>
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(item.unitPrice * item.quantity)}</p>
                <p className="text-sm text-gray-600">{formatCurrency(item.unitPrice)} each</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
        <div>
          <p>{order.address.street}</p>
          <p>
            {order.address.city}, {order.address.state} {order.address.zipCode}
          </p>
          <p>{order.address.country}</p>
        </div>
      </div>

      {/* Customer Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Customer Information</h2>
        <div className="space-y-2">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium">
              {order.customer.firstName} {order.customer.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{order.customer.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
});

OrderDetailPage.displayName = 'OrderDetailPage';

export default OrderDetailPage;
