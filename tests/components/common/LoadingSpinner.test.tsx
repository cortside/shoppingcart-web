import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render loading spinner', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toBeInTheDocument();
  });

  it('should have spinning animation class', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('animate-spin');
  });
});
