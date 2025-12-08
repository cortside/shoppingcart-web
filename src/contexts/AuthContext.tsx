/**
 * AuthContext for authentication state management
 * Per Technical Specification Section 7.1
 *
 * Phase 5 Implementation: Real OIDC integration with session persistence
 */

import { createContext, useContext, useState, useMemo, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { setTokenProvider } from '../utils/httpClient';
import { initiateLogin as oidcLogin, initiateLogout as oidcLogout, silentRenew, getTokenExpiresIn } from '../auth/oidcClient';
import type { AuthUser } from '../types/Auth';

interface AuthContextValue {
  // State
  isAuthenticated: boolean;
  accessToken: string | null;
  idToken: string | null;
  user: AuthUser | null;
  customerResourceId: string | null;

  // Methods
  login: () => void;
  logout: () => void;
  setCustomerResourceId: (id: string) => void;
  setAuthState: (tokens: { accessToken: string; idToken: string; user: AuthUser }) => void;
}

interface AuthState {
  accessToken: string;
  idToken: string;
  user: AuthUser;
  customerResourceId: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const AUTH_STORAGE_KEY = 'auth_state';

/**
 * Load authentication state from sessionStorage
 */
function loadAuthState(): AuthState | null {
  try {
    const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;

    const state = JSON.parse(stored) as AuthState;

    // Basic validation
    if (!state.accessToken || !state.idToken || !state.user) {
      return null;
    }

    return state;
  } catch (error) {
    console.error('Failed to load auth state from storage:', error);
    return null;
  }
}

/**
 * Save authentication state to sessionStorage
 */
function saveAuthState(state: AuthState): void {
  try {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save auth state to storage:', error);
  }
}

/**
 * Clear authentication state from sessionStorage
 */
function clearAuthState(): void {
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear auth state from storage:', error);
  }
}

/**
 * Check if a token is a JWT (has three parts separated by dots)
 */
function isJWT(token: string): boolean {
  return token.split('.').length === 3;
}

/**
 * Check if JWT token is expired
 * @param token - JWT token string
 * @returns true if token is expired or invalid
 */
function checkJWTExpiration(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return true; // Invalid JWT format
    }

    // Decode payload (middle part)
    const payload = parts[1];
    let base64 = payload.replaceAll('-', '+').replaceAll('_', '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    const decoded = atob(base64);
    const claims = JSON.parse(decoded) as { exp?: number };

    if (!claims.exp) {
      return true; // No expiration claim
    }

    const now = Math.floor(Date.now() / 1000);
    return now >= claims.exp;
  } catch {
    return true; // If we can't decode, assume expired
  }
}

/**
 * Validate reference token with IdentityServer introspection endpoint
 * Note: This function is not currently used because introspection endpoints
 * cannot be called from browser clients due to CORS restrictions and the need
 * for client credentials. Reference tokens are validated by backend APIs instead.
 *
 * @param token - Reference token string
 * @param authority - IdentityServer authority URL
 * @returns true if token is valid and not expired, null if validation failed due to network error
 */
/* Disabled - introspection cannot be called from browser
async function validateReferenceToken(token: string, authority: string): Promise<boolean | null> {
  try {
    // Call introspection endpoint
    // Note: This requires the client to be configured for introspection in IdentityServer
    const response = await fetch(`${authority}/connect/introspect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token,
        token_type_hint: 'access_token',
      }),
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json() as { active: boolean };
    return result.active === true;
  } catch (error) {
    console.warn('Failed to validate reference token:', error);
    return null; // Return null to indicate validation error (not invalid token)
  }
}
*/

interface AuthProviderProps {
  readonly children: ReactNode;
}

