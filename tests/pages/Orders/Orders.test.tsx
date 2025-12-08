/**
 * Tests for Orders (Order History) page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OrdersPage from '../../../src/pages/Orders';
import * as shoppingCartApi from '../../../src/api/shoppingCartApi';
import * as AuthContext from '../../../src/contexts/AuthContext';
import type { Order } from '../../../src/types/Orders';
import type { PagedResult } from '../../../src/types/Catalog';

// Mock the API
vi.mock('../../../src/api/shoppingCartApi');

// Mock AuthContext
vi.mock('../../../src/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockOrders: Order[] = [
  {
    orderResourceId: 'order-1',
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
    ],
    createdDate: '2025-11-15T10:30:00Z',
    lastModifiedDate: '2025-11-15T10:30:00Z',
  },
];

const mockPagedResult: PagedResult<Order> = {
  items: mockOrders,
  totalItems: 1,
  pageNumber: 1,
  pageSize: 20,
};

import type { AuthUser } from '../../../src/types/Auth';

interface MockAuthContext {
  customerResourceId: string | null;
  isAuthenticated: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  idToken: string | null;
  login: () => void;
  logout: () => void;
  setCustomerResourceId: (id: string) => void;
  setAuthState: (tokens: { accessToken: string; idToken: string; user: AuthUser }) => void;
}

describe('Orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderOrders = () => {
    return render(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );
  };

  it('should render loading state initially', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      customerResourceId: 'cust-123',
      isAuthenticated: true,
      user: null,
      accessToken: 'token',
      idToken: 'idtoken',
      login: vi.fn(),
      logout: vi.fn(),
      setCustomerResourceId: vi.fn(),
      setAuthState: vi.fn(),
    } as MockAuthContext);

    vi.mocked(shoppingCartApi.listOrders).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderOrders();

    expect(screen.getByText('Order History')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading')).toBeInTheDocument(); // LoadingSpinner has aria-label
  });

  it('should render orders when data is loaded', async () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      customerResourceId: 'cust-123',
      isAuthenticated: true,
      user: null,
      accessToken: 'token',
      idToken: 'idtoken',
      login: vi.fn(),
      logout: vi.fn(),
      setCustomerResourceId: vi.fn(),
      setAuthState: vi.fn(),
    } as MockAuthContext);

    vi.mocked(shoppingCartApi.listOrders).mockResolvedValue(mockPagedResult);

    renderOrders();

    await waitFor(() => {
      expect(screen.getByText(/Order #order-1\.\.\./)).toBeInTheDocument();
    });

    expect(screen.getByText('Nov 15, 2025')).toBeInTheDocument();
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  it('should render empty state when no orders exist', async () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      customerResourceId: 'cust-123',
      isAuthenticated: true,
      user: null,
      accessToken: 'token',
      idToken: 'idtoken',
      login: vi.fn(),
      logout: vi.fn(),
      setCustomerResourceId: vi.fn(),
      setAuthState: vi.fn(),
    } as MockAuthContext);

    vi.mocked(shoppingCartApi.listOrders).mockResolvedValue({
      items: [],
      totalItems: 0,
      pageNumber: 1,
      pageSize: 20,
    });

    renderOrders();

    await waitFor(() => {
      expect(screen.getByText("You haven't placed any orders yet.")).toBeInTheDocument();
    });

    expect(screen.getByText('Start shopping →')).toBeInTheDocument();
  });

  it('should render error state when API call fails', async () => {
    // Suppress expected console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(AuthContext.useAuth).mockReturnValue({
      customerResourceId: 'cust-123',
      isAuthenticated: true,
      user: null,
      accessToken: 'token',
      idToken: 'idtoken',
      login: vi.fn(),
      logout: vi.fn(),
      setCustomerResourceId: vi.fn(),
      setAuthState: vi.fn(),
    } as MockAuthContext);

    vi.mocked(shoppingCartApi.listOrders).mockRejectedValue(new Error('API Error'));

    renderOrders();

    await waitFor(() => {
      expect(screen.getByText('Failed to load orders. Please try again.')).toBeInTheDocument();
    });

    expect(screen.getByText('Retry')).toBeInTheDocument();

    // Verify console.error was called with the error
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load orders:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it('should render error when no customerResourceId exists', async () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      customerResourceId: null,
      isAuthenticated: true,
      user: null,
      accessToken: 'token',
      idToken: 'idtoken',
      login: vi.fn(),
      logout: vi.fn(),
      setCustomerResourceId: vi.fn(),
      setAuthState: vi.fn(),
    } as MockAuthContext);

    renderOrders();

    await waitFor(() => {
      expect(
        screen.getByText(/No customer information found. Please complete checkout/)
      ).toBeInTheDocument();
    });
  });

  it('should call listOrders with correct parameters', async () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      customerResourceId: 'cust-123',
      isAuthenticated: true,
      user: null,
      accessToken: 'token',
      idToken: 'idtoken',
      login: vi.fn(),
      logout: vi.fn(),
      setCustomerResourceId: vi.fn(),
      setAuthState: vi.fn(),
    } as MockAuthContext);

    vi.mocked(shoppingCartApi.listOrders).mockResolvedValue(mockPagedResult);

    renderOrders();

    await waitFor(() => {
      expect(shoppingCartApi.listOrders).toHaveBeenCalledWith({
        CustomerResourceId: 'cust-123',
        PageNumber: 1,
        PageSize: 20,
      });
    });
  });

  it('should not render pagination when only one page exists', async () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      customerResourceId: 'cust-123',
      isAuthenticated: true,
      user: null,
      accessToken: 'token',
      idToken: 'idtoken',
      login: vi.fn(),
      logout: vi.fn(),
      setCustomerResourceId: vi.fn(),
      setAuthState: vi.fn(),
    } as MockAuthContext);

    vi.mocked(shoppingCartApi.listOrders).mockResolvedValue(mockPagedResult);

    renderOrders();

    await waitFor(() => {
      expect(screen.getByText(/Order #order-1\.\.\./)).toBeInTheDocument();
    });

    // Pagination should not be rendered for single page
    expect(screen.queryByText('← Previous')).not.toBeInTheDocument();
    expect(screen.queryByText('Next →')).not.toBeInTheDocument();
  });
});
