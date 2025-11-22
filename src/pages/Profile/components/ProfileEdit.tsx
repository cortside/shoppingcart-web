/**
 * Profile Edit Component
 * Form for editing customer information
 * Per FR-022 and Technical Specification Section 5.2.5
 */

import { useState, useCallback, memo, type FormEvent, type ChangeEvent } from 'react';
import type { Customer, CustomerInput } from '../../../types/Customer';
import { validateEmail, validateRequired } from '../../../utils/validation';
import Button from '../../../components/common/Button';
import ErrorMessage from '../../../components/common/ErrorMessage';

interface ProfileEditProps {
  readonly customer: Customer;
  readonly onSave: (updates: CustomerInput) => Promise<void>;
  readonly onCancel: () => void;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  birthDate?: string;
}

/**
 * Validate name field (1-100 chars)
 */
function validateName(value: string, fieldName: string): string | undefined {
  const requiredError = validateRequired(value, fieldName);
  if (requiredError) {
    return requiredError;
  }
  if (value.length > 100) {
    return `${fieldName} must be 100 characters or less`;
  }
  return undefined;
}

/**
 * Validate birthdate field
 */
function validateBirthDate(value: string): string | undefined {
  const requiredError = validateRequired(value, 'Birth date');
  if (requiredError) {
    return requiredError;
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (datePattern.test(value)) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Please enter a valid date';
    }
  } else {
    return 'Birth date must be in format YYYY-MM-DD';
  }
  return undefined;
}

/**
 * ProfileEdit Component
 * Provides form for editing customer details with validation
 * Memoized to prevent re-renders when props haven't changed
 */
export const ProfileEdit = memo(function ProfileEdit({ customer, onSave, onCancel }: ProfileEditProps) {
  // Initialize form with existing customer data
  // Note: birthDate needs to be provided as it's required but not in Customer model
  const [formData, setFormData] = useState<CustomerInput>({
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    birthDate: '', // Required field but not available from GET /customers API
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Handle input change
   */
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    setErrors((prev) => {
      if (prev[name as keyof FormErrors]) {
        return { ...prev, [name]: undefined };
      }
      return prev;
    });
  }, []);

  /**
   * Validate form
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Validate firstName
    newErrors.firstName = validateName(formData.firstName, 'First name');

    // Validate lastName
    newErrors.lastName = validateName(formData.lastName, 'Last name');

    // Validate email
    const emailRequiredError = validateRequired(formData.email, 'Email');
    newErrors.email = emailRequiredError || validateEmail(formData.email);

    // Validate birthDate
    newErrors.birthDate = validateBirthDate(formData.birthDate);

    // Remove undefined errors
    for (const key of Object.keys(newErrors)) {
      if (!newErrors[key as keyof FormErrors]) {
        delete newErrors[key as keyof FormErrors];
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setSubmitError(null);

      // Validate form
      if (!validateForm()) {
        return;
      }

      setSubmitting(true);
      try {
        await onSave(formData);
        // Success handling done by parent (Profile page)
      } catch (err) {
        console.error('Failed to update profile:', err);
        setSubmitError('Failed to update profile. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [formData, validateForm, onSave]
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-md p-6">
          {submitError && (
            <div className="mb-6">
              <ErrorMessage message={submitError} />
            </div>
          )}

          <div className="space-y-6">
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
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={submitting}
                required
                aria-required="true"
                aria-invalid={!!errors.firstName}
                aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              />
              {errors.firstName && (
                <p id="firstName-error" className="mt-1 text-sm text-red-600" role="alert">
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
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={submitting}
                required
                aria-required="true"
                aria-invalid={!!errors.lastName}
                aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              />
              {errors.lastName && (
                <p id="lastName-error" className="mt-1 text-sm text-red-600" role="alert">
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
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={submitting}
                required
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
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
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.birthDate ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={submitting}
                required
                aria-required="true"
                aria-invalid={!!errors.birthDate}
                aria-describedby={errors.birthDate ? 'birthDate-error' : undefined}
              />
              {errors.birthDate && (
                <p id="birthDate-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.birthDate}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <Button
              type="button"
              onClick={onCancel}
              variant="secondary"
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
});

ProfileEdit.displayName = 'ProfileEdit';

export default ProfileEdit;