/**
 * AuthProvider component
 * Manages authentication state across the application
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // Initialize state from sessionStorage if available
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const stored = loadAuthState();
    return stored !== null;
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    const stored = loadAuthState();
    return stored?.accessToken || null;
  });

  const [idToken, setIdToken] = useState<string | null>(() => {
    const stored = loadAuthState();
    return stored?.idToken || null;
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = loadAuthState();
    return stored?.user || null;
  });

  const [customerResourceId, setCustomerResourceId] = useState<string | null>(() => {
    const stored = loadAuthState();
    return stored?.customerResourceId || null;
  });

  // Keep accessToken ref updated so token provider always returns current value
  const accessTokenRef = useRef(accessToken);
  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  // Register token provider with httpClient once on mount
  // The provider function will be called each time a token is needed,
  // and it will read the current value from the ref
  useEffect(() => {
    const tokenProviderFn = () => {
      return accessTokenRef.current;
    };
    setTokenProvider(tokenProviderFn);
  }, []); // Empty dependency array - only set once

  // Keep idToken ref updated for logout without causing re-renders
  const idTokenRef = useRef(idToken);
  useEffect(() => {
    idTokenRef.current = idToken;
  }, [idToken]);

  // Token renewal timer ref
  const renewalTimerRef = useRef<number | null>(null);

  // Ref for scheduleTokenRenewal function to avoid circular dependency
  const scheduleRenewalRef = useRef<((token: string) => void) | null>(null);

  /**
   * Perform silent token renewal
   */
  const performRenewal = useCallback(async () => {
    if (import.meta.env.DEV) {
      console.log('Attempting silent token renewal...');
    }

    try {
      const result = await silentRenew();
      if (result) {
        // Renewal succeeded - update tokens
        setAccessToken(result.accessToken);
        setIdToken(result.idToken);
        setUser(result.user);

        if (import.meta.env.DEV) {
          console.log('Silent token renewal successful');
        }

        return result.accessToken;
      } else {
        // Renewal failed - user needs to re-authenticate
        if (import.meta.env.DEV) {
          console.warn('Silent token renewal failed - user needs to re-authenticate');
        }
        // Clear auth state
        setIsAuthenticated(false);
        setAccessToken(null);
        setIdToken(null);
        setUser(null);
        setCustomerResourceId(null);
        return null;
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error during silent token renewal:', error);
      }
      // Clear auth state on error
      setIsAuthenticated(false);
      setAccessToken(null);
      setIdToken(null);
      setUser(null);
      setCustomerResourceId(null);
      return null;
    }
  }, []);

  /**
   * Schedule token renewal before expiration
   * Renews tokens 5 minutes before they expire
   */
  const scheduleTokenRenewal = useCallback(
    (token: string) => {
      // Clear existing timer
      if (renewalTimerRef.current !== null) {
        globalThis.clearTimeout(renewalTimerRef.current);
        renewalTimerRef.current = null;
      }

      // Get token expiration time
      const expiresIn = getTokenExpiresIn(token);
      if (expiresIn === null) {
        // Not a JWT or no expiration - can't schedule renewal
        if (import.meta.env.DEV) {
          console.log('Token renewal not scheduled - not a JWT or no expiration claim');
        }
        return;
      }

      // Schedule renewal 5 minutes before expiration (or immediately if < 5 min remaining)
      const RENEW_BEFORE_SECONDS = 5 * 60; // 5 minutes
      const renewIn = Math.max(0, expiresIn - RENEW_BEFORE_SECONDS);

      if (import.meta.env.DEV) {
        console.log(`Token renewal scheduled in ${renewIn} seconds (expires in ${expiresIn} seconds)`);
      }

      renewalTimerRef.current = globalThis.setTimeout(async () => {
        const newToken = await performRenewal();
        // If renewal succeeded, schedule the next one using ref
        if (newToken && scheduleRenewalRef.current) {
          scheduleRenewalRef.current(newToken);
        }
      }, renewIn * 1000);
    },
    [performRenewal]
  );

  // Keep ref updated in useEffect
  useEffect(() => {
    scheduleRenewalRef.current = scheduleTokenRenewal;
  }, [scheduleTokenRenewal]);

  // Schedule token renewal when accessToken changes
  useEffect(() => {
    if (accessToken && isAuthenticated) {
      scheduleTokenRenewal(accessToken);
    }

    // Cleanup timer on unmount or when token changes
    return () => {
      if (renewalTimerRef.current !== null) {
        globalThis.clearTimeout(renewalTimerRef.current);
        renewalTimerRef.current = null;
      }
    };
  }, [accessToken, isAuthenticated, scheduleTokenRenewal]);

  // Persist auth state to sessionStorage whenever it changes
  useEffect(() => {
    if (isAuthenticated && accessToken && idToken && user) {
      saveAuthState({
        accessToken,
        idToken,
        user,
        customerResourceId,
      });
    } else if (!isAuthenticated) {
      clearAuthState();
    }
  }, [isAuthenticated, accessToken, idToken, user, customerResourceId]);

  // Validate token on mount and when accessToken changes
  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;

    const validateToken = async () => {
      try {
        let isExpired = false;

        if (isJWT(accessToken)) {
          // JWT token - validate client-side
          isExpired = checkJWTExpiration(accessToken);
          if (import.meta.env.DEV && isExpired) {
            console.warn('JWT access token expired');
          }
        } else {
          // Reference token - cannot validate client-side
          // Reference tokens are opaque and must be validated by the backend API
          // The introspection endpoint requires client credentials and cannot be called from browser
          // Browser will get CORS errors trying to call the introspection endpoint
          // Skip validation and let the backend APIs validate the token when used
          if (import.meta.env.DEV) {
            console.log('Reference token detected - validation will be performed by backend APIs');
          }
          return;
        }

        if (cancelled) return;

        if (isExpired) {
          // Token is expired/invalid, clear auth state
          setIsAuthenticated(false);
          setAccessToken(null);
          setIdToken(null);
          setUser(null);
          setCustomerResourceId(null);
        }
      } catch (error) {
        // Validation failed, but don't clear auth state for network errors
        if (import.meta.env.DEV) {
          console.warn('Token validation error:', error);
        }
      }
    };

    validateToken();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  /**
   * Set authentication state after successful login
   */
  const setAuthState = useCallback((tokens: { accessToken: string; idToken: string; user: AuthUser }) => {
    setAccessToken(tokens.accessToken);
    setIdToken(tokens.idToken);
    setUser(tokens.user);
    setIsAuthenticated(true);
  }, []);

  /**
   * Initiate OIDC login flow
   * Redirects to IdentityServer
   */
  const login = useCallback(() => {
    const currentPath = globalThis.location.pathname + globalThis.location.search;
    oidcLogin(currentPath);
  }, []);

  /**
   * Logout - clears all auth state and redirects to IdentityServer logout
   */
  const logout = useCallback(() => {
    // Capture idToken from ref before clearing state (needed for logout hint)
    const currentIdToken = idTokenRef.current;

    setIsAuthenticated(false);
    setAccessToken(null);
    setIdToken(null);
    setUser(null);
    setCustomerResourceId(null);
    clearAuthState(); // Clear from sessionStorage
    oidcLogout(currentIdToken); // Pass idToken for proper redirect
  }, []);

  /**
   * Set customer resource ID (called after profile creation or checkout)
   */
  const updateCustomerResourceId = useCallback((id: string) => {
    setCustomerResourceId(id);
  }, []);

  const value: AuthContextValue = useMemo(
    () => ({
      isAuthenticated,
      accessToken,
      idToken,
      user,
      customerResourceId,
      login,
      logout,
      setCustomerResourceId: updateCustomerResourceId,
      setAuthState,
    }),
    [isAuthenticated, accessToken, idToken, user, customerResourceId, login, logout, updateCustomerResourceId, setAuthState]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access AuthContext
 * @throws Error if used outside AuthProvider
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
