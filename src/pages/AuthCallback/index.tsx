/**
 * Auth Callback Page
 * Per Technical Specification Section 6.1
 *
 * Handles OIDC redirect from IdentityServer
 * Parses tokens from URL fragment and updates AuthContext
 * Redirects to original destination or home page
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { handleCallback, getReturnUrl } from '../../auth/oidcClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function AuthCallbackPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { setAuthState, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const returnUrlRef = useRef<string>('/');
  const processedRef = useRef(false);

  // Process callback once on mount
  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const processCallback = async () => {
      try {
        if (import.meta.env.DEV) {
          console.log('Processing auth callback...');
          console.log('URL hash:', globalThis.location.hash);
        }

        // Parse tokens from URL fragment
        const { accessToken, idToken, user } = handleCallback();

        if (import.meta.env.DEV) {
          console.log('Tokens parsed successfully, user:', user);
        }

        // Get return URL before updating state
        returnUrlRef.current = getReturnUrl();

        if (import.meta.env.DEV) {
          console.log('Return URL:', returnUrlRef.current);
        }

        // Update auth state
        setAuthState({ accessToken, idToken, user });
      } catch (err) {
        console.error('Authentication callback failed:', err);
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setError(errorMessage);
      }
    };

    processCallback();
  }, [setAuthState]);

  // Navigate after authentication state is confirmed
  useEffect(() => {
    if (isAuthenticated && !error) {
      if (import.meta.env.DEV) {
        console.log('Authentication confirmed, navigating to:', returnUrlRef.current);
      }

      // Allow state propagation before navigation
      const AUTH_NAVIGATION_DELAY_MS = 100;
      const timeoutId = setTimeout(() => {
        navigate(returnUrlRef.current, { replace: true });
      }, AUTH_NAVIGATION_DELAY_MS);

      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, error, navigate]);

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <ErrorMessage message={error} />
        <button
          onClick={() => navigate('/')}
          className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <LoadingSpinner />
      <p className="mt-4 text-lg text-gray-600">Processing authentication...</p>
    </div>
  );
}
