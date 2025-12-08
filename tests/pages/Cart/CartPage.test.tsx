/**
 * Cart Page Tests
 * Validates cart page functionality per FR-007 through FR-011
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CartPage from '../../../src/pages/Cart';
import { CartProvider } from '../../../src/contexts/CartContext';
import type { CartItem } from '../../../src/types/Cart';

const CART_STORAGE_KEY = 'acme-cart';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

const renderCartPage = (initialCart: CartItem[] = []) => {
  // Clear localStorage before each test
  mockLocalStorage.clear();

  // Set initial cart in localStorage with proper format
  if (initialCart.length > 0) {
    mockLocalStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        items: initialCart,
        timestamp: Date.now(),
      })
    );
  }

  return render(
    <BrowserRouter>
      <CartProvider>
        <CartPage />
      </CartProvider>
    </BrowserRouter>
  );
};

describe('CartPage', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('should display empty cart state when no items', () => {
    renderCartPage();

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByText(/Browse our catalog to discover premium products/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Continue Shopping/i })).toHaveAttribute('href', '/catalog');
  });

  it('should display cart items when cart has products', () => {
    const mockItems: CartItem[] = [
      {
        itemId: '1',
        sku: 'TEST-001',
        name: 'Test Product',
        unitPrice: 29.99,
        imageUrl: 'https://via.placeholder.com/150',
        quantity: 2,
      },
    ];

    renderCartPage(mockItems);

    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('SKU: TEST-001')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('should display correct subtotal for multiple items', () => {
    const mockItems: CartItem[] = [
      {
        itemId: '1',
        sku: 'TEST-001',
        name: 'Product 1',
        unitPrice: 10,
        imageUrl: 'https://via.placeholder.com/150',
        quantity: 2,
      },
      {
        itemId: '2',
        sku: 'TEST-002',
        name: 'Product 2',
        unitPrice: 15,
        imageUrl: 'https://via.placeholder.com/150',
        quantity: 1,
      },
    ];

    renderCartPage(mockItems);

    // Subtotal should be (10 * 2) + (15 * 1) = 35.00
    const subtotalElements = screen.getAllByText('$35.00');
    expect(subtotalElements.length).toBeGreaterThan(0);
  });

  it('should display item count in summary', () => {
    const mockItems: CartItem[] = [
      {
        itemId: '1',
        sku: 'TEST-001',
        name: 'Product 1',
        unitPrice: 10,
        imageUrl: 'https://via.placeholder.com/150',
        quantity: 2,
      },
      {
        itemId: '2',
        sku: 'TEST-002',
        name: 'Product 2',
        unitPrice: 15,
        imageUrl: 'https://via.placeholder.com/150',
        quantity: 3,
      },
    ];

    renderCartPage(mockItems);

    // Item count should be 2 + 3 = 5
    expect(screen.getByText(/Items \(5\)/i)).toBeInTheDocument();
  });

  it('should have Proceed to Checkout button that links to /checkout', () => {
    const mockItems: CartItem[] = [
      {
        itemId: '1',
        sku: 'TEST-001',
        name: 'Test Product',
        unitPrice: 29.99,
        imageUrl: 'https://via.placeholder.com/150',
        quantity: 1,
      },
    ];

    renderCartPage(mockItems);

    const checkoutButton = screen.getByRole('link', { name: /Proceed to Checkout/i });
    expect(checkoutButton).toHaveAttribute('href', '/checkout');
  });

  it('should have Continue Shopping button in summary', () => {
    const mockItems: CartItem[] = [
      {
        itemId: '1',
        sku: 'TEST-001',
        name: 'Test Product',
        unitPrice: 29.99,
        imageUrl: 'https://via.placeholder.com/150',
        quantity: 1,
      },
    ];

    renderCartPage(mockItems);

    const continueButton = screen.getByRole('link', { name: /Continue Shopping/i });
    expect(continueButton).toHaveAttribute('href', '/catalog');
  });
});

