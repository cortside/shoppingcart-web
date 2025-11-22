/**
 * Profile View Component
 * Displays customer information in read-only mode
 * Per FR-021 and Technical Specification Section 5.2.4
 */

import { memo } from 'react';
import type { Customer } from '../../../types/Customer';
import { formatDate } from '../../../utils/formatters';
import Button from '../../../components/common/Button';

interface ProfileViewProps {
  readonly customer: Customer;
  readonly onEdit: () => void;
}

/**
 * ProfileView Component
 * Shows customer details with an Edit button to switch to edit mode
 * Memoized to prevent re-renders when props haven't changed
 */
export const ProfileView = memo(function ProfileView({ customer, onEdit }: ProfileViewProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <Button onClick={onEdit} variant="secondary">
          Edit
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-6">
          <div>
            <div className="block text-sm font-medium text-gray-500 mb-1">
              First Name
            </div>
            <p className="text-lg text-gray-900">{customer.firstName}</p>
          </div>

          <div>
            <div className="block text-sm font-medium text-gray-500 mb-1">
              Last Name
            </div>
            <p className="text-lg text-gray-900">{customer.lastName}</p>
          </div>

          <div>
            <div className="block text-sm font-medium text-gray-500 mb-1">
              Email
            </div>
            <p className="text-lg text-gray-900">{customer.email}</p>
          </div>

          <div>
            <div className="block text-sm font-medium text-gray-500 mb-1">
              Member Since
            </div>
            <p className="text-lg text-gray-900">{formatDate(customer.createdDate)}</p>
          </div>

          <div>
            <div className="block text-sm font-medium text-gray-500 mb-1">
              Last Updated
            </div>
            <p className="text-lg text-gray-900">{formatDate(customer.lastModifiedDate)}</p>
          </div>
        </div>
      </div>
    </div>
  );
});

ProfileView.displayName = 'ProfileView';

export default ProfileView;
