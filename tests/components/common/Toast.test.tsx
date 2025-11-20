import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toast from '@/components/common/Toast';

describe('Toast', () => {

  it('should render toast with message', () => {
    const onClose = vi.fn();
    render(<Toast message="Success!" onClose={onClose} />);
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('should render success toast by default', () => {
    const onClose = vi.fn();
    render(<Toast message="Success!" onClose={onClose} />);
    const toast = screen.getByText('Success!').closest('div');
    expect(toast).toHaveClass('bg-green-500');
  });

  it('should render error toast when type is error', () => {
    const onClose = vi.fn();
    render(<Toast message="Error!" type="error" onClose={onClose} />);
    const toast = screen.getByText('Error!').closest('div');
    expect(toast).toHaveClass('bg-red-500');
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    const onClose = vi.fn();
    render(<Toast message="Success!" onClose={onClose} />);

    const closeButton = screen.getByLabelText('Close');
    await user.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should auto-close after default duration', async () => {
    const onClose = vi.fn();
    render(<Toast message="Success!" onClose={onClose} />);

    expect(onClose).not.toHaveBeenCalled();

    await waitFor(
      () => {
        expect(onClose).toHaveBeenCalledTimes(1);
      },
      { timeout: 4000 }
    );
  });

  it('should auto-close after custom duration', async () => {
    const onClose = vi.fn();
    render(<Toast message="Success!" onClose={onClose} duration={1000} />);

    expect(onClose).not.toHaveBeenCalled();

    await waitFor(
      () => {
        expect(onClose).toHaveBeenCalledTimes(1);
      },
      { timeout: 2000 }
    );
  });
});
