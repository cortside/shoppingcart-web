/**
 * Order History Page
 * Per Phase 7 Plan - Order History Page
 * FR-019: Display paginated list of user's orders
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listOrders } from '../../api/shoppingCartApi';
import type { Order } from '../../types/Orders';
import { useAuth } from '../../contexts/AuthContext';
import { OrderCard } from './components/OrderCard';
import { Pagination } from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const DEFAULT_PAGE_SIZE = 20;

/**
 * Order History page - displays paginated list of user's orders
 */
export default function OrdersPage() {
  const { customerResourceId } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch orders for the current page
   */
  const fetchOrders = useCallback(async (page: number) => {
    // Validate customerResourceId exists
    if (!customerResourceId) {
      setError(
        'No order history available. To view your orders, please add items to your cart and complete checkout. Your customer account will be created during checkout.'
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await listOrders({
        CustomerResourceId: customerResourceId,
        PageNumber: page,
        PageSize: DEFAULT_PAGE_SIZE,
      });

      setOrders(response.items);
      setPagination({
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalItems: response.totalItems,
        totalPages: Math.ceil(response.totalItems / response.pageSize),
      });
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [customerResourceId]);

  /**
   * Handle page change
   */
  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, pageNumber: page }));
  }, []);

  /**
   * Fetch orders on mount and when page changes
   */
  useEffect(() => {
    fetchOrders(pagination.pageNumber);
  }, [pagination.pageNumber, fetchOrders]);

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Order History</h1>
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Order History</h1>
        <div className="text-center py-12">
          <ErrorMessage message={error} />
          <button
            onClick={() => fetchOrders(pagination.pageNumber)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /**
   * Render empty state
   */
  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Order History</h1>
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">You haven't placed any orders yet.</p>
          <Link to="/catalog" className="text-blue-600 hover:underline text-lg font-medium">
            Start shopping →
          </Link>
        </div>
      </div>
    );
  }

  /**
   * Render orders list
   */
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Order History</h1>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {orders.map((order) => (
          <OrderCard key={order.orderResourceId} order={order} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.pageNumber}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

OrdersPage.displayName = 'OrdersPage';
