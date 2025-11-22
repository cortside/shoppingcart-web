/**
 * Profile Page
 * View and edit customer profile information
 * Per FR-021, FR-022 and Technical Specification Section 5.2.4, 5.2.5
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getCustomer, updateCustomer } from '../../api/shoppingCartApi';
import type { Customer, CustomerInput } from '../../types/Customer';
import ProfileView from './components/ProfileView';
import ProfileEdit from './components/ProfileEdit';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import Button from '../../components/common/Button';

// Constants
const SUCCESS_MESSAGE_DURATION = 3000; // 3 seconds

/**
 * Profile Page Component
 * Orchestrates profile view and edit modes
 * Fetches customer data and handles updates
 */
export default function ProfilePage() {
  const { customerResourceId } = useAuth();

  // Ref for success message timeout cleanup
  const successTimeoutRef = useRef<number | null>(null);

  // State
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Fetch customer data
   */
  const fetchCustomer = useCallback(async () => {
    if (!customerResourceId) {
      setError(
        'No customer profile found. To create your profile, please add items to your cart and complete checkout. Your profile will be automatically created during the checkout process.'
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getCustomer(customerResourceId);
      setCustomer(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [customerResourceId]);

  /**
   * Fetch customer on mount
   */
  useEffect(() => {
    void fetchCustomer();
  }, [fetchCustomer]);

  /**
   * Cleanup timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Handle profile update
   */
  const handleSave = useCallback(
    async (updates: CustomerInput) => {
      if (!customerResourceId) {
        setError('Cannot update profile: No customer ID found.');
        throw new Error('No customer ID');
      }

      try {
        const updated = await updateCustomer(customerResourceId, updates);
        setCustomer(updated);
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully!');
        setError(null);

        // Clear any existing timeout
        if (successTimeoutRef.current) {
          clearTimeout(successTimeoutRef.current);
        }

        // Clear success message after duration
        successTimeoutRef.current = setTimeout(() => {
          setSuccessMessage(null);
          successTimeoutRef.current = null;
        }, SUCCESS_MESSAGE_DURATION);
      } catch (err) {
        console.error('Failed to update profile:', err);
        setError('Failed to update profile. Please try again.');
        throw err; // Re-throw to let ProfileEdit handle it
      }
    },
    [customerResourceId]
  );

  /**
   * Handle cancel editing
   */
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setError(null);
  }, []);

  /**
   * Handle edit mode
   */
  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setSuccessMessage(null);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state (no customer data available)
  if (error && !customer) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <ErrorMessage message={error} />
          <Button onClick={() => void fetchCustomer()} variant="primary" className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // No customer found
  if (!customer) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Profile Found</h2>
          <p className="text-gray-600">
            You need to complete checkout to create a customer profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Success Message */}
      {successMessage && (
        <div className="max-w-2xl mx-auto px-4 pt-8">
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md mb-4">
            <p className="font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="max-w-2xl mx-auto px-4 pt-8">
          <div className="mb-4">
            <ErrorMessage message={error} />
          </div>
        </div>
      )}

      {/* View or Edit Mode */}
      {isEditing ? (
        <ProfileEdit customer={customer} onSave={handleSave} onCancel={handleCancel} />
      ) : (
        <ProfileView customer={customer} onEdit={handleEdit} />
      )}
    </>
  );
}

