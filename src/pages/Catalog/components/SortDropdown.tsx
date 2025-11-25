/**
 * SortDropdown Component
 * Dropdown for sorting catalog items.
 * Memoized to prevent re-renders when parent re-renders but props haven't changed.
 *
 * @param value - Current sort value
 * @param onChange - Callback when sort value changes (MUST be memoized with useCallback)
 */

import { memo } from 'react';

interface SortDropdownProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
}

export const SortDropdown = memo(function SortDropdown({ value, onChange }: SortDropdownProps) {
  const sortOptions = [
    { value: 'name', label: 'Name: A to Z' },
    { value: 'name desc', label: 'Name: Z to A' },
    { value: 'unitPrice', label: 'Price: Low to High' },
    { value: 'unitPrice desc', label: 'Price: High to Low' },
  ];

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm font-medium text-gray-700 whitespace-nowrap">
        Sort by:
      </label>
      <select
        id="sort"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        aria-label="Sort products"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
});

SortDropdown.displayName = 'SortDropdown';

export default SortDropdown;
