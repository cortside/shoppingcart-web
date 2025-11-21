/**
 * Customer Information Form Component
 * Part of multi-step checkout flow - Step 1
 * Per Technical Specification Section 5.2 and FR-014
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getCustomer } from '../../../api/shoppingCartApi';
import type { CustomerInput } from '../../../types/Customer';
import { validateEmail, validateRequired } from '../../../utils/validation';
import Button from '../../../components/common/Button';
import ErrorMessage from '../../../components/common/ErrorMessage';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

interface CustomerInfoFormProps {
  readonly onContinue: (customerInfo: CustomerInput) => void;
  readonly initialData?: CustomerInput;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  birthDate?: string;
}

/**
 * CustomerInfoForm Component
 * Collects or displays customer information during checkout
 * Prefills data if user has existing customer record
 */
export default function CustomerInfoForm({ onContinue, initialData }: CustomerInfoFormProps) {
  const { customerResourceId } = useAuth();

  // Form state
  const [formData, setFormData] = useState<CustomerInput>(
    initialData || {
      firstName: '',
      lastName: '',
      email: '',
      birthDate: '',
    }
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  /**
   * Fetch and prefill customer data if customerResourceId exists
   */
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!customerResourceId || initialData) {
        return;
      }

      setLoading(true);
      setFetchError(null);

      try {
        const customer = await getCustomer(customerResourceId);

        // Prefill form with customer data
        // Note: Customer from API doesn't include birthDate, so user must enter it
        setFormData({
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          birthDate: '', // Not available from API
        });
      } catch (error) {
        console.error('Failed to fetch customer data:', error);
        setFetchError('Unable to load your saved information. Please enter your details manually.');
      } finally {
        setLoading(false);
      }
    };

    void fetchCustomerData();
  }, [customerResourceId, initialData]);

  /**
   * Handle input change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate firstName
    const firstNameError = validateRequired(formData.firstName, 'First name');
    if (firstNameError) {
      newErrors.firstName = firstNameError;
    }

    // Validate lastName
    const lastNameError = validateRequired(formData.lastName, 'Last name');
    if (lastNameError) {
      newErrors.lastName = lastNameError;
    }

    // Validate email
    const emailRequiredError = validateRequired(formData.email, 'Email');
    if (emailRequiredError) {
      newErrors.email = emailRequiredError;
    } else {
      const emailFormatError = validateEmail(formData.email);
      if (emailFormatError) {
        newErrors.email = emailFormatError;
      }
    }

    // Validate birthDate
    const birthDateError = validateRequired(formData.birthDate, 'Birth date');
    if (birthDateError) {
      newErrors.birthDate = birthDateError;
    } else {
      // Validate date format YYYY-MM-DD
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(formData.birthDate)) {
        newErrors.birthDate = 'Birth date must be in format YYYY-MM-DD';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onContinue(formData);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Customer Information</h2>

      {fetchError && (
        <div className="mb-4">
          <ErrorMessage message={fetchError} />
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
          />
          {errors.firstName && (
            <p id="firstName-error" className="mt-1 text-sm text-red-600">
              {errors.firstName}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
          />
          {errors.lastName && (
            <p id="lastName-error" className="mt-1 text-sm text-red-600">
              {errors.lastName}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        {/* Birth Date */}
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
            Birth Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.birthDate ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={!!errors.birthDate}
            aria-describedby={errors.birthDate ? 'birthDate-error' : undefined}
          />
          {errors.birthDate && (
            <p id="birthDate-error" className="mt-1 text-sm text-red-600">
              {errors.birthDate}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button type="submit" variant="primary">
            Continue to Shipping
          </Button>
        </div>
      </form>
    </div>
  );
}
