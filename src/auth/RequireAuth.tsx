/**
 * RequireAuth - Protected Route Wrapper
 * Per Technical Specification Section 6.2
 *
 * Redirects unauthenticated users to login page
 * Preserves original URL for redirect after login
 */

import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RequireAuthProps {
  readonly children: ReactNode;
}

/**
 * Wraps protected routes to enforce authentication
 * Redirects to /login if user is not authenticated
 * Stores original location for post-login redirect
 */
export function RequireAuth({ children }: RequireAuthProps): React.JSX.Element {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login, preserving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
