/**
 * Storage utility for cart persistence
 * Per Technical Specification Section 7.3
 */

import type { CartItem } from '../types/Cart';

const CART_STORAGE_KEY = 'acme-cart';
const CART_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface StoredCart {
  items: CartItem[];
  timestamp: number;
}

/**
 * Load cart from localStorage
 * Returns null if cart doesn't exist or has expired
 */
export function loadCart(): CartItem[] | null {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const data: StoredCart = JSON.parse(stored);
    const now = Date.now();

    // Check if cart has expired (7 days TTL)
    if (now - data.timestamp > CART_TTL_MS) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return null;
    }

    return data.items;
  } catch (error) {
    // If there's any error parsing or accessing localStorage, return null
    console.error('Error loading cart from storage:', error);
    return null;
  }
}

/**
 * Save cart to localStorage with current timestamp
 */
export function saveCart(items: CartItem[]): void {
  try {
    const data: StoredCart = {
      items,
      timestamp: Date.now(),
    };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    // Silently fail if localStorage is unavailable or full
    console.error('Error saving cart to storage:', error);
  }
}

/**
 * Clear cart from localStorage
 */
export function clearCart(): void {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing cart from storage:', error);
  }
}
