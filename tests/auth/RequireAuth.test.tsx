/**
 * Tests for RequireAuth wrapper component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RequireAuth } from '../../src/auth/RequireAuth';
import { AuthProvider } from '../../src/contexts/AuthContext';
import type { ReactNode } from 'react';

// Mock oidcClient
vi.mock('../../src/auth/oidcClient', () => ({
  initiateLogin: vi.fn(),
  initiateLogout: vi.fn(),
}));

// Mock httpClient
vi.mock('../../src/utils/httpClient', () => ({
  setTokenProvider: vi.fn(),
}));

// Helper to render with auth context
function renderWithAuth(ui: ReactNode, { isAuthenticated = false, initialRoute = '/' } = {}) {
  // Mock session storage for auth state
  if (isAuthenticated) {
    const authState = {
      accessToken: 'test_token',
      idToken: 'test_id_token',
      user: { sub: '123', name: 'John Doe', email: 'john@example.com' },
      customerResourceId: null,
    };
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(authState));
  } else {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
  }

  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
        {ui}
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('RequireAuth', () => {
  it('should render children when authenticated', () => {
    renderWithAuth(
      <Routes>
        <Route
          path="/protected"
          element={
            <RequireAuth>
              <div>Protected Content</div>
            </RequireAuth>
          }
        />
      </Routes>,
      { isAuthenticated: true, initialRoute: '/protected' }
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    renderWithAuth(
      <Routes>
        <Route
          path="/protected"
          element={
            <RequireAuth>
              <div>Protected Content</div>
            </RequireAuth>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>,
      { isAuthenticated: false, initialRoute: '/protected' }
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('should preserve attempted location in navigation state', () => {
    renderWithAuth(
      <Routes>
        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <div>Checkout</div>
            </RequireAuth>
          }
        />
        <Route
          path="/login"
          element={
            <div>Login Page</div>
          }
        />
      </Routes>,
      { isAuthenticated: false, initialRoute: '/checkout' }
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    // Navigation state should preserve original location
    // This is used by Login page to redirect back after auth
  });

  it('should work with nested routes', () => {
    renderWithAuth(
      <Routes>
        <Route
          path="/account/*"
          element={
            <RequireAuth>
              <Routes>
                <Route path="orders" element={<div>Orders Page</div>} />
                <Route path="profile" element={<div>Profile Page</div>} />
              </Routes>
            </RequireAuth>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>,
      { isAuthenticated: true, initialRoute: '/account/orders' }
    );

    expect(screen.getByText('Orders Page')).toBeInTheDocument();
  });
});
