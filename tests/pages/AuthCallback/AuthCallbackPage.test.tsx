/**
 * Tests for Auth Callback Page
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthCallbackPage from '../../../src/pages/AuthCallback';
import { AuthProvider } from '../../../src/contexts/AuthContext';
import * as oidcClient from '../../../src/auth/oidcClient';

// Mock oidcClient
vi.mock('../../../src/auth/oidcClient', () => ({
  handleCallback: vi.fn(),
  getReturnUrl: vi.fn(() => '/'),
  initiateLogin: vi.fn(),
  initiateLogout: vi.fn(),
  getTokenExpiresIn: vi.fn(),
  silentRenew: vi.fn(),
}));

// Mock httpClient
vi.mock('../../../src/utils/httpClient', () => ({
  setTokenProvider: vi.fn(),
}));

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  });

  it('should show processing message initially', () => {
    vi.spyOn(oidcClient, 'handleCallback').mockReturnValue({
      accessToken: 'test_token',
      idToken: 'test_id_token',
      user: { sub: '123', name: 'John Doe', email: 'john@example.com' },
    });

    render(
      <AuthProvider>
        <MemoryRouter>
          <AuthCallbackPage />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Processing authentication...')).toBeInTheDocument();
  });

  it('should handle successful callback', async () => {
    vi.spyOn(oidcClient, 'handleCallback').mockReturnValue({
      accessToken: 'test_token',
      idToken: 'test_id_token',
      user: { sub: '123', name: 'John Doe', email: 'john@example.com' },
    });

    vi.spyOn(oidcClient, 'getReturnUrl').mockReturnValue('/checkout');

    const { container } = render(
      <AuthProvider>
        <MemoryRouter>
          <AuthCallbackPage />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(oidcClient.handleCallback).toHaveBeenCalled();
      expect(oidcClient.getReturnUrl).toHaveBeenCalled();
    });

    // Component should show loading while processing
    expect(container).toBeTruthy();
  });

  it('should handle callback error', async () => {
    // Suppress expected console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.spyOn(oidcClient, 'handleCallback').mockImplementation(() => {
      throw new Error('Invalid token');
    });

    render(
      <AuthProvider>
        <MemoryRouter>
          <AuthCallbackPage />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Invalid token')).toBeInTheDocument();
    });

    expect(screen.getByText('Return to Home')).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should handle missing tokens error', async () => {
    // Suppress expected console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.spyOn(oidcClient, 'handleCallback').mockImplementation(() => {
      throw new Error('Missing tokens in authentication callback');
    });

    render(
      <AuthProvider>
        <MemoryRouter>
          <AuthCallbackPage />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Missing tokens in authentication callback')).toBeInTheDocument();
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should only process callback once', async () => {
    const mockHandleCallback = vi.spyOn(oidcClient, 'handleCallback').mockReturnValue({
      accessToken: 'test_token',
      idToken: 'test_id_token',
      user: { sub: '123', name: 'John Doe', email: 'john@example.com' },
    });

    const { rerender } = render(
      <AuthProvider>
        <MemoryRouter>
          <AuthCallbackPage />
        </MemoryRouter>
      </AuthProvider>
    );

    // Re-render
    rerender(
      <AuthProvider>
        <MemoryRouter>
          <AuthCallbackPage />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockHandleCallback).toHaveBeenCalledTimes(1);
    });
  });
});
