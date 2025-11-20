/**
 * Login Page
 * Per Technical Specification Section 6.1
 *
 * Initiates OIDC login flow by redirecting to IdentityServer
 * Shows brief loading message while redirecting
 */

import { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { initiateLogin } from '../../auth/oidcClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function LoginPage(): React.JSX.Element {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasInitiated = useRef(false);

  useEffect(() => {
    // If already authenticated, redirect to home
    if (isAuthenticated) {
      navigate('/', { replace: true });
      return;
    }

    // Initiate login only once
    if (!hasInitiated.current) {
      hasInitiated.current = true;

      // Get the return URL from navigation state (set by RequireAuth)
      // or default to home page
      const from = (location.state as { from?: { pathname: string } })?.from;
      const returnUrl = from?.pathname || '/';

      if (import.meta.env.DEV) {
        console.log('Initiating login with return URL:', returnUrl);
      }

      initiateLogin(returnUrl);
    }
  }, [isAuthenticated, navigate, location]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <LoadingSpinner />
      <p className="mt-4 text-lg text-gray-600">Redirecting to login...</p>
    </div>
  );
}
