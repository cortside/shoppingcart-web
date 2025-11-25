import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadCart,
  saveCart,
  clearCart,
  loadCheckoutData,
  saveCheckoutData,
  clearCheckoutData,
} from '@/utils/storage';
import type { CartItem } from '@/types/Cart';
import type { CustomerInput } from '@/types/Customer';
import type { Address } from '@/types/Orders';

describe('storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear any mocks
    vi.clearAllMocks();
  });

  describe('Cart Storage', () => {
    describe('saveCart', () => {
      it('should save cart items to localStorage', () => {
        const items: CartItem[] = [
          {
            itemId: '1',
            sku: 'SKU-001',
            name: 'Item 1',
            unitPrice: 10.0,
            imageUrl: '/img1.jpg',
            quantity: 2,
          },
          {
            itemId: '2',
            sku: 'SKU-002',
            name: 'Item 2',
            unitPrice: 20.0,
            imageUrl: '/img2.jpg',
            quantity: 1,
          },
        ];

        saveCart(items);

        const stored = localStorage.getItem('acme-cart');
        expect(stored).toBeTruthy();

        const parsed = JSON.parse(stored!);
        expect(parsed.items).toEqual(items);
        expect(parsed.timestamp).toBeTypeOf('number');
        expect(parsed.timestamp).toBeGreaterThan(0);
      });

      it('should update timestamp on each save', async () => {
        const items: CartItem[] = [
          {
            itemId: '1',
            sku: 'SKU-001',
            name: 'Item 1',
            unitPrice: 10.0,
            imageUrl: '/img1.jpg',
            quantity: 1,
          },
        ];

        saveCart(items);
        const stored1 = localStorage.getItem('acme-cart');
        const timestamp1 = JSON.parse(stored1!).timestamp;

        // Wait a bit
        await new Promise((resolve) => setTimeout(resolve, 10));

        saveCart(items);
        const stored2 = localStorage.getItem('acme-cart');
        const timestamp2 = JSON.parse(stored2!).timestamp;

        expect(timestamp2).toBeGreaterThan(timestamp1);
      });

      it('should handle localStorage errors gracefully', () => {
        const items: CartItem[] = [
          {
            itemId: '1',
            sku: 'SKU-001',
            name: 'Item 1',
            unitPrice: 10.0,
            imageUrl: '/img1.jpg',
            quantity: 1,
          },
        ];

        // Mock console.error and localStorage.setItem
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
          throw new Error('QuotaExceededError');
        });

        // Should not throw
        expect(() => saveCart(items)).not.toThrow();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error saving cart to storage:',
          expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
        setItemSpy.mockRestore();
      });
    });

    describe('loadCart', () => {
      it('should load cart items from localStorage', () => {
        const items: CartItem[] = [
          {
            itemId: '1',
            sku: 'SKU-001',
            name: 'Item 1',
            unitPrice: 10.0,
            imageUrl: '/img1.jpg',
            quantity: 2,
          },
          {
            itemId: '2',
            sku: 'SKU-002',
            name: 'Item 2',
            unitPrice: 20.0,
            imageUrl: '/img2.jpg',
            quantity: 1,
          },
        ];

        saveCart(items);
        const loaded = loadCart();

        expect(loaded).toEqual(items);
      });

      it('should return null if cart does not exist', () => {
        const loaded = loadCart();
        expect(loaded).toBeNull();
      });

      it('should return null and clear cart if expired (> 7 days)', () => {
        const items: CartItem[] = [
          {
            itemId: '1',
            sku: 'SKU-001',
            name: 'Item 1',
            unitPrice: 10.0,
            imageUrl: '/img1.jpg',
            quantity: 1,
          },
        ];

        // Manually create an expired cart (8 days old)
        const expiredData = {
          items,
          timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000,
        };
        localStorage.setItem('acme-cart', JSON.stringify(expiredData));

        const loaded = loadCart();

        expect(loaded).toBeNull();
        expect(localStorage.getItem('acme-cart')).toBeNull();
      });

      it('should return items if cart is not expired (< 7 days)', () => {
        const items: CartItem[] = [
          {
            itemId: '1',
            sku: 'SKU-001',
            name: 'Item 1',
            unitPrice: 10.0,
            imageUrl: '/img1.jpg',
            quantity: 1,
          },
        ];

        // Create a cart that's 6 days old
        const recentData = {
          items,
          timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000,
        };
        localStorage.setItem('acme-cart', JSON.stringify(recentData));

        const loaded = loadCart();

        expect(loaded).toEqual(items);
      });

      it('should return null on JSON parse error', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        // Store invalid JSON
        localStorage.setItem('acme-cart', 'invalid-json');

        const loaded = loadCart();

        expect(loaded).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error loading cart from storage:',
          expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
      });

      it('should handle localStorage access errors', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const getItemSpy = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
          throw new Error('localStorage unavailable');
        });

        const loaded = loadCart();

        expect(loaded).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error loading cart from storage:',
          expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
        getItemSpy.mockRestore();
      });
    });

    describe('clearCart', () => {
      it('should remove cart from localStorage', () => {
        const items: CartItem[] = [
          {
            itemId: '1',
            sku: 'SKU-001',
            name: 'Item 1',
            unitPrice: 10.0,
            imageUrl: '/img1.jpg',
            quantity: 1,
          },
        ];

        saveCart(items);
        expect(localStorage.getItem('acme-cart')).toBeTruthy();

        clearCart();
        expect(localStorage.getItem('acme-cart')).toBeNull();
      });

      it('should handle localStorage errors gracefully', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const removeItemSpy = vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
          throw new Error('localStorage error');
        });

        // Should not throw
        expect(() => clearCart()).not.toThrow();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error clearing cart from storage:',
          expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
        removeItemSpy.mockRestore();
      });
    });
  });

  describe('Checkout Data Storage', () => {
    describe('saveCheckoutData', () => {
      it('should save checkout data to localStorage', () => {
        const customerInfo: CustomerInput = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          birthDate: '1990-01-15',
        };

        const shippingAddress: Address = {
          street: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
          country: 'US',
        };

        saveCheckoutData(customerInfo, shippingAddress);

        const stored = localStorage.getItem('acme-checkout');
        expect(stored).toBeTruthy();

        const parsed = JSON.parse(stored!);
        expect(parsed.customerInfo).toEqual(customerInfo);
        expect(parsed.shippingAddress).toEqual(shippingAddress);
        expect(parsed.timestamp).toBeTypeOf('number');
        expect(parsed.timestamp).toBeGreaterThan(0);
      });

      it('should save null values', () => {
        saveCheckoutData(null, null);

        const stored = localStorage.getItem('acme-checkout');
        expect(stored).toBeTruthy();

        const parsed = JSON.parse(stored!);
        expect(parsed.customerInfo).toBeNull();
        expect(parsed.shippingAddress).toBeNull();
        expect(parsed.timestamp).toBeTypeOf('number');
      });

      it('should handle localStorage errors gracefully', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
          throw new Error('QuotaExceededError');
        });

        // Should not throw
        expect(() => saveCheckoutData(null, null)).not.toThrow();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error saving checkout data to storage:',
          expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
        setItemSpy.mockRestore();
      });
    });

    describe('loadCheckoutData', () => {
      it('should load checkout data from localStorage', () => {
        const customerInfo: CustomerInput = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          birthDate: '1990-01-15',
        };

        const shippingAddress: Address = {
          street: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
          country: 'US',
        };

        saveCheckoutData(customerInfo, shippingAddress);
        const loaded = loadCheckoutData();

        expect(loaded).toEqual({
          customerInfo,
          shippingAddress,
        });
      });

      it('should return null if checkout data does not exist', () => {
        const loaded = loadCheckoutData();
        expect(loaded).toBeNull();
      });

      it('should return null and clear data if expired (> 7 days)', () => {
        const customerInfo: CustomerInput = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          birthDate: '1990-01-15',
        };

        // Manually create expired checkout data (8 days old)
        const expiredData = {
          customerInfo,
          shippingAddress: null,
          timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000,
        };
        localStorage.setItem('acme-checkout', JSON.stringify(expiredData));

        const loaded = loadCheckoutData();

        expect(loaded).toBeNull();
        expect(localStorage.getItem('acme-checkout')).toBeNull();
      });

      it('should return data if not expired (< 7 days)', () => {
        const customerInfo: CustomerInput = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          birthDate: '1990-01-15',
        };

        // Create checkout data that's 6 days old
        const recentData = {
          customerInfo,
          shippingAddress: null,
          timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000,
        };
        localStorage.setItem('acme-checkout', JSON.stringify(recentData));

        const loaded = loadCheckoutData();

        expect(loaded).toEqual({
          customerInfo,
          shippingAddress: null,
        });
      });

      it('should return null on JSON parse error', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        // Store invalid JSON
        localStorage.setItem('acme-checkout', 'invalid-json');

        const loaded = loadCheckoutData();

        expect(loaded).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error loading checkout data from storage:',
          expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
      });

      it('should handle localStorage access errors', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const getItemSpy = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
          throw new Error('localStorage unavailable');
        });

        const loaded = loadCheckoutData();

        expect(loaded).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error loading checkout data from storage:',
          expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
        getItemSpy.mockRestore();
      });
    });

    describe('clearCheckoutData', () => {
      it('should remove checkout data from localStorage', () => {
        const customerInfo: CustomerInput = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          birthDate: '1990-01-15',
        };

        saveCheckoutData(customerInfo, null);
        expect(localStorage.getItem('acme-checkout')).toBeTruthy();

        clearCheckoutData();
        expect(localStorage.getItem('acme-checkout')).toBeNull();
      });

      it('should handle localStorage errors gracefully', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const removeItemSpy = vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
          throw new Error('localStorage error');
        });

        // Should not throw
        expect(() => clearCheckoutData()).not.toThrow();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error clearing checkout data from storage:',
          expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
        removeItemSpy.mockRestore();
      });
    });
  });
});
