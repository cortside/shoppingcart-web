/**
 * Checkout Page - Multi-step checkout flow
 * Per Technical Specification Section 5.2 and FR-014 to FR-018
 *
 * Steps:
 * 1. Customer Information (with prefill if exists)
 * 2. Shipping Address
 * 3. Order Review
 * 4. Confirmation (separate route)
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import {
  createOrderForNewCustomer,
  createOrderForExistingCustomer,
  type CreateOrderForNewCustomerPayload,
  type CreateOrderForExistingCustomerPayload,
} from '../../api/shoppingCartApi';
import type { CustomerInput } from '../../types/Customer';
import type { Address } from '../../types/Orders';
import { loadCheckoutData, saveCheckoutData, clearCheckoutData } from '../../utils/storage';
import CustomerInfoForm from './components/CustomerInfoForm';
import ShippingAddressForm from './components/ShippingAddressForm';
import OrderReview from './components/OrderReview';
import ErrorMessage from '../../components/common/ErrorMessage';

type CheckoutStep = 'customerInfo' | 'shippingAddress' | 'orderReview';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { customerResourceId, setCustomerResourceId } = useAuth();
  const { items, subtotal, clearCart } = useCart();

  // Load saved checkout data on mount
  const savedData = loadCheckoutData();

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('customerInfo');
  const [customerInfo, setCustomerInfo] = useState<CustomerInput | null>(savedData?.customerInfo || null);
  const [shippingAddress, setShippingAddress] = useState<Address | null>(savedData?.shippingAddress || null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save checkout data to localStorage whenever it changes
  useEffect(() => {
    saveCheckoutData(customerInfo, shippingAddress);
  }, [customerInfo, shippingAddress]);

  // Redirect to cart if empty - must be in useEffect to avoid render-time navigation
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  /**
   * Handle customer info form completion
   */
  const handleCustomerInfoContinue = useCallback((info: CustomerInput) => {
    setCustomerInfo(info);
    setCurrentStep('shippingAddress');
    setError(null);
  }, []);

  /**
   * Handle shipping address form completion
   */
  const handleShippingAddressContinue = useCallback((address: Address) => {
    setShippingAddress(address);
    setCurrentStep('orderReview');
    setError(null);
  }, []);

  /**
   * Handle back to customer info
   */
  const handleBackToCustomerInfo = useCallback(() => {
    setCurrentStep('customerInfo');
    setError(null);
  }, []);

  /**
   * Handle back to shipping address
   */
  const handleBackToShippingAddress = useCallback(() => {
    setCurrentStep('shippingAddress');
    setError(null);
  }, []);

  /**
   * Handle order submission
   */
  const handlePlaceOrder = useCallback(async () => {
    if (!customerInfo || !shippingAddress) {
      setError('Missing customer or address information. Please go back and complete all steps.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare order items
      const orderItems = items.map((item) => ({
        sku: item.sku,
        quantity: item.quantity,
      }));

      let order;

      if (customerResourceId) {
        // Existing customer flow
        const payload: CreateOrderForExistingCustomerPayload = {
          address: shippingAddress,
          items: orderItems,
        };

        order = await createOrderForExistingCustomer(customerResourceId, payload);
      } else {
        // New customer flow
        const payload: CreateOrderForNewCustomerPayload = {
          customer: customerInfo,
          address: shippingAddress,
          items: orderItems,
        };

        order = await createOrderForNewCustomer(payload);

        // Store customer resource ID for future orders
        if (order.customer?.customerResourceId) {
          setCustomerResourceId(order.customer.customerResourceId);
        }
      }

      // Clear cart and checkout data after successful order
      clearCart();
      clearCheckoutData();

      // Navigate to confirmation page
      navigate(`/checkout/confirmation/${order.orderResourceId}`);
    } catch (err) {
      console.error('Failed to place order:', err);

      // Handle API errors
      if (err && typeof err === 'object' && 'errors' in err) {
        const apiError = err as { errors?: Array<{ message?: string }> };
        const messages = apiError.errors?.map((e) => e.message).filter(Boolean).join(', ');
        setError(messages || 'Failed to place order. Please try again.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to place order. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [customerInfo, shippingAddress, items, customerResourceId, setCustomerResourceId, clearCart, navigate]);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className={`flex-1 ${currentStep === 'customerInfo' ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
            <div className="text-center">
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                  currentStep === 'customerInfo' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                1
              </div>
              <p className="mt-2 text-sm">Customer Info</p>
            </div>
          </div>

          <div className="flex-1 border-t-2 border-gray-300 mx-4" />

          <div className={`flex-1 ${currentStep === 'shippingAddress' ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
            <div className="text-center">
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                  currentStep === 'shippingAddress' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                2
              </div>
              <p className="mt-2 text-sm">Shipping</p>
            </div>
          </div>

          <div className="flex-1 border-t-2 border-gray-300 mx-4" />

          <div className={`flex-1 ${currentStep === 'orderReview' ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
            <div className="text-center">
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                  currentStep === 'orderReview' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                3
              </div>
              <p className="mt-2 text-sm">Review</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {currentStep === 'customerInfo' && (
          <CustomerInfoForm onContinue={handleCustomerInfoContinue} initialData={customerInfo || undefined} />
        )}

        {currentStep === 'shippingAddress' && (
          <ShippingAddressForm
            onContinue={handleShippingAddressContinue}
            onBack={handleBackToCustomerInfo}
            initialData={shippingAddress || undefined}
          />
        )}

        {currentStep === 'orderReview' && customerInfo && shippingAddress && (
          <OrderReview
            customerInfo={customerInfo}
            address={shippingAddress}
            items={items}
            subtotal={subtotal}
            onEditCustomerInfo={handleBackToCustomerInfo}
            onEditAddress={handleBackToShippingAddress}
            onPlaceOrder={handlePlaceOrder}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
