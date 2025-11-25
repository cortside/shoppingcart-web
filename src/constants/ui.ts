/**
 * Application-wide UI constants
 * Per Phase 9 code review - extracted magic numbers to named constants
 */

/**
 * Quantity limits for product selection
 */
export const QUANTITY_LIMITS = {
  /** Minimum quantity that can be selected */
  MIN: 1,
  /** Maximum quantity that can be selected */
  MAX: 99,
} as const;

/**
 * Toast notification durations (milliseconds)
 */
export const TOAST_DURATION = {
  /** Default duration for toast messages */
  DEFAULT: 3000,
  /** Short duration for brief messages */
  SHORT: 2000,
  /** Long duration for important messages */
  LONG: 5000,
} as const;
