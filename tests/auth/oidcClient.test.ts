/**
 * Tests for OIDC Client
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initiateLogin, handleCallback, getReturnUrl, initiateLogout } from '../../src/auth/oidcClient';

// Mock config
vi.mock('../../src/utils/config', () => ({
  getConfig: () => ({
    identity: {
      authority: 'http://localhost:5002',
      clientId: 'shoppingcart-web',
      scope: 'openid profile shoppingcart-api catalog-api',
    },
  }),
}));

describe('oidcClient', () => {
  let originalLocation: Location;
  let mockLocation: Partial<Location>;
  let getItemSpy: ReturnType<typeof vi.spyOn>;
  let setItemSpy: ReturnType<typeof vi.spyOn>;
  let removeItemSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    originalLocation = globalThis.location;
    mockLocation = {
      origin: 'http://localhost:5173',
      href: '',
      hash: '',
      pathname: '/catalog',
      search: '',
    };
    Object.defineProperty(globalThis, 'location', {
      value: mockLocation,
      writable: true,
      configurable: true,
    });

    // Create a mock sessionStorage object that tracks calls
    const storage: Record<string, string> = {};
    const mockSessionStorage = {
      getItem: vi.fn((key: string) => storage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        storage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete storage[key];
      }),
      clear: vi.fn(() => {
        for (const key of Object.keys(storage)) {
          delete storage[key];
        }
      }),
      get length() {
        return Object.keys(storage).length;
      },
      key: vi.fn((index: number) => Object.keys(storage)[index] || null),
    };

    // Replace globalThis.sessionStorage
    Object.defineProperty(globalThis, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true,
      configurable: true,
    });

    // Store spy references
    getItemSpy = mockSessionStorage.getItem;
    setItemSpy = mockSessionStorage.setItem;
    removeItemSpy = mockSessionStorage.removeItem;
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  describe('initiateLogin', () => {
    it('should redirect to IdentityServer authorize endpoint', () => {
      initiateLogin('/checkout');

      expect(mockLocation.href).toContain('http://localhost:5002/connect/authorize');
      expect(mockLocation.href).toContain('client_id=shoppingcart-web');
      // URLSearchParams encodes space as + not %20
      expect(mockLocation.href).toMatch(/response_type=(id_token\+token|id_token%20token)/);
      expect(mockLocation.href).toMatch(/scope=(openid\+profile\+shoppingcart-api\+catalog-api|openid%20profile%20shoppingcart-api%20catalog-api)/);
      expect(mockLocation.href).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fauth%2Fcallback');
    });

    it('should store return URL in session storage', () => {
      initiateLogin('/account/orders');

      expect(setItemSpy).toHaveBeenCalledWith('auth_return_url', '/account/orders');
    });

    it('should include nonce and state in URL', () => {
      initiateLogin('/');

      expect(mockLocation.href).toContain('nonce=');
      expect(mockLocation.href).toContain('state=');
    });

    it('should handle no return URL', () => {
      initiateLogin();

      expect(setItemSpy).not.toHaveBeenCalled();
      expect(mockLocation.href).toContain('http://localhost:5002/connect/authorize');
    });
  });

  describe('handleCallback', () => {
    it('should parse tokens from URL hash', () => {
      mockLocation.hash = '#access_token=test_access_token&id_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      const result = handleCallback();

      expect(result.accessToken).toBe('test_access_token');
      expect(result.idToken).toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
      expect(result.user.sub).toBe('1234567890');
      expect(result.user.name).toBe('John Doe');
      expect(result.user.email).toBe('john@example.com');
    });

    it('should throw error if access token is missing', () => {
      mockLocation.hash = '#id_token=test_id_token';

      expect(() => handleCallback()).toThrow('Missing tokens in authentication callback');
    });

    it('should throw error if id token is missing', () => {
      mockLocation.hash = '#access_token=test_access_token';

      expect(() => handleCallback()).toThrow('Missing tokens in authentication callback');
    });

    it('should handle user without email', () => {
      mockLocation.hash = '#access_token=test_access_token&id_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Gfx6VO9tcxwk6xqx9yYzSfebfeakZp5JYIgP_edcw_A';

      const result = handleCallback();

      expect(result.user.name).toBe('John Doe');
      expect(result.user.email).toBeUndefined();
    });

    it('should use email as fallback for name', () => {
      mockLocation.hash = '#access_token=test_access_token&id_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIn0.imPvINqGizyjzyo7JClBPFj8CzNYDjEhL0G3N_HkSSc';

      const result = handleCallback();

      expect(result.user.name).toBe('john@example.com');
      expect(result.user.email).toBe('john@example.com');
    });
  });

  describe('getReturnUrl', () => {
    it('should retrieve and clear return URL from session storage', () => {
      // Directly set value in mock
      getItemSpy.mockReturnValueOnce('/checkout');

      const returnUrl = getReturnUrl();

      expect(returnUrl).toBe('/checkout');
      expect(removeItemSpy).toHaveBeenCalledWith('auth_return_url');
    });

    it('should return default path when no return URL stored', () => {
      const returnUrl = getReturnUrl();

      expect(returnUrl).toBe('/');
    });
  });

  describe('initiateLogout', () => {
    it('should redirect to IdentityServer logout endpoint with id_token_hint', () => {
      const idToken = 'test_id_token';

      initiateLogout(idToken);

      expect(mockLocation.href).toContain('http://localhost:5002/connect/endsession');
      expect(mockLocation.href).toContain('post_logout_redirect_uri=http%3A%2F%2Flocalhost%3A5173');
      expect(mockLocation.href).toContain('id_token_hint=test_id_token');
    });

    it('should handle logout without id_token_hint', () => {
      initiateLogout(null);

      expect(mockLocation.href).toContain('http://localhost:5002/connect/endsession');
      expect(mockLocation.href).toContain('post_logout_redirect_uri=http%3A%2F%2Flocalhost%3A5173');
      expect(mockLocation.href).not.toContain('id_token_hint');
    });

    it('should clear return URL from session storage', () => {
      initiateLogout('test_token');

      expect(removeItemSpy).toHaveBeenCalledWith('auth_return_url');
    });
  });
});
