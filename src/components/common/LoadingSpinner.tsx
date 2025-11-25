/**
 * LoadingSpinner Component
 * Centered spinner for loading states.
 * Memoized for consistency and to prevent unnecessary re-renders.
 */

import { memo } from 'react';

export const LoadingSpinner = memo(function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" aria-label="Loading"></div>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
