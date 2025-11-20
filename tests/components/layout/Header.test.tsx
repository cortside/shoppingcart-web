/**
 * Tests for Header component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from '../../../src/components/layout/Header';
import { AuthProvider } from '../../../src/contexts/AuthContext';
import { CartProvider } from '../../../src/contexts/CartContext';

// Mock oidcClient
vi.mock('../../../src/auth/oidcClient', () => ({
  initiateLogin: vi.fn(),
  initiateLogout: vi.fn(),
}));

// Mock httpClient
vi.mock('../../../src/utils/httpClient', () => ({
  setTokenProvider: vi.fn(),
}));

// Helper to render with all providers
function renderHeader({ isAuthenticated = false } = {}) {
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
      <CartProvider>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </CartProvider>
    </AuthProvider>
  );
}

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Branding and Navigation', () => {
    it('should display brand name', () => {
      renderHeader();
      expect(screen.getByText('Acme Shopping')).toBeInTheDocument();
    });

    it('should display catalog link', () => {
      renderHeader();
      const catalogLink = screen.getByText('Catalog');
      expect(catalogLink).toBeInTheDocument();
      expect(catalogLink).toHaveAttribute('href', '/catalog');
    });

    it('should display cart link with item count', () => {
      renderHeader();
      expect(screen.getByText(/Cart \(0\)/)).toBeInTheDocument();
    });
  });

  describe('Unauthenticated State', () => {
    it('should show login link when not authenticated', () => {
      renderHeader({ isAuthenticated: false });
      const loginLink = screen.getByText('Login');
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('should not show user dropdown when not authenticated', () => {
      renderHeader({ isAuthenticated: false });
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated State', () => {
    it('should show user name when authenticated', () => {
      renderHeader({ isAuthenticated: true });
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should show user email as fallback when name not available', () => {
      const authState = {
        accessToken: 'test_token',
        idToken: 'test_id_token',
        user: { sub: '123', email: 'john@example.com' },
        customerResourceId: null,
      };
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(authState));

      render(
        <AuthProvider>
          <CartProvider>
            <MemoryRouter>
              <Header />
            </MemoryRouter>
          </CartProvider>
        </AuthProvider>
      );

      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('should not show login link when authenticated', () => {
      renderHeader({ isAuthenticated: true });
      expect(screen.queryByText('Login')).not.toBeInTheDocument();
    });
  });

  describe('User Dropdown Menu', () => {
    it('should toggle dropdown when clicking user button', async () => {
      renderHeader({ isAuthenticated: true });

      const userButton = screen.getByText('John Doe').closest('button');
      expect(userButton).toBeInTheDocument();

      // Dropdown should be hidden initially
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();

      // Click to open
      fireEvent.click(userButton!);
      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Click to close
      fireEvent.click(userButton!);
      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('should show My Orders link in dropdown', async () => {
      renderHeader({ isAuthenticated: true });

      const userButton = screen.getByText('John Doe').closest('button');
      fireEvent.click(userButton!);

      await waitFor(() => {
        const ordersLink = screen.getByText('My Orders');
        expect(ordersLink).toBeInTheDocument();
        expect(ordersLink).toHaveAttribute('href', '/account/orders');
      });
    });

    it('should show Profile link in dropdown', async () => {
      renderHeader({ isAuthenticated: true });

      const userButton = screen.getByText('John Doe').closest('button');
      fireEvent.click(userButton!);

      await waitFor(() => {
        const profileLink = screen.getByText('Profile');
        expect(profileLink).toBeInTheDocument();
        expect(profileLink).toHaveAttribute('href', '/account/profile');
      });
    });

    it('should show Logout button in dropdown', async () => {
      renderHeader({ isAuthenticated: true });

      const userButton = screen.getByText('John Doe').closest('button');
      fireEvent.click(userButton!);

      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });
    });

    it('should close dropdown when clicking outside', async () => {
      renderHeader({ isAuthenticated: true });

      const userButton = screen.getByText('John Doe').closest('button');
      fireEvent.click(userButton!);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Click outside
      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('should close dropdown when pressing Escape', async () => {
      renderHeader({ isAuthenticated: true });

      const userButton = screen.getByText('John Doe').closest('button');
      fireEvent.click(userButton!);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      fireEvent.keyDown(userButton!, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on dropdown button', () => {
      renderHeader({ isAuthenticated: true });

      const userButton = screen.getByText('John Doe').closest('button');
      expect(userButton).toHaveAttribute('aria-expanded', 'false');
      expect(userButton).toHaveAttribute('aria-haspopup', 'true');
    });

    it('should update aria-expanded when dropdown opens', async () => {
      renderHeader({ isAuthenticated: true });

      const userButton = screen.getByText('John Doe').closest('button');
      fireEvent.click(userButton!);

      await waitFor(() => {
        expect(userButton).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should have role="menu" on dropdown', async () => {
      renderHeader({ isAuthenticated: true });

      const userButton = screen.getByText('John Doe').closest('button');
      fireEvent.click(userButton!);

      await waitFor(() => {
        const menu = screen.getByRole('menu');
        expect(menu).toHaveAttribute('aria-label', 'Account menu');
      });
    });

    it('should have role="menuitem" on dropdown items', async () => {
      renderHeader({ isAuthenticated: true });

      const userButton = screen.getByText('John Doe').closest('button');
      fireEvent.click(userButton!);

      await waitFor(() => {
        const menuItems = screen.getAllByRole('menuitem');
        expect(menuItems).toHaveLength(3); // My Orders, Profile, Logout
      });
    });
  });
});
