/**
 * AuthContext for authentication state management
 * Per Technical Specification Section 7.1
 *
 * Phase 2 Implementation: Placeholder only
 * Real OIDC implementation will be added in Phase 5
 */

import { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from 'react';
import type { AuthUser } from '../types/Auth';
import { setTokenProvider } from '../utils/httpClient';

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
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  readonly children: ReactNode;
}

/**
 * AuthProvider component
 * Manages authentication state across the application
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [customerResourceId, setCustomerResourceId] = useState<string | null>(null);

  // Register token provider with httpClient
  useEffect(() => {
    setTokenProvider(() => accessToken);
  }, [accessToken]);

  /**
   * Login method - placeholder for Phase 2
   * Real OIDC implementation will be added in Phase 5
   */
  const login = () => {
    // Phase 5: Implement OIDC login flow
    console.warn('Login not yet implemented - will be added in Phase 5');
  };

  /**
   * Logout method - clears all auth state
   */
  const logout = () => {
    setIsAuthenticated(false);
    setAccessToken(null);
    setIdToken(null);
    setUser(null);
    setCustomerResourceId(null);
  };

  /**
   * Set customer resource ID (called after profile creation or checkout)
   */
  const updateCustomerResourceId = (id: string) => {
    setCustomerResourceId(id);
  };

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
    }),
    [isAuthenticated, accessToken, idToken, user, customerResourceId]
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
