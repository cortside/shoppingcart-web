/**
 * Cart Page
 * View and manage shopping cart items
 * Per FR-007 through FR-011 and Phase 4 Plan
 */

import { useState, useCallback } from 'react';
import { useCart } from '../../contexts/CartContext';
import { loadCheckoutData, clearCheckoutData } from '../../utils/storage';
import CartItem from './components/CartItem';
import CartSummary from './components/CartSummary';
import EmptyCart from './components/EmptyCart';
import SavedCheckoutInfo from './components/SavedCheckoutInfo';
import type { CustomerInput } from '../../types/Customer';
import type { Address } from '../../types/Orders';

export default function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart();

  // Use lazy initialization to load saved checkout data
  const [savedCustomerInfo, setSavedCustomerInfo] = useState<CustomerInput | null>(() => {
    const savedData = loadCheckoutData();
    return savedData?.customerInfo ?? null;
  });

  const [savedShippingAddress, setSavedShippingAddress] = useState<Address | null>(() => {
    const savedData = loadCheckoutData();
    return savedData?.shippingAddress ?? null;
  });

  // Handle clearing saved checkout data
  const handleClearCheckoutData = useCallback(() => {
    clearCheckoutData();
    setSavedCustomerInfo(null);
    setSavedShippingAddress(null);
  }, []);

  // Show empty cart state if no items
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      {/* Saved Checkout Information */}
      <SavedCheckoutInfo
        customerInfo={savedCustomerInfo}
        shippingAddress={savedShippingAddress}
        onClearData={handleClearCheckoutData}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items Section (2/3 width on desktop) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            {/* Desktop Header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 font-semibold text-gray-700 text-sm">
              <div className="col-span-5">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-1 text-right">Remove</div>
            </div>

            {/* Cart Items List */}
            <div>
              {items.map((item) => (
                <CartItem key={item.sku} item={item} onUpdateQuantity={updateQuantity} onRemove={removeItem} />
              ))}
            </div>
          </div>
        </div>

        {/* Cart Summary Section (1/3 width on desktop) */}
        <div className="lg:col-span-1">
          <CartSummary subtotal={subtotal} itemCount={itemCount} />
        </div>
      </div>
    </div>
  );
}

