/**
 * OIDC Client for IdentityServer integration
 * Per Technical Specification Section 6.1
 *
 * Implements OpenID Connect Implicit Flow:
 * - Redirect to IdentityServer /authorize endpoint
 * - Parse tokens from callback URL fragment
 * - Handle logout via /connect/endsession
 */

import { getConfig } from '../utils/config';
import type { AuthUser } from '../types/Auth';

const RETURN_URL_KEY = 'auth_return_url';

/**
 * Initiate login flow by redirecting to IdentityServer
 * @param returnUrl - URL to return to after successful authentication
 */
export function initiateLogin(returnUrl?: string): void {
  const config = getConfig();
  const { authority, clientId, scope } = config.identity;

  // Store return URL for post-login redirect
  if (returnUrl) {
    sessionStorage.setItem(RETURN_URL_KEY, returnUrl);
  }

  // Build redirect URI - must match IdentityServer client configuration
  const redirectUri = `${globalThis.location.origin}/auth/callback`;

  // Build authorization URL parameters
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'id_token token', // Implicit flow
    scope: scope,
    nonce: generateNonce(),
    state: generateState(),
  });

  // Redirect to IdentityServer
  const authUrl = `${authority}/connect/authorize?${params.toString()}`;
  globalThis.location.href = authUrl;
}

/**
 * Handle authentication callback from IdentityServer
 * Parses tokens from URL fragment and decodes user claims
 * @returns Parsed authentication data
 * @throws Error if tokens are missing or invalid
 */
export function handleCallback(): { accessToken: string; idToken: string; user: AuthUser } {
  // Parse URL fragment for tokens
  const hash = globalThis.location.hash.substring(1);
  const params = new URLSearchParams(hash);

  const accessToken = params.get('access_token');
  const idToken = params.get('id_token');

  if (!accessToken || !idToken) {
    throw new Error('Missing tokens in authentication callback');
  }

  // Decode ID token to get user claims
  const user = decodeIdToken(idToken);

  return { accessToken, idToken, user };
}

/**
 * Get return URL from session storage and clear it
 * @returns Stored return URL or default path
 */
export function getReturnUrl(): string {
  const returnUrl = sessionStorage.getItem(RETURN_URL_KEY) || '/';
  sessionStorage.removeItem(RETURN_URL_KEY);
  return returnUrl;
}

/**
 * Initiate logout flow
 * Clears local session and redirects to IdentityServer logout
 * @param idToken - ID token to use as hint for IdentityServer (required for auto-redirect)
 */
export function initiateLogout(idToken: string | null): void {
  const config = getConfig();
  const { authority } = config.identity;

  // Clear session storage
  sessionStorage.removeItem(RETURN_URL_KEY);

  // Build post-logout redirect URI
  const postLogoutRedirectUri = globalThis.location.origin;

  // Build logout URL with required parameters
  const params = new URLSearchParams({
    post_logout_redirect_uri: postLogoutRedirectUri,
  });

  // Add id_token_hint if available (required by IdentityServer for automatic redirect)
  if (idToken) {
    params.append('id_token_hint', idToken);
  }

  // Redirect to IdentityServer logout endpoint
  const logoutUrl = `${authority}/connect/endsession?${params.toString()}`;

  if (import.meta.env.DEV) {
    console.log('Logout URL:', logoutUrl);
    console.log('Post-logout redirect URI:', postLogoutRedirectUri);
    console.log('ID token hint:', idToken ? 'present' : 'missing');
  }

  globalThis.location.href = logoutUrl;
}

/**
 * Decode JWT ID token to extract user claims
 * @param idToken - JWT token string
 * @returns User object with claims
 */
function decodeIdToken(idToken: string): AuthUser {
  try {
    // JWT is base64url encoded: header.payload.signature
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    // Decode payload (middle part)
    const payload = parts[1];
    const decoded = base64UrlDecode(payload);
    const claims = JSON.parse(decoded);

    // Extract standard OIDC claims
    return {
      sub: claims.sub || '',
      name: claims.name || claims.preferred_username || claims.email,
      email: claims.email,
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to decode ID token:', error);
    }
    throw error instanceof Error ? error : new Error('Invalid ID token format');
  }
}

/**
 * Base64URL decode helper
 * @param str - Base64URL encoded string
 * @returns Decoded string
 */
function base64UrlDecode(str: string): string {
  // Replace base64url characters with base64
  let base64 = str.replaceAll('-', '+').replaceAll('_', '/');

  // Pad with = to make length multiple of 4
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  // Decode base64
  try {
    return atob(base64);
  } catch {
    throw new Error('Invalid base64url encoding in token');
  }
}

/**
 * Generate cryptographically random nonce for OIDC security
 */
function generateNonce(): string {
  return generateRandomString(32);
}

/**
 * Generate cryptographically random state for OIDC security
 */
function generateState(): string {
  return generateRandomString(32);
}

/**
 * Generate random string using crypto API
 */
function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
