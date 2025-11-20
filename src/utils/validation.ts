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

  // Verify it's a valid date
  const parsedDate = new Date(date);
  return !Number.isNaN(parsedDate.getTime());
}

/**
 * Check if value is provided (not null, undefined, or empty string)
 */
export function isRequired(value: string | undefined | null): boolean {
  return value !== null && value !== undefined && value.trim() !== '';
}
