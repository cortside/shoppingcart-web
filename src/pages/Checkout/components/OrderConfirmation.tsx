/**
 * Order Confirmation Component
 * Displayed after successful order placement
 * Per FR-017 and FR-018
 */

import { Link } from 'react-router-dom';
import Button from '../../../components/common/Button';

interface OrderConfirmationProps {
  readonly orderResourceId: string;
}

/**
 * OrderConfirmation Component
 * Success page shown after order is placed
 */
export default function OrderConfirmation({ orderResourceId }: OrderConfirmationProps) {
  return (
    <div className="max-w-2xl mx-auto text-center py-12">
      {/* Success Icon */}
      <div className="mb-6">
        <svg
          className="mx-auto h-16 w-16 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      {/* Success Message */}
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>

      <p className="text-lg text-gray-600 mb-8">
        Thank you for your order. We've received your order and will begin processing it shortly.
      </p>

      {/* Order ID */}
      <div className="bg-gray-50 p-4 rounded-lg mb-8">
        <p className="text-sm text-gray-600 mb-1">Order ID</p>
        <p className="text-lg font-mono font-semibold text-gray-900">{orderResourceId}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to={`/account/orders/${orderResourceId}`}>
          <Button variant="primary">View Order Details</Button>
        </Link>
        <Link to="/catalog">
          <Button variant="secondary">Continue Shopping</Button>
        </Link>
      </div>

      {/* Additional Information */}
      <div className="mt-12 text-left bg-blue-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">What's Next?</h2>
        <ul className="text-gray-700 space-y-2 list-disc list-inside">
          <li>You can view your order details in your order history</li>
          <li>We'll send updates about your order status</li>
          <li>Your order will be processed and prepared for shipping</li>
        </ul>
      </div>
    </div>
  );
}
