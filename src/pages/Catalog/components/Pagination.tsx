/**
 * Pagination component
 * Previous/Next buttons and page number display
 */

import { useCallback } from 'react';

interface PaginationProps {
  readonly currentPage: number;
  readonly totalItems: number;
  readonly pageSize: number;
  readonly onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalItems, pageSize, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage >= totalPages;

  const handlePrevious = useCallback(() => {
    onPageChange(currentPage - 1);
  }, [onPageChange, currentPage]);

  const handleNext = useCallback(() => {
    onPageChange(currentPage + 1);
  }, [onPageChange, currentPage]);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <button
        onClick={handlePrevious}
        disabled={isFirstPage}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
        aria-label="Previous page"
      >
        <svg
          className="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <span className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={handleNext}
        disabled={isLastPage}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
        aria-label="Next page"
      >
        <svg
          className="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
