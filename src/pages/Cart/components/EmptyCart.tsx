/**
 * EmptyCart component
 * Displays empty cart state with link to catalog
 * Per Phase 4 Plan and UX-002
 */

import { Link } from 'react-router-dom';
import Button from '../../../components/common/Button';

export default function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Empty Cart Icon */}
      <div className="mb-6">
        <svg
          className="h-32 w-32 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>

      {/* Empty State Message */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Looks like you haven't added any items to your cart yet. Browse our catalog to discover premium products.
      </p>

      {/* Continue Shopping Button */}
      <Link to="/catalog">
        <Button variant="primary" className="px-8">
          Continue Shopping
        </Button>
      </Link>
    </div>
  );
}
