/**
 * Tests for AuthContext
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';
import * as oidcClient from '../../src/auth/oidcClient';
import type { AuthUser } from '../../src/types/Auth';

// Mock oidcClient
vi.mock('../../src/auth/oidcClient', () => ({
  initiateLogin: vi.fn(),
  initiateLogout: vi.fn(),
}));

// Mock httpClient
vi.mock('../../src/utils/httpClient', () => ({
  setTokenProvider: vi.fn(),
}));

describe('AuthContext', () => {
  let sessionStorageMock: Record<string, string>;

  beforeEach(() => {
    sessionStorageMock = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => sessionStorageMock[key] || null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      sessionStorageMock[key] = value;
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => {
      delete sessionStorageMock[key];
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should start unauthenticated when no session storage', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.accessToken).toBeNull();
      expect(result.current.idToken).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.customerResourceId).toBeNull();
    });

    it('should restore auth state from session storage', () => {
      const authState = {
        accessToken: 'test_access_token',
        idToken: 'test_id_token',
        user: { sub: '123', name: 'John Doe', email: 'john@example.com' },
        customerResourceId: null,
      };
      sessionStorageMock['auth_state'] = JSON.stringify(authState);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.accessToken).toBe('test_access_token');
      expect(result.current.idToken).toBe('test_id_token');
      expect(result.current.user).toEqual(authState.user);
    });

    it('should handle corrupted session storage gracefully', () => {
      // Suppress expected console.error (will be called multiple times during state initialization)
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      sessionStorageMock['auth_state'] = 'invalid json';

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('login', () => {
    it('should call oidcClient initiateLogin', () => {
      const mockInitiateLogin = vi.spyOn(oidcClient, 'initiateLogin');

      // Mock location
      const mockLocation = {
        pathname: '/checkout',
        search: '?test=1',
      };
      Object.defineProperty(globalThis, 'location', {
        value: mockLocation,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      act(() => {
        result.current.login();
      });

      expect(mockInitiateLogin).toHaveBeenCalledWith('/checkout?test=1');
    });
  });

  describe('logout', () => {
    it('should clear auth state and call oidcClient logout', () => {
      const authState = {
        accessToken: 'test_access_token',
        idToken: 'test_id_token',
        user: { sub: '123', name: 'John Doe', email: 'john@example.com' },
        customerResourceId: 'cust-123',
      };
      sessionStorageMock['auth_state'] = JSON.stringify(authState);

      const mockInitiateLogout = vi.spyOn(oidcClient, 'initiateLogout');

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      act(() => {
        result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.accessToken).toBeNull();
      expect(result.current.idToken).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.customerResourceId).toBeNull();
      expect(mockInitiateLogout).toHaveBeenCalledWith('test_id_token');
      expect(sessionStorageMock['auth_state']).toBeUndefined();
    });
  });

  describe('setAuthState', () => {
    it('should update auth state and persist to session storage', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      const user: AuthUser = { sub: '123', name: 'John Doe', email: 'john@example.com' };

      act(() => {
        result.current.setAuthState({
          accessToken: 'new_access_token',
          idToken: 'new_id_token',
          user,
        });
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.accessToken).toBe('new_access_token');
        expect(result.current.idToken).toBe('new_id_token');
        expect(result.current.user).toEqual(user);
      });

      // Check persistence
      const stored = JSON.parse(sessionStorageMock['auth_state']);
      expect(stored.accessToken).toBe('new_access_token');
      expect(stored.idToken).toBe('new_id_token');
      expect(stored.user).toEqual(user);
    });
  });

  describe('setCustomerResourceId', () => {
    it('should update customer resource ID', async () => {
      const authState = {
        accessToken: 'test_access_token',
        idToken: 'test_id_token',
        user: { sub: '123', name: 'John Doe', email: 'john@example.com' },
        customerResourceId: null,
      };
      sessionStorageMock['auth_state'] = JSON.stringify(authState);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      act(() => {
        result.current.setCustomerResourceId('cust-456');
      });

      await waitFor(() => {
        expect(result.current.customerResourceId).toBe('cust-456');
      });

      // Check persistence
      const stored = JSON.parse(sessionStorageMock['auth_state']);
      expect(stored.customerResourceId).toBe('cust-456');
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      const originalError = console.error;
      console.error = vi.fn(); // Suppress error output

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      console.error = originalError;
    });

    it('should provide auth context when inside AuthProvider', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current).toBeDefined();
      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.setAuthState).toBe('function');
      expect(typeof result.current.setCustomerResourceId).toBe('function');
    });
  });
});
