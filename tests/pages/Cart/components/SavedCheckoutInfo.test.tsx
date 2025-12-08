/**
 * Tests for SavedCheckoutInfo component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SavedCheckoutInfo from '../../../../src/pages/Cart/components/SavedCheckoutInfo';
import type { CustomerInput } from '../../../../src/types/Customer';
import type { Address } from '../../../../src/types/Orders';

describe('SavedCheckoutInfo', () => {
  const mockCustomerInfo: CustomerInput = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    birthDate: '1990-01-15',
  };

  const mockAddress: Address = {
    street: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    country: 'USA',
    zipCode: '62701',
  };

  describe('Rendering', () => {
    it('should not render when no data is provided', () => {
      const { container } = render(
        <SavedCheckoutInfo customerInfo={null} shippingAddress={null} onClearData={vi.fn()} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render customer info when provided', () => {
      render(<SavedCheckoutInfo customerInfo={mockCustomerInfo} shippingAddress={null} onClearData={vi.fn()} />);

      expect(screen.getByText('Saved Checkout Information')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('Born: 1990-01-15')).toBeInTheDocument();
    });

    it('should render shipping address when provided', () => {
      render(<SavedCheckoutInfo customerInfo={null} shippingAddress={mockAddress} onClearData={vi.fn()} />);

      expect(screen.getByText('Saved Checkout Information')).toBeInTheDocument();
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.getByText('Springfield, IL 62701')).toBeInTheDocument();
      expect(screen.getByText('USA')).toBeInTheDocument();
    });

    it('should render both customer info and shipping address when both provided', () => {
      render(
        <SavedCheckoutInfo customerInfo={mockCustomerInfo} shippingAddress={mockAddress} onClearData={vi.fn()} />
      );

      // Customer info
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();

      // Shipping address
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.getByText('Springfield, IL 62701')).toBeInTheDocument();
    });

    it('should display informational message', () => {
      render(
        <SavedCheckoutInfo customerInfo={mockCustomerInfo} shippingAddress={mockAddress} onClearData={vi.fn()} />
      );

      expect(
        screen.getByText("We've saved your information from a previous checkout. You can continue where you left off!")
      ).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onClearData when Clear button is clicked', async () => {
      const user = userEvent.setup();
      const mockClearData = vi.fn();

      render(
        <SavedCheckoutInfo customerInfo={mockCustomerInfo} shippingAddress={mockAddress} onClearData={mockClearData} />
      );

      const clearButton = screen.getByRole('button', { name: /clear/i });
      await user.click(clearButton);

      expect(mockClearData).toHaveBeenCalledTimes(1);
    });

    it('should have accessible Clear button', () => {
      render(
        <SavedCheckoutInfo customerInfo={mockCustomerInfo} shippingAddress={mockAddress} onClearData={vi.fn()} />
      );

      const clearButton = screen.getByRole('button', { name: /clear saved checkout information/i });
      expect(clearButton).toBeInTheDocument();
    });
  });
});
