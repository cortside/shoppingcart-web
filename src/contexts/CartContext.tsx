/**
 * CartContext for shopping cart state management
 * Per Technical Specification Sections 7.2-7.3
 */

import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import type { CartItem } from '../types/Cart';
import type { CatalogItem } from '../types/Catalog';
import { loadCart, saveCart, clearCart as clearStoredCart } from '../utils/storage';

interface CartContextValue {
  // State
  items: CartItem[];

  // Derived values
  itemCount: number;
  subtotal: number;

  // Methods
  addItem: (item: CatalogItem, quantity: number) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  removeItem: (sku: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

interface CartProviderProps {
  readonly children: ReactNode;
}

/**
 * CartProvider component
 * Manages shopping cart state with localStorage persistence
 */
export function CartProvider({ children }: CartProviderProps) {
  // Initialize cart from localStorage on mount
  const [items, setItems] = useState<CartItem[]>(() => {
    const storedCart = loadCart();
    return storedCart ?? [];
  });

  // Persist cart to localStorage whenever items change
  useEffect(() => {
    saveCart(items);
  }, [items]);

  /**
   * Add item to cart or update quantity if already exists
   */
  const addItem = useCallback((item: CatalogItem, quantity: number) => {
    setItems((currentItems) => {
      const existingItemIndex = currentItems.findIndex((i) => i.sku === item.sku);

      if (existingItemIndex >= 0) {
        // Item already in cart - update quantity
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
        return updatedItems;
      } else {
        // New item - add to cart
        const newItem: CartItem = {
          itemId: item.itemId,
          sku: item.sku,
          name: item.name,
          unitPrice: item.unitPrice,
          imageUrl: item.imageUrl,
          quantity,
        };
        return [...currentItems, newItem];
      }
    });
  }, []);

  /**
   * Update quantity of an item in cart
   * If quantity is 0 or less, remove the item
   */
  const updateQuantity = useCallback((sku: string, quantity: number) => {
    if (quantity <= 0) {
      // Inline removal logic to avoid circular dependency
      setItems((currentItems) => currentItems.filter((item) => item.sku !== sku));
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.sku === sku ? { ...item, quantity } : item
      )
    );
  }, []);

  /**
   * Remove item from cart
   */
  const removeItem = useCallback((sku: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.sku !== sku));
  }, []);

  /**
   * Clear all items from cart
   */
  const clearCart = useCallback(() => {
    setItems([]);
    clearStoredCart();
  }, []);

  // Calculate derived values
  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    [items]
  );

  const value: CartContextValue = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, itemCount, subtotal, addItem, updateQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Hook to access CartContext
 * @throws Error if used outside CartProvider
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
