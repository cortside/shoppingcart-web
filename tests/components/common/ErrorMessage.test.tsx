import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorMessage from '@/components/common/ErrorMessage';

describe('ErrorMessage', () => {
  it('should render error message', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should show retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Error occurred" onRetry={onRetry} />);
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  it('should not show retry button when onRetry is not provided', () => {
    render(<ErrorMessage message="Error occurred" />);
    expect(screen.queryByText('Try again')).not.toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorMessage message="Error occurred" onRetry={onRetry} />);

    await user.click(screen.getByText('Try again'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should have error role', () => {
    render(<ErrorMessage message="Error occurred" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
