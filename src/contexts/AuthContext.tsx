/**
 * AuthContext for authentication state management
 * Per Technical Specification Section 7.1
 *
 * Phase 5 Implementation: Real OIDC integration with session persistence
 */

import { createContext, useContext, useState, useMemo, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { setTokenProvider } from '../utils/httpClient';
import { initiateLogin as oidcLogin, initiateLogout as oidcLogout } from '../auth/oidcClient';
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

  // Register token provider with httpClient
  useEffect(() => {
    setTokenProvider(() => accessToken);
  }, [accessToken]);

  // Keep idToken ref updated for logout without causing re-renders
  const idTokenRef = useRef(idToken);
  useEffect(() => {
    idTokenRef.current = idToken;
  }, [idToken]);

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
