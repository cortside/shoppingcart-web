/**
 * SearchBar Component
 * Search input with debounced onChange.
 * Memoized to prevent re-renders when parent re-renders but props haven't changed.
 *
 * @param value - Current search value
 * @param onChange - Callback when search value changes (MUST be memoized with useCallback)
 * @param placeholder - Placeholder text for the input
 */

import { memo, useState, useEffect } from 'react';
import { CATALOG_CONFIG } from '../../../constants/catalog';

interface SearchBarProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
}

export const SearchBar = memo(function SearchBar({ value, onChange, placeholder = 'Search by name or SKU...' }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, CATALOG_CONFIG.SEARCH_DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  // Update local value when prop changes (e.g., URL change)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div role="search" className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <input
        type="search"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
