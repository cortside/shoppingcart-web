/**
 * Order Review Component
 * Part of multi-step checkout flow - Step 3
 * Per Technical Specification Section 5.2 and FR-016
 */

import { memo } from 'react';
import type { CustomerInput } from '../../../types/Customer';
import type { Address } from '../../../types/Orders';
import type { CartItem } from '../../../types/Cart';
import Button from '../../../components/common/Button';

interface OrderReviewProps {
  readonly customerInfo: CustomerInput;
  readonly address: Address;
  readonly items: CartItem[];
  readonly subtotal: number;
  readonly onEditCustomerInfo: () => void;
  readonly onEditAddress: () => void;
  readonly onPlaceOrder: () => void;
  readonly isSubmitting: boolean;
}

/**
 * OrderReview Component
 * Displays order summary and allows final review before submission
 */
const OrderReview = memo(function OrderReview({
  customerInfo,
  address,
  items,
  subtotal,
  onEditCustomerInfo,
  onEditAddress,
  onPlaceOrder,
  isSubmitting,
}: OrderReviewProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Review Your Order</h2>

      <div className="space-y-6">
        {/* Customer Information Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold">Customer Information</h3>
            <button
              type="button"
              onClick={onEditCustomerInfo}
              className="text-blue-600 hover:text-blue-800 text-sm"
              disabled={isSubmitting}
            >
              Edit
            </button>
          </div>
          <div className="text-gray-700 space-y-1">
            <p>
              {customerInfo.firstName} {customerInfo.lastName}
            </p>
            <p>{customerInfo.email}</p>
            <p className="text-sm text-gray-600">Birth Date: {customerInfo.birthDate}</p>
          </div>
        </div>

        {/* Shipping Address Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold">Shipping Address</h3>
            <button
              type="button"
              onClick={onEditAddress}
              className="text-blue-600 hover:text-blue-800 text-sm"
              disabled={isSubmitting}
            >
              Edit
            </button>
          </div>
          <div className="text-gray-700 space-y-1">
            <p>{address.street}</p>
            <p>
              {address.city}, {address.state} {address.zipCode}
            </p>
            <p>{address.country}</p>
          </div>
        </div>

        {/* Order Items Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Order Items</h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.sku} className="flex justify-between items-start py-2 border-b border-gray-200 last:border-b-0">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                  <p className="text-sm text-gray-600">
                    ${item.unitPrice.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal */}
          <div className="mt-4 pt-4 border-t-2 border-gray-300">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">Subtotal</p>
              <p className="text-xl font-bold">${subtotal.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <div className="flex justify-end pt-4">
          <Button type="button" variant="primary" onClick={onPlaceOrder} disabled={isSubmitting}>
            {isSubmitting ? 'Placing Order...' : 'Place Order'}
          </Button>
        </div>
      </div>
    </div>
  );
});

OrderReview.displayName = 'OrderReview';

export default OrderReview;
