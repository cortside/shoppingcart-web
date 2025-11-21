/**
 * Shipping Address Form Component
 * Part of multi-step checkout flow - Step 2
 * Per Technical Specification Section 5.2 and FR-015
 */

import { useState, useCallback, memo } from 'react';
import type { Address } from '../../../types/Orders';
import { validateRequired, validatePostalCode } from '../../../utils/validation';
import Button from '../../../components/common/Button';

interface ShippingAddressFormProps {
  readonly onContinue: (address: Address) => void;
  readonly onBack: () => void;
  readonly initialData?: Address;
}

interface FormErrors {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

/**
 * ShippingAddressForm Component
 * Collects shipping address during checkout
 */
const ShippingAddressForm = memo(function ShippingAddressForm({ onContinue, onBack, initialData }: ShippingAddressFormProps) {
  // Form state with default country
  const [formData, setFormData] = useState<Address>(
    initialData || {
      street: '',
      city: '',
      state: '',
      country: 'USA',
      zipCode: '',
    }
  );

  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * Handle input change
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    // Validate street
    const streetError = validateRequired(formData.street, 'Street address');
    if (streetError) {
      newErrors.street = streetError;
    }

    // Validate city
    const cityError = validateRequired(formData.city, 'City');
    if (cityError) {
      newErrors.city = cityError;
    }

    // Validate state
    const stateError = validateRequired(formData.state, 'State');
    if (stateError) {
      newErrors.state = stateError;
    }

    // Validate country
    const countryError = validateRequired(formData.country, 'Country');
    if (countryError) {
      newErrors.country = countryError;
    }

    // Validate zipCode
    const zipCodeRequiredError = validateRequired(formData.zipCode, 'ZIP code');
    if (zipCodeRequiredError) {
      newErrors.zipCode = zipCodeRequiredError;
    } else {
      // Country-aware postal code validation
      const postalCodeError = validatePostalCode(formData.zipCode, formData.country);
      if (postalCodeError) {
        newErrors.zipCode = postalCodeError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onContinue(formData);
    }
  }, [validateForm, onContinue, formData]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Street Address */}
        <div>
          <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
            Street Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="street"
            name="street"
            value={formData.street}
            onChange={handleChange}
            placeholder="123 Main Street"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.street ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={!!errors.street}
            aria-describedby={errors.street ? 'street-error' : undefined}
          />
          {errors.street && (
            <p id="street-error" className="mt-1 text-sm text-red-600">
              {errors.street}
            </p>
          )}
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Denver"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={!!errors.city}
            aria-describedby={errors.city ? 'city-error' : undefined}
          />
          {errors.city && (
            <p id="city-error" className="mt-1 text-sm text-red-600">
              {errors.city}
            </p>
          )}
        </div>

        {/* State and ZIP Code - Two columns on larger screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* State */}
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="CO"
              maxLength={2}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.state ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-invalid={!!errors.state}
              aria-describedby={errors.state ? 'state-error' : undefined}
            />
            {errors.state && (
              <p id="state-error" className="mt-1 text-sm text-red-600">
                {errors.state}
              </p>
            )}
          </div>

          {/* ZIP Code */}
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              placeholder="80014"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.zipCode ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-invalid={!!errors.zipCode}
              aria-describedby={errors.zipCode ? 'zipCode-error' : undefined}
            />
            {errors.zipCode && (
              <p id="zipCode-error" className="mt-1 text-sm text-red-600">
                {errors.zipCode}
              </p>
            )}
          </div>
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country <span className="text-red-500">*</span>
          </label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.country ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={!!errors.country}
            aria-describedby={errors.country ? 'country-error' : undefined}
          >
            <option value="USA">United States</option>
            <option value="CAN">Canada</option>
            <option value="MEX">Mexico</option>
          </select>
          {errors.country && (
            <p id="country-error" className="mt-1 text-sm text-red-600">
              {errors.country}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button type="button" variant="secondary" onClick={onBack}>
            Back to Customer Info
          </Button>
          <Button type="submit" variant="primary">
            Continue to Review
          </Button>
        </div>
      </form>
    </div>
  );
});

ShippingAddressForm.displayName = 'ShippingAddressForm';

export default ShippingAddressForm;
