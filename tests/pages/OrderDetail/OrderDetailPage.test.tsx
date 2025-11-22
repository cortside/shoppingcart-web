import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OrderDetailPage from '../../../src/pages/OrderDetail';
import * as shoppingCartApi from '../../../src/api/shoppingCartApi';
import type { Order } from '../../../src/types/Orders';

// Mock the API
vi.mock('../../../src/api/shoppingCartApi');

const mockOrder: Order = {
  orderResourceId: 'order-123',
  status: 'created',
  customer: {
    customerResourceId: 'cust-456',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    birthDate: '1990-01-15',
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
      unitPrice: 19.99,
    },
    {
      orderItemId: 2,
      itemId: 'item-2',
      sku: 'GADGET-002',
      quantity: 1,
      unitPrice: 49.99,
    },
  ],
  createdDate: '2025-11-15T10:30:00Z',
  lastModifiedDate: '2025-11-15T10:30:00Z',
};

function renderWithRouter(orderId: string) {
  return render(
    <MemoryRouter initialEntries={[`/account/orders/${orderId}`]}>
      <Routes>
        <Route path="/account/orders/:orderId" element={<OrderDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('OrderDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading spinner while fetching order', () => {
      vi.mocked(shoppingCartApi.getOrder).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithRouter('order-123');

      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    beforeEach(() => {
      vi.mocked(shoppingCartApi.getOrder).mockResolvedValue(mockOrder);
    });

    it('should display order details after loading', async () => {
      renderWithRouter('order-123');

      await waitFor(() => {
        expect(screen.getByText('Order Details')).toBeInTheDocument();
      });

      // Order summary
      expect(screen.getByText('order-123')).toBeInTheDocument();
      expect(screen.getByText('Nov 15, 2025')).toBeInTheDocument();
      expect(screen.getByText('created')).toBeInTheDocument();
    });

    it('should display all order items', async () => {
      renderWithRouter('order-123');

      await waitFor(() => {
        expect(screen.getByText('WIDGET-001')).toBeInTheDocument();
      });

      expect(screen.getByText('WIDGET-001')).toBeInTheDocument();
      expect(screen.getByText('Quantity: 2')).toBeInTheDocument();
      expect(screen.getByText('GADGET-002')).toBeInTheDocument();
      expect(screen.getByText('Quantity: 1')).toBeInTheDocument();
    });

    it('should calculate and display item totals', async () => {
      renderWithRouter('order-123');

      await waitFor(() => {
        expect(screen.getByText('$39.98')).toBeInTheDocument(); // 2 × $19.99
      });

      expect(screen.getByText('$39.98')).toBeInTheDocument(); // 2 × $19.99
      expect(screen.getByText('$49.99')).toBeInTheDocument(); // 1 × $49.99
    });

    it('should display order total', async () => {
      renderWithRouter('order-123');

      await waitFor(() => {
        expect(screen.getByText('$89.97')).toBeInTheDocument(); // Total
      });

      const totalElements = screen.getAllByText('$89.97');
      expect(totalElements.length).toBeGreaterThan(0);
    });

    it('should display shipping address', async () => {
      renderWithRouter('order-123');

      await waitFor(() => {
        expect(screen.getByText('Shipping Address')).toBeInTheDocument();
      });

      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.getByText('Springfield, IL 62701')).toBeInTheDocument();
      expect(screen.getByText('USA')).toBeInTheDocument();
    });

    it('should display customer information', async () => {
      renderWithRouter('order-123');

      await waitFor(() => {
        expect(screen.getByText('Customer Information')).toBeInTheDocument();
      });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });

    it('should call getOrder API with correct order ID', async () => {
      renderWithRouter('order-123');

      await waitFor(() => {
        expect(shoppingCartApi.getOrder).toHaveBeenCalledWith('order-123');
      });
    });
  });

  describe('Error State', () => {
    it('should display error message when API call fails', async () => {
      const errorMessage = 'Failed to load order';
      vi.mocked(shoppingCartApi.getOrder).mockRejectedValue(new Error(errorMessage));

      renderWithRouter('order-123');

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      expect(screen.getByText('Back to Orders')).toBeInTheDocument();
    });

    it('should display error when order ID is missing', async () => {
      render(
        <MemoryRouter initialEntries={['/account/orders']}>
          <Routes>
            <Route path="/account/orders/:orderId?" element={<OrderDetailPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Order ID is required')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should have back to orders button', async () => {
      vi.mocked(shoppingCartApi.getOrder).mockResolvedValue(mockOrder);

      renderWithRouter('order-123');

      await waitFor(() => {
        expect(screen.getByText(/Back to Orders/)).toBeInTheDocument();
      });
    });
  });
});
