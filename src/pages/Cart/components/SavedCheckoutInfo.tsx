/**
 * SavedCheckoutInfo Component
 * Displays saved customer and shipping information from previous checkout attempts
 */

import { memo } from 'react';
import type { CustomerInput } from '../../../types/Customer';
import type { Address } from '../../../types/Orders';

interface SavedCheckoutInfoProps {
  readonly customerInfo: CustomerInput | null;
  readonly shippingAddress: Address | null;
  readonly onClearData: () => void;
}

const SavedCheckoutInfo = memo(function SavedCheckoutInfo({ customerInfo, shippingAddress, onClearData }: SavedCheckoutInfoProps) {
  // Don't render if no saved data
  if (!customerInfo && !shippingAddress) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-sm font-semibold text-blue-900">Saved Checkout Information</h3>
        </div>
        <button
          onClick={onClearData}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
          aria-label="Clear saved checkout information"
        >
          Clear
        </button>
      </div>

      <p className="text-xs text-blue-700 mb-3">
        We've saved your information from a previous checkout. You can continue where you left off!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {/* Customer Information */}
        {customerInfo && (
          <div className="bg-white rounded p-3 border border-blue-100">
            <h4 className="font-semibold text-gray-900 mb-2 text-xs uppercase tracking-wide">Customer Info</h4>
            <p className="text-gray-700">
              {customerInfo.firstName} {customerInfo.lastName}
            </p>
            <p className="text-gray-600 text-xs">{customerInfo.email}</p>
            <p className="text-gray-600 text-xs">Born: {customerInfo.birthDate}</p>
          </div>
        )}

        {/* Shipping Address */}
        {shippingAddress && (
          <div className="bg-white rounded p-3 border border-blue-100">
            <h4 className="font-semibold text-gray-900 mb-2 text-xs uppercase tracking-wide">Shipping Address</h4>
            <p className="text-gray-700">{shippingAddress.street}</p>
            <p className="text-gray-700">
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
            </p>
            <p className="text-gray-600 text-xs">{shippingAddress.country}</p>
          </div>
        )}
      </div>
    </div>
  );
});

SavedCheckoutInfo.displayName = 'SavedCheckoutInfo';

export default SavedCheckoutInfo;
