/**
 * CartSummary component
 * Displays cart subtotal and "Proceed to Checkout" button
 * Per Phase 4 Plan and FR-010, FR-011
 */

import { Link } from 'react-router-dom';
import Button from '../../../components/common/Button';

interface CartSummaryProps {
  readonly subtotal: number;
  readonly itemCount: number;
}

export default function CartSummary({ subtotal, itemCount }: CartSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>Items ({itemCount})</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-3">
        <Link to="/checkout" className="block">
          <Button variant="primary" className="w-full">
            Proceed to Checkout
          </Button>
        </Link>

        <Link to="/catalog" className="block">
          <Button variant="secondary" className="w-full">
            Continue Shopping
          </Button>
        </Link>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Taxes and shipping calculated at checkout
      </p>
    </div>
  );
}
