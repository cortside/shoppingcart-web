/**
 * Tests for CustomerInfoForm Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../../../../src/contexts/AuthContext';
import CustomerInfoForm from '../../../../src/pages/Checkout/components/CustomerInfoForm';

// Mock the API
vi.mock('../../../../src/api/shoppingCartApi');

// Mock OIDC client
vi.mock('../../../../src/auth/oidcClient', () => ({
  initiateLogin: vi.fn(),
  initiateLogout: vi.fn(),
}));

describe('CustomerInfoForm', () => {
  const mockOnContinue = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty form for new customers', () => {
    render(
      <AuthProvider>
        <CustomerInfoForm onContinue={mockOnContinue} />
      </AuthProvider>
    );

    expect(screen.getByLabelText(/first name/i)).toHaveValue('');
    expect(screen.getByLabelText(/last name/i)).toHaveValue('');
    expect(screen.getByLabelText(/email/i)).toHaveValue('');
    expect(screen.getByLabelText(/birth date/i)).toHaveValue('');
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <CustomerInfoForm onContinue={mockOnContinue} />
      </AuthProvider>
    );

    const submitButton = screen.getByRole('button', { name: /continue to shipping/i });
    await user.click(submitButton);

    expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/birth date is required/i)).toBeInTheDocument();
    expect(mockOnContinue).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <CustomerInfoForm onContinue={mockOnContinue} />
      </AuthProvider>
    );

    // Fill all fields but with invalid email (missing proper domain)
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), '@invalid');
    await user.type(screen.getByLabelText(/birth date/i), '1990-01-01');

    const submitButton = screen.getByRole('button', { name: /continue to shipping/i });
    await user.click(submitButton);

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
    expect(mockOnContinue).not.toHaveBeenCalled();
  });

  it('validates birthdate is required', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <CustomerInfoForm onContinue={mockOnContinue} />
      </AuthProvider>
    );

    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    // Don't fill birthdate

    const submitButton = screen.getByRole('button', { name: /continue to shipping/i });
    await user.click(submitButton);

    // Should show required error
    expect(await screen.findByText(/birth date is required/i)).toBeInTheDocument();
    expect(mockOnContinue).not.toHaveBeenCalled();
  });

  it('submits valid form data', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <CustomerInfoForm onContinue={mockOnContinue} />
      </AuthProvider>
    );

    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/birth date/i), '1990-01-01');

    const submitButton = screen.getByRole('button', { name: /continue to shipping/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnContinue).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        birthDate: '1990-01-01',
      });
    });
  });

  it('prefills form with initial data if provided', () => {
    const initialData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      birthDate: '1985-05-15',
    };

    render(
      <AuthProvider>
        <CustomerInfoForm onContinue={mockOnContinue} initialData={initialData} />
      </AuthProvider>
    );

    expect(screen.getByLabelText(/first name/i)).toHaveValue('Jane');
    expect(screen.getByLabelText(/last name/i)).toHaveValue('Smith');
    expect(screen.getByLabelText(/email/i)).toHaveValue('jane@example.com');
    expect(screen.getByLabelText(/birth date/i)).toHaveValue('1985-05-15');
  });

  it('clears field error when user starts typing', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <CustomerInfoForm onContinue={mockOnContinue} />
      </AuthProvider>
    );

    // Submit to show errors
    const submitButton = screen.getByRole('button', { name: /continue to shipping/i });
    await user.click(submitButton);

    expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();

    // Start typing - error should clear
    await user.type(screen.getByLabelText(/first name/i), 'J');

    expect(screen.queryByText(/first name is required/i)).not.toBeInTheDocument();
  });
});
