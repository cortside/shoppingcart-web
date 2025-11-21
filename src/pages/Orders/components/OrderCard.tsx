/**
 * OrderCard Component
 * Per Phase 7 Plan - Order Card Component
 * Displays a summary card for a single order
 */

import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Order } from '../../../types/Orders';
import { formatDate, formatCurrency, getStatusColor, truncate } from '../../../utils/formatters';

interface OrderCardProps {
  readonly order: Order;
}

/**
 * Order summary card with link to detail page
 */
export const OrderCard = memo<OrderCardProps>(({ order }) => {
  const { orderIdShort, itemCount, total } = useMemo(() => {
    return {
      orderIdShort: truncate(order.orderResourceId, 8),
      itemCount: order.items.length,
      total: order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    };
  }, [order]);

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition bg-white">
      {/* Header: Order ID and Date */}
      <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
        <h3 className="font-semibold text-lg">Order #{orderIdShort}...</h3>
        <span className="text-sm text-gray-600">{formatDate(order.createdDate)}</span>
      </div>

      {/* Status and Total */}
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(order.status)}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
        <span className="font-semibold text-lg">{formatCurrency(total)}</span>
      </div>

      {/* Item Count */}
      <p className="text-sm text-gray-600 mb-3">
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </p>

      {/* View Details Link */}
      <Link
        to={`/account/orders/${order.orderResourceId}`}
        className="text-blue-600 hover:underline text-sm font-medium inline-flex items-center"
      >
        View Details →
      </Link>
    </div>
  );
});

OrderCard.displayName = 'OrderCard';
