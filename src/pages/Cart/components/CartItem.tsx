/**
 * CartItem Component
 * Displays a single cart item with quantity controls and remove button.
 * Used in shopping cart list - memoized to prevent unnecessary re-renders.
 * Per Phase 4 Plan and FR-007 through FR-011
 *
 * @param item - Cart item data
 * @param onUpdateQuantity - Callback to update item quantity
 * @param onRemove - Callback to remove item from cart
 */

import { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { CartItem as CartItemType } from '../../../types/Cart';
import QuantitySelector from '../../ProductDetail/components/QuantitySelector';

interface CartItemProps {
  readonly item: CartItemType;
  readonly onUpdateQuantity: (sku: string, quantity: number) => void;
  readonly onRemove: (sku: string) => void;
}

export const CartItem = memo(function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const itemTotal = item.unitPrice * item.quantity;

  const handleQuantityChange = useCallback((newQuantity: number) => {
    onUpdateQuantity(item.sku, newQuantity);
  }, [onUpdateQuantity, item.sku]);

  const handleRemove = useCallback(() => {
    onRemove(item.sku);
  }, [onRemove, item.sku]);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
      {/* Product Image */}
      <Link to={`/product/${item.sku}`} className="flex-shrink-0">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-24 h-24 object-cover rounded-lg shadow-sm hover:opacity-80 transition-opacity"
        />
      </Link>

      {/* Product Details */}
      <div className="flex-grow min-w-0">
        <Link
          to={`/product/${item.sku}`}
          className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
        >
          {item.name}
        </Link>
        <p className="text-sm text-gray-500 mt-1">SKU: {item.sku}</p>
        <p className="text-base font-medium text-gray-700 mt-2">${item.unitPrice.toFixed(2)}</p>
      </div>

      {/* Quantity Controls (Desktop) */}
      <div className="hidden sm:flex items-center gap-4">
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500 mb-1">Quantity</span>
          <QuantitySelector value={item.quantity} onChange={handleQuantityChange} min={1} max={99} />
        </div>
      </div>

      {/* Item Total (Desktop) */}
      <div className="hidden sm:block text-right min-w-[100px]">
        <p className="text-lg font-bold text-gray-900">${itemTotal.toFixed(2)}</p>
      </div>

      {/* Remove Button (Desktop) */}
      <button
        type="button"
        onClick={handleRemove}
        className="hidden sm:block p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        aria-label={`Remove ${item.name} from cart`}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>

      {/* Mobile Layout: Quantity, Total, and Remove */}
      <div className="sm:hidden flex items-center justify-between w-full gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 mb-1">Quantity</span>
          <QuantitySelector value={item.quantity} onChange={handleQuantityChange} min={1} max={99} />
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-lg font-bold text-gray-900">${itemTotal.toFixed(2)}</p>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label={`Remove ${item.name} from cart`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});

CartItem.displayName = 'CartItem';

export default CartItem;
