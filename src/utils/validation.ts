/**
 * Client-side validation utilities
 * Per Technical Specification Section 8.2
 */

/**
 * Validate email format (basic check)
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  // Basic email regex - matches most valid email formats
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate birthdate format (YYYY-MM-DD)
 */
export function isValidBirthdate(date: string): boolean {
  if (!date) return false;
  // Check format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;

  // Verify it's a valid date and matches input exactly
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return false;
  // Ensure parsed date matches input string (no silent correction)
  return parsedDate.toISOString().slice(0, 10) === date;
}

/**
 * Check if value is provided (not null, undefined, or empty string)
 */
export function isRequired(value: string | undefined | null): boolean {
  return value !== null && value !== undefined && value.trim() !== '';
}

/**
 * Validate required field - returns error message if invalid
 */
export function validateRequired(value: string | undefined | null, fieldName: string): string | undefined {
  if (!isRequired(value)) {
    return `${fieldName} is required`;
  }
  return undefined;
}

/**
 * Validate email format - returns error message if invalid
 */
export function validateEmail(email: string): string | undefined {
  if (!isValidEmail(email)) {
    return 'Please enter a valid email address';
  }
  return undefined;
}

/**
 * Validate postal code based on country
 * Supports US ZIP codes, Canadian postal codes, and Mexican postal codes
 */
export function validatePostalCode(code: string, country: string): string | undefined {
  if (!code || code.trim() === '') {
    return country === 'USA' ? 'Please enter a valid ZIP code' : 'Please enter a valid postal code';
  }

  switch (country) {
    case 'USA':
      // US ZIP: 12345 or 12345-6789
      if (!/^\d{5}(-\d{4})?$/.test(code)) {
        return 'Please enter a valid ZIP code';
      }
      break;

    case 'CAN':
      // Canadian postal code: K1A 0B1 (letter-number-letter space number-letter-number)
      // First letter cannot be D, F, I, O, Q, or U
      if (!/^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ] \d[ABCEGHJKLMNPRSTVWXYZ]\d$/i.test(code)) {
        return 'Please enter a valid postal code';
      }
      break;

    case 'MEX':
      // Mexican postal code: 5 digits
      if (!/^\d{5}$/.test(code)) {
        return 'Please enter a valid postal code';
      }
      break;

    default:
      // For other countries, just ensure it's not empty
      if (code.trim() === '') {
        return 'Please enter a valid postal code';
      }
  }

  return undefined;
}
