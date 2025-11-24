/**
 * CartContext Tests
 * Comprehensive test coverage for shopping cart state management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../../src/contexts/CartContext';
import type { CatalogItem } from '../../src/types/Catalog';
import * as storage from '../../src/utils/storage';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
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

// Mock storage utils
vi.mock('../../src/utils/storage', () => ({
  loadCart: vi.fn(() => null),
  saveCart: vi.fn(),
  clearCart: vi.fn(),
}));

// Sample catalog items for testing
const sampleItem1: CatalogItem = {
  itemId: '1',
  sku: 'WIDGET-001',
  name: 'Test Widget',
  description: 'A test widget',
  unitPrice: 19.99,
  imageUrl: 'https://example.com/widget.jpg',
};

const sampleItem2: CatalogItem = {
  itemId: '2',
  sku: 'GADGET-002',
  name: 'Test Gadget',
  description: 'A test gadget',
  unitPrice: 29.99,
  imageUrl: 'https://example.com/gadget.jpg',
};

const sampleItem3: CatalogItem = {
  itemId: '3',
  sku: 'TOOL-003',
  name: 'Test Tool',
  description: 'A test tool',
  unitPrice: 39.99,
  imageUrl: 'https://example.com/tool.jpg',
};

describe('CartContext', () => {
  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();
    mockLocalStorage.clear();
    vi.mocked(storage.loadCart).mockReturnValue(null);
  });

  describe('Initial State', () => {
    it('should initialize with empty cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      expect(result.current.items).toEqual([]);
      expect(result.current.itemCount).toBe(0);
      expect(result.current.subtotal).toBe(0);
    });

    it('should load cart from localStorage on mount', () => {
      const savedCart = [
        {
          itemId: '1',
          sku: 'WIDGET-001',
          name: 'Test Widget',
          unitPrice: 19.99,
          imageUrl: 'https://example.com/widget.jpg',
          quantity: 2,
        },
      ];

      vi.mocked(storage.loadCart).mockReturnValue(savedCart);

      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      expect(result.current.items).toEqual(savedCart);
      expect(result.current.itemCount).toBe(2);
      expect(result.current.subtotal).toBe(39.98);
    });
  });

  describe('addItem', () => {
    it('should add new item to cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addItem(sampleItem1, 2);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0]).toMatchObject({
        itemId: '1',
        sku: 'WIDGET-001',
        name: 'Test Widget',
        unitPrice: 19.99,
        quantity: 2,
      });
      expect(result.current.itemCount).toBe(2);
      expect(result.current.subtotal).toBe(39.98);
    });

    it('should update quantity if item already exists', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addItem(sampleItem1, 2);
      });

      act(() => {
        result.current.addItem(sampleItem1, 3);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(5); // 2 + 3
      expect(result.current.itemCount).toBe(5);
      expect(result.current.subtotal).toBeCloseTo(99.95, 2); // 19.99 * 5
    });

    it('should add multiple different items', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addItem(sampleItem1, 1);
      });

      act(() => {
        result.current.addItem(sampleItem2, 2);
      });

      act(() => {
        result.current.addItem(sampleItem3, 3);
      });

      expect(result.current.items).toHaveLength(3);
      expect(result.current.itemCount).toBe(6); // 1 + 2 + 3
      expect(result.current.subtotal).toBeCloseTo(199.94, 2); // 19.99 + (29.99*2) + (39.99*3) = 199.94
    });

    it('should save cart to localStorage after adding item', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addItem(sampleItem1, 1);
      });

      expect(storage.saveCart).toHaveBeenCalled();
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addItem(sampleItem1, 2);
      });

      act(() => {
        result.current.updateQuantity('WIDGET-001', 5);
      });

      expect(result.current.items[0].quantity).toBe(5);
      expect(result.current.itemCount).toBe(5);
      expect(result.current.subtotal).toBeCloseTo(99.95, 2);
    });

    it('should remove item if quantity is 0', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addItem(sampleItem1, 2);
        result.current.addItem(sampleItem2, 1);
      });

      expect(result.current.items).toHaveLength(2);

      act(() => {
        result.current.updateQuantity('WIDGET-001', 0);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].sku).toBe('GADGET-002');
    });

    it('should remove item if quantity is negative', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addItem(sampleItem1, 2);
      });

      act(() => {
        result.current.updateQuantity('WIDGET-001', -1);
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.itemCount).toBe(0);
    });

    it('should not affect other items when updating quantity', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addItem(sampleItem1, 2);
        result.current.addItem(sampleItem2, 3);
      });

      act(() => {
        result.current.updateQuantity('WIDGET-001', 5);
      });

      expect(result.current.items[0].quantity).toBe(5);
      expect(result.current.items[1].quantity).toBe(3); // Unchanged
    });

    it('should handle updating non-existent item gracefully', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addItem(sampleItem1, 2);
      });

      act(() => {
        result.current.updateQuantity('NON-EXISTENT-SKU', 5);
      });

      // Should not crash, items unchanged
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].sku).toBe('WIDGET-001');
    });

    it('should save cart to localStorage after updating quantity', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addItem(sampleItem1, 2);
      });

      vi.clearAllMocks(); // Clear previous saveCart calls

      act(() => {
        result.current.updateQuantity('WIDGET-001', 5);
      });

      expect(storage.saveCart).toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addItem(sampleItem1, 2);
        result.current.addItem(sampleItem2, 3);
      });

      act(() => {
        result.current.removeItem('WIDGET-001');
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].sku).toBe('GADGET-002');
      expect(result.current.itemCount).toBe(3);
      expect(result.current.subtotal).toBe(89.97); // 29.99 * 3
    });

    it('should handle removing non-existent item gracefully', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addItem(sampleItem1, 2);
      });

      act(() => {
        result.current.removeItem('NON-EXISTENT-SKU');
      });

      // Should not crash, items unchanged
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].sku).toBe('WIDGET-001');
    });

    it('should save cart to localStorage after removing item', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addItem(sampleItem1, 2);
        result.current.addItem(sampleItem2, 3);
      });

      vi.clearAllMocks();

      act(() => {
        result.current.removeItem('WIDGET-001');
      });

      expect(storage.saveCart).toHaveBeenCalled();
    });
  });

  describe('clearCart', () => {
    it('should remove all items from cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addItem(sampleItem1, 2);
        result.current.addItem(sampleItem2, 3);
        result.current.addItem(sampleItem3, 1);
      });

      expect(result.current.items).toHaveLength(3);

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.itemCount).toBe(0);
      expect(result.current.subtotal).toBe(0);
    });

    it('should call clearCart storage utility', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addItem(sampleItem1, 2);
      });

      act(() => {
        result.current.clearCart();
      });

      expect(storage.clearCart).toHaveBeenCalled();
    });

    it('should handle clearing empty cart gracefully', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
      expect(storage.clearCart).toHaveBeenCalled();
    });
  });

  describe('Derived Values', () => {
    it('should calculate itemCount correctly', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addItem(sampleItem1, 2);
        result.current.addItem(sampleItem2, 3);
        result.current.addItem(sampleItem3, 5);
      });

      expect(result.current.itemCount).toBe(10); // 2 + 3 + 5
    });

    it('should calculate subtotal correctly', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addItem(sampleItem1, 2); // 19.99 * 2 = 39.98
        result.current.addItem(sampleItem2, 3); // 29.99 * 3 = 89.97
        result.current.addItem(sampleItem3, 1); // 39.99 * 1 = 39.99
      });

      // Total: 39.98 + 89.97 + 39.99 = 169.94
      expect(result.current.subtotal).toBeCloseTo(169.94, 2);
    });

    it('should update derived values when items change', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addItem(sampleItem1, 5);
      });

      expect(result.current.itemCount).toBe(5);
      expect(result.current.subtotal).toBeCloseTo(99.95, 2);

      act(() => {
        result.current.updateQuantity('WIDGET-001', 10);
      });

      expect(result.current.itemCount).toBe(10);
      expect(result.current.subtotal).toBeCloseTo(199.9, 2);

      act(() => {
        result.current.removeItem('WIDGET-001');
      });

      expect(result.current.itemCount).toBe(0);
      expect(result.current.subtotal).toBe(0);
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should persist cart to localStorage on every change', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      // Add item
      act(() => {
        result.current.addItem(sampleItem1, 2);
      });
      expect(storage.saveCart).toHaveBeenCalled();

      vi.clearAllMocks();

      // Update quantity
      act(() => {
        result.current.updateQuantity('WIDGET-001', 5);
      });
      expect(storage.saveCart).toHaveBeenCalled();

      vi.clearAllMocks();

      // Add another item
      act(() => {
        result.current.addItem(sampleItem2, 1);
      });
      expect(storage.saveCart).toHaveBeenCalled();

      vi.clearAllMocks();

      // Remove item
      act(() => {
        result.current.removeItem('WIDGET-001');
      });
      expect(storage.saveCart).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle adding item with quantity 0', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addItem(sampleItem1, 0);
      });

      // Should add item with quantity 0 (edge case behavior)
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(0);
    });

    it('should handle very large quantities', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addItem(sampleItem1, 1000000);
      });

      expect(result.current.itemCount).toBe(1000000);
      expect(result.current.subtotal).toBe(19990000); // 19.99 * 1000000
    });

    it('should handle decimal prices correctly', () => {
      const decimalItem: CatalogItem = {
        itemId: '4',
        sku: 'DECIMAL-004',
        name: 'Decimal Test',
        description: 'Test decimal pricing',
        unitPrice: 0.99,
        imageUrl: 'https://example.com/decimal.jpg',
      };

      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addItem(decimalItem, 3);
      });

      expect(result.current.subtotal).toBeCloseTo(2.97, 2);
    });
  });

  describe('useCart Hook', () => {
    it('should throw error when used outside CartProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useCart());
      }).toThrow('useCart must be used within a CartProvider');

      consoleSpy.mockRestore();
    });
  });
});
