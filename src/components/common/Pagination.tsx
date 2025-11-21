/**
 * Reusable Pagination Component
 * Per Phase 7 Plan - Pagination Component
 */

import { memo, useCallback } from 'react';

interface PaginationProps {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly onPageChange: (page: number) => void;
}

/**
 * Pagination component with Previous/Next buttons and page indicator
 */
export const Pagination = memo<PaginationProps>(({ currentPage, totalPages, onPageChange }) => {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const handlePrevious = useCallback(() => {
    if (hasPrevious) {
      onPageChange(currentPage - 1);
    }
  }, [hasPrevious, onPageChange, currentPage]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      onPageChange(currentPage + 1);
    }
  }, [hasNext, onPageChange, currentPage]);

  // Don't render pagination if there's only one page or no pages
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-4 py-4">
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={!hasPrevious}
        className={`px-4 py-2 rounded transition ${
          hasPrevious
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        aria-label="Previous page"
      >
        ← Previous
      </button>

      {/* Page Indicator */}
      <span className="text-gray-700">
        Page {currentPage} of {totalPages}
      </span>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={!hasNext}
        className={`px-4 py-2 rounded transition ${
          hasNext
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        aria-label="Next page"
      >
        Next →
      </button>
    </div>
  );
});

Pagination.displayName = 'Pagination';
