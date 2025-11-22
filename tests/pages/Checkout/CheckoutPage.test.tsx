/**
 * Tests for Checkout Page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../../../src/contexts/AuthContext';
import { CartProvider } from '../../../src/contexts/CartContext';
import CheckoutPage from '../../../src/pages/Checkout/index';

// Mock the API
vi.mock('../../../src/api/shoppingCartApi');

// Mock OIDC client
vi.mock('../../../src/auth/oidcClient', () => ({
  initiateLogin: vi.fn(),
  initiateLogout: vi.fn(),
  getTokenExpiresIn: vi.fn(),
  silentRenew: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('redirects to cart page when cart is empty', () => {
    render(
      <AuthProvider>
        <CartProvider>
          <CheckoutPage />
        </CartProvider>
      </AuthProvider>
    );

    // Should call navigate to redirect to cart
    expect(mockNavigate).toHaveBeenCalledWith('/cart');
  });

  it('renders customer info form when cart has items', () => {
    // Setup cart with proper storage format
    // NOTE: Storage key must match CART_STORAGE_KEY in src/utils/storage.ts
    const storedCart = {
      items: [
        {
          itemId: '1',
          sku: 'test-sku',
          name: 'Test Item',
          unitPrice: 99.99,
          imageUrl: 'http://example.com/image.jpg',
          quantity: 1,
        },
      ],
      timestamp: Date.now(),
    };
    localStorage.setItem('acme-cart', JSON.stringify(storedCart));

    render(
      <AuthProvider>
        <CartProvider>
          <CheckoutPage />
        </CartProvider>
      </AuthProvider>
    );

    // Should not redirect
    expect(mockNavigate).not.toHaveBeenCalled();

    // Should show customer info form
    expect(screen.getByText(/customer information/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
  });
});
