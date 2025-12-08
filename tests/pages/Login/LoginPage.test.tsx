/**
 * Tests for Login Page
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../../../src/pages/Login';
import { AuthProvider } from '../../../src/contexts/AuthContext';
import * as oidcClient from '../../../src/auth/oidcClient';

// Mock oidcClient
vi.mock('../../../src/auth/oidcClient', () => ({
  initiateLogin: vi.fn(),
  initiateLogout: vi.fn(),
}));

// Mock httpClient
vi.mock('../../../src/utils/httpClient', () => ({
  setTokenProvider: vi.fn(),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
  });

  it('should show loading message', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Redirecting to login...')).toBeInTheDocument();
  });

  it('should initiate login on mount', async () => {
    const mockInitiateLogin = vi.spyOn(oidcClient, 'initiateLogin');

    render(
      <AuthProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockInitiateLogin).toHaveBeenCalledWith('/');
    });
  });

  it('should pass return URL from navigation state', async () => {
    const mockInitiateLogin = vi.spyOn(oidcClient, 'initiateLogin');

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={[{ pathname: '/login', state: { from: { pathname: '/checkout' } } }]}>
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockInitiateLogin).toHaveBeenCalledWith('/checkout');
    });
  });

  it('should only initiate login once', async () => {
    const mockInitiateLogin = vi.spyOn(oidcClient, 'initiateLogin');

    const { rerender } = render(
      <AuthProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>
    );

    // Re-render
    rerender(
      <AuthProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockInitiateLogin).toHaveBeenCalledTimes(1);
    });
  });
});
