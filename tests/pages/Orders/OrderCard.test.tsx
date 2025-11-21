/**
 * Tests for OrderCard component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { OrderCard } from '../../../src/pages/Orders/components/OrderCard';
import type { Order } from '../../../src/types/Orders';

const mockOrder: Order = {
  orderResourceId: '550e8400-e29b-41d4-a716-446655440000',
  status: 'paid',
  customer: {
    customerResourceId: 'cust-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    createdDate: '2025-11-01T00:00:00Z',
    lastModifiedDate: '2025-11-01T00:00:00Z',
  },
  address: {
    street: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    country: 'USA',
    zipCode: '62701',
  },
  items: [
    {
      orderItemId: 1,
      itemId: 'item-1',
      sku: 'WIDGET-001',
      quantity: 2,
      unitPrice: 29.99,
    },
    {
      orderItemId: 2,
      itemId: 'item-2',
      sku: 'WIDGET-002',
      quantity: 1,
      unitPrice: 19.99,
    },
  ],
  createdDate: '2025-11-15T10:30:00Z',
  lastModifiedDate: '2025-11-15T10:30:00Z',
};

describe('OrderCard', () => {
  const renderOrderCard = (order: Order) => {
    return render(
      <BrowserRouter>
        <OrderCard order={order} />
      </BrowserRouter>
    );
  };

  it('should render order ID (truncated)', () => {
    renderOrderCard(mockOrder);
    expect(screen.getByText(/Order #550e8400\.\.\./)).toBeInTheDocument();
  });

  it('should render order date', () => {
    renderOrderCard(mockOrder);
    expect(screen.getByText('Nov 15, 2025')).toBeInTheDocument();
  });

  it('should render order status', () => {
    renderOrderCard(mockOrder);
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  it('should render order total', () => {
    renderOrderCard(mockOrder);
    // Total: (2 * 29.99) + (1 * 19.99) = 79.97
    expect(screen.getByText('$79.97')).toBeInTheDocument();
  });

  it('should render item count (plural)', () => {
    renderOrderCard(mockOrder);
    expect(screen.getByText('2 items')).toBeInTheDocument();
  });

  it('should render item count (singular)', () => {
    const singleItemOrder: Order = {
      ...mockOrder,
      items: [mockOrder.items[0]],
    };
    renderOrderCard(singleItemOrder);
    expect(screen.getByText('1 item')).toBeInTheDocument();
  });

  it('should render View Details link', () => {
    renderOrderCard(mockOrder);
    const link = screen.getByText('View Details →');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/account/orders/550e8400-e29b-41d4-a716-446655440000');
  });

  it('should apply correct status color for created', () => {
    const createdOrder: Order = { ...mockOrder, status: 'created' };
    renderOrderCard(createdOrder);
    const statusBadge = screen.getByText('Created');
    expect(statusBadge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('should apply correct status color for shipped', () => {
    const shippedOrder: Order = { ...mockOrder, status: 'shipped' };
    renderOrderCard(shippedOrder);
    const statusBadge = screen.getByText('Shipped');
    expect(statusBadge).toHaveClass('bg-purple-100', 'text-purple-800');
  });

  it('should apply correct status color for cancelled', () => {
    const cancelledOrder: Order = { ...mockOrder, status: 'cancelled' };
    renderOrderCard(cancelledOrder);
    const statusBadge = screen.getByText('Cancelled');
    expect(statusBadge).toHaveClass('bg-red-100', 'text-red-800');
  });
});
