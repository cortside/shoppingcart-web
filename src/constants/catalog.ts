/**
 * Catalog configuration constants
 * Per Phase 9 code review - extracted magic numbers
 */

export const CATALOG_CONFIG = {
  /**
   * Default number of items per page in catalog
   */
  DEFAULT_PAGE_SIZE: 12,

  /**
   * Debounce delay for search input (milliseconds)
   */
  SEARCH_DEBOUNCE_DELAY: 300,
} as const;
