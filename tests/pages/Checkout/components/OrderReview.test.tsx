/**
 * Tests for OrderReview Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrderReview from '../../../../src/pages/Checkout/components/OrderReview';
import type { CustomerInput } from '../../../../src/types/Customer';
import type { Address } from '../../../../src/types/Orders';
import type { CartItem } from '../../../../src/types/Cart';

describe('OrderReview', () => {
  const mockCustomerInfo: CustomerInput = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    birthDate: '1990-01-01',
  };

  const mockAddress: Address = {
    street: '123 Main St',
    city: 'Denver',
    state: 'CO',
    zipCode: '80014',
    country: 'USA',
  };

  const mockItems: CartItem[] = [
    {
      itemId: '1',
      sku: 'TEST-SKU-1',
      name: 'Test Product 1',
      unitPrice: 99.99,
      imageUrl: 'http://example.com/image1.jpg',
      quantity: 2,
    },
    {
      itemId: '2',
      sku: 'TEST-SKU-2',
      name: 'Test Product 2',
      unitPrice: 49.99,
      imageUrl: 'http://example.com/image2.jpg',
      quantity: 1,
    },
  ];

  const mockSubtotal = 249.97;

  const mockOnEditCustomerInfo = vi.fn();
  const mockOnEditAddress = vi.fn();
  const mockOnPlaceOrder = vi.fn();

  it('renders customer info correctly', () => {
    render(
      <OrderReview
        customerInfo={mockCustomerInfo}
        address={mockAddress}
        items={mockItems}
        subtotal={mockSubtotal}
        onEditCustomerInfo={mockOnEditCustomerInfo}
        onEditAddress={mockOnEditAddress}
        onPlaceOrder={mockOnPlaceOrder}
        isSubmitting={false}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText(/birth date: 1990-01-01/i)).toBeInTheDocument();
  });

  it('renders shipping address correctly', () => {
    render(
      <OrderReview
        customerInfo={mockCustomerInfo}
        address={mockAddress}
        items={mockItems}
        subtotal={mockSubtotal}
        onEditCustomerInfo={mockOnEditCustomerInfo}
        onEditAddress={mockOnEditAddress}
        onPlaceOrder={mockOnPlaceOrder}
        isSubmitting={false}
      />
    );

    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('Denver, CO 80014')).toBeInTheDocument();
    expect(screen.getByText('USA')).toBeInTheDocument();
  });

  it('renders order items with prices', () => {
    render(
      <OrderReview
        customerInfo={mockCustomerInfo}
        address={mockAddress}
        items={mockItems}
        subtotal={mockSubtotal}
        onEditCustomerInfo={mockOnEditCustomerInfo}
        onEditAddress={mockOnEditAddress}
        onPlaceOrder={mockOnPlaceOrder}
        isSubmitting={false}
      />
    );

    // Check first item
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('SKU: TEST-SKU-1')).toBeInTheDocument();
    expect(screen.getByText('$99.99 × 2')).toBeInTheDocument();
    expect(screen.getByText('$199.98')).toBeInTheDocument();

    // Check second item
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    expect(screen.getByText('SKU: TEST-SKU-2')).toBeInTheDocument();
    expect(screen.getByText('$49.99 × 1')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
  });

  it('calculates subtotal correctly', () => {
    render(
      <OrderReview
        customerInfo={mockCustomerInfo}
        address={mockAddress}
        items={mockItems}
        subtotal={mockSubtotal}
        onEditCustomerInfo={mockOnEditCustomerInfo}
        onEditAddress={mockOnEditAddress}
        onPlaceOrder={mockOnPlaceOrder}
        isSubmitting={false}
      />
    );

    expect(screen.getByText('$249.97')).toBeInTheDocument();
  });

  it('calls onEditCustomerInfo when edit clicked', async () => {
    const user = userEvent.setup();

    render(
      <OrderReview
        customerInfo={mockCustomerInfo}
        address={mockAddress}
        items={mockItems}
        subtotal={mockSubtotal}
        onEditCustomerInfo={mockOnEditCustomerInfo}
        onEditAddress={mockOnEditAddress}
        onPlaceOrder={mockOnPlaceOrder}
        isSubmitting={false}
      />
    );

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    const editCustomerButton = editButtons[0]; // First edit button is for customer info

    await user.click(editCustomerButton);

    expect(mockOnEditCustomerInfo).toHaveBeenCalled();
  });

  it('calls onEditAddress when edit clicked', async () => {
    const user = userEvent.setup();

    render(
      <OrderReview
        customerInfo={mockCustomerInfo}
        address={mockAddress}
        items={mockItems}
        subtotal={mockSubtotal}
        onEditCustomerInfo={mockOnEditCustomerInfo}
        onEditAddress={mockOnEditAddress}
        onPlaceOrder={mockOnPlaceOrder}
        isSubmitting={false}
      />
    );

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    const editAddressButton = editButtons[1]; // Second edit button is for address

    await user.click(editAddressButton);

    expect(mockOnEditAddress).toHaveBeenCalled();
  });

  it('calls onPlaceOrder when place order clicked', async () => {
    const user = userEvent.setup();

    render(
      <OrderReview
        customerInfo={mockCustomerInfo}
        address={mockAddress}
        items={mockItems}
        subtotal={mockSubtotal}
        onEditCustomerInfo={mockOnEditCustomerInfo}
        onEditAddress={mockOnEditAddress}
        onPlaceOrder={mockOnPlaceOrder}
        isSubmitting={false}
      />
    );

    const placeOrderButton = screen.getByRole('button', { name: /place order/i });
    await user.click(placeOrderButton);

    expect(mockOnPlaceOrder).toHaveBeenCalled();
  });

  it('disables edit buttons when isSubmitting=true', () => {
    render(
      <OrderReview
        customerInfo={mockCustomerInfo}
        address={mockAddress}
        items={mockItems}
        subtotal={mockSubtotal}
        onEditCustomerInfo={mockOnEditCustomerInfo}
        onEditAddress={mockOnEditAddress}
        onPlaceOrder={mockOnPlaceOrder}
        isSubmitting={true}
      />
    );

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    editButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('shows "Placing Order..." when isSubmitting=true', () => {
    render(
      <OrderReview
        customerInfo={mockCustomerInfo}
        address={mockAddress}
        items={mockItems}
        subtotal={mockSubtotal}
        onEditCustomerInfo={mockOnEditCustomerInfo}
        onEditAddress={mockOnEditAddress}
        onPlaceOrder={mockOnPlaceOrder}
        isSubmitting={true}
      />
    );

    expect(screen.getByRole('button', { name: /placing order\.\.\./i })).toBeInTheDocument();
  });

  it('shows "Place Order" when not submitting', () => {
    render(
      <OrderReview
        customerInfo={mockCustomerInfo}
        address={mockAddress}
        items={mockItems}
        subtotal={mockSubtotal}
        onEditCustomerInfo={mockOnEditCustomerInfo}
        onEditAddress={mockOnEditAddress}
        onPlaceOrder={mockOnPlaceOrder}
        isSubmitting={false}
      />
    );

    expect(screen.getByRole('button', { name: /^place order$/i })).toBeInTheDocument();
  });
});
