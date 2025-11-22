/**
 * Silent Callback Page
 * Handles OIDC silent token renewal callback in hidden iframe
 *
 * This page is loaded in a hidden iframe during silent token renewal.
 * It parses the tokens from the URL fragment and sends them back to the parent window.
 */

import { useEffect } from 'react';

export default function SilentCallbackPage() {
  useEffect(() => {
    // Parse tokens from URL fragment
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const accessToken = params.get('access_token');
    const idToken = params.get('id_token');
    const error = params.get('error');

    // Send result to parent window
    if (window.parent && window.parent !== window) {
      if (error) {
        // Renewal failed (e.g., user logged out, session expired)
        window.parent.postMessage(
          {
            type: 'silent-renewal',
            success: false,
            error: error,
          },
          window.location.origin
        );
      } else if (accessToken && idToken) {
        // Renewal succeeded
        window.parent.postMessage(
          {
            type: 'silent-renewal',
            success: true,
            tokens: { accessToken, idToken },
          },
          window.location.origin
        );
      } else {
        // Missing tokens (unexpected)
        window.parent.postMessage(
          {
            type: 'silent-renewal',
            success: false,
            error: 'missing_tokens',
          },
          window.location.origin
        );
      }
    }
  }, []);

  // This page is loaded in a hidden iframe, so nothing needs to be rendered
  return null;
}
