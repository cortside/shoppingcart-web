/**
 * Tests for ShippingAddressForm Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShippingAddressForm from '../../../../src/pages/Checkout/components/ShippingAddressForm';

describe('ShippingAddressForm', () => {
  const mockOnContinue = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty form', () => {
    render(<ShippingAddressForm onContinue={mockOnContinue} onBack={mockOnBack} />);

    expect(screen.getByLabelText(/street address/i)).toHaveValue('');
    expect(screen.getByLabelText(/city/i)).toHaveValue('');
    expect(screen.getByLabelText(/state/i)).toHaveValue('');
    expect(screen.getByLabelText(/zip code/i)).toHaveValue('');
    expect(screen.getByLabelText(/country/i)).toHaveValue('USA');
  });

  it('validates all required fields', async () => {
    const user = userEvent.setup();

    render(<ShippingAddressForm onContinue={mockOnContinue} onBack={mockOnBack} />);

    const submitButton = screen.getByRole('button', { name: /continue to review/i });
    await user.click(submitButton);

    expect(await screen.findByText(/street address is required/i)).toBeInTheDocument();
    expect(screen.getByText(/city is required/i)).toBeInTheDocument();
    expect(screen.getByText(/state is required/i)).toBeInTheDocument();
    expect(screen.getByText(/zip code is required/i)).toBeInTheDocument();
    expect(mockOnContinue).not.toHaveBeenCalled();
  });

  it('validates ZIP code format for US addresses', async () => {
    const user = userEvent.setup();

    render(<ShippingAddressForm onContinue={mockOnContinue} onBack={mockOnBack} />);

    // Fill required fields with invalid ZIP
    await user.type(screen.getByLabelText(/street address/i), '123 Main St');
    await user.type(screen.getByLabelText(/city/i), 'Denver');
    await user.type(screen.getByLabelText(/state/i), 'CO');
    await user.type(screen.getByLabelText(/zip code/i), 'abc');

    const submitButton = screen.getByRole('button', { name: /continue to review/i });
    await user.click(submitButton);

    expect(await screen.findByText(/please enter a valid zip code/i)).toBeInTheDocument();
    expect(mockOnContinue).not.toHaveBeenCalled();
  });

  it('accepts valid US ZIP code formats', async () => {
    const user = userEvent.setup();

    render(<ShippingAddressForm onContinue={mockOnContinue} onBack={mockOnBack} />);

    // Test 5-digit ZIP
    await user.type(screen.getByLabelText(/street address/i), '123 Main St');
    await user.type(screen.getByLabelText(/city/i), 'Denver');
    await user.type(screen.getByLabelText(/state/i), 'CO');
    await user.type(screen.getByLabelText(/zip code/i), '80014');

    const submitButton = screen.getByRole('button', { name: /continue to review/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnContinue).toHaveBeenCalledWith({
        street: '123 Main St',
        city: 'Denver',
        state: 'CO',
        zipCode: '80014',
        country: 'USA',
      });
    });
  });

  it('accepts extended ZIP+4 format', async () => {
    const user = userEvent.setup();

    render(<ShippingAddressForm onContinue={mockOnContinue} onBack={mockOnBack} />);

    await user.type(screen.getByLabelText(/street address/i), '456 Oak Ave');
    await user.type(screen.getByLabelText(/city/i), 'Boulder');
    await user.type(screen.getByLabelText(/state/i), 'CO');
    await user.type(screen.getByLabelText(/zip code/i), '80302-1234');

    const submitButton = screen.getByRole('button', { name: /continue to review/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnContinue).toHaveBeenCalledWith({
        street: '456 Oak Ave',
        city: 'Boulder',
        state: 'CO',
        zipCode: '80302-1234',
        country: 'USA',
      });
    });
  });

  it('validates Canadian postal codes', async () => {
    const user = userEvent.setup();

    render(<ShippingAddressForm onContinue={mockOnContinue} onBack={mockOnBack} />);

    // Switch to Canada
    await user.selectOptions(screen.getByLabelText(/country/i), 'CAN');

    await user.type(screen.getByLabelText(/street address/i), '789 Maple Rd');
    await user.type(screen.getByLabelText(/city/i), 'Toronto');
    await user.type(screen.getByLabelText(/state/i), 'ON');
    await user.type(screen.getByLabelText(/zip code/i), 'K1A 0B1');

    const submitButton = screen.getByRole('button', { name: /continue to review/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnContinue).toHaveBeenCalledWith({
        street: '789 Maple Rd',
        city: 'Toronto',
        state: 'ON',
        zipCode: 'K1A 0B1',
        country: 'CAN',
      });
    });
  });

  it('rejects invalid Canadian postal codes', async () => {
    const user = userEvent.setup();

    render(<ShippingAddressForm onContinue={mockOnContinue} onBack={mockOnBack} />);

    await user.selectOptions(screen.getByLabelText(/country/i), 'CAN');
    await user.type(screen.getByLabelText(/street address/i), '789 Maple Rd');
    await user.type(screen.getByLabelText(/city/i), 'Toronto');
    await user.type(screen.getByLabelText(/state/i), 'ON');
    await user.type(screen.getByLabelText(/zip code/i), '12345'); // US format, not Canadian

    const submitButton = screen.getByRole('button', { name: /continue to review/i });
    await user.click(submitButton);

    expect(await screen.findByText(/please enter a valid postal code/i)).toBeInTheDocument();
    expect(mockOnContinue).not.toHaveBeenCalled();
  });

  it('calls onBack when back button clicked', async () => {
    const user = userEvent.setup();

    render(<ShippingAddressForm onContinue={mockOnContinue} onBack={mockOnBack} />);

    const backButton = screen.getByRole('button', { name: /back to customer info/i });
    await user.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
    expect(mockOnContinue).not.toHaveBeenCalled();
  });

  it('prefills form with initial data if provided', () => {
    const initialData = {
      street: '123 Test St',
      city: 'TestCity',
      state: 'TC',
      zipCode: '12345',
      country: 'USA',
    };

    render(<ShippingAddressForm onContinue={mockOnContinue} onBack={mockOnBack} initialData={initialData} />);

    expect(screen.getByLabelText(/street address/i)).toHaveValue('123 Test St');
    expect(screen.getByLabelText(/city/i)).toHaveValue('TestCity');
    expect(screen.getByLabelText(/state/i)).toHaveValue('TC');
    expect(screen.getByLabelText(/zip code/i)).toHaveValue('12345');
    expect(screen.getByLabelText(/country/i)).toHaveValue('USA');
  });

  it('clears field error when user starts typing', async () => {
    const user = userEvent.setup();

    render(<ShippingAddressForm onContinue={mockOnContinue} onBack={mockOnBack} />);

    // Submit to trigger validation
    const submitButton = screen.getByRole('button', { name: /continue to review/i });
    await user.click(submitButton);

    // Verify error appears
    expect(await screen.findByText(/street address is required/i)).toBeInTheDocument();

    // Start typing
    await user.type(screen.getByLabelText(/street address/i), '1');

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText(/street address is required/i)).not.toBeInTheDocument();
    });
  });
});
