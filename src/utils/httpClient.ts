/**
 * HTTP client wrapper with authentication and error handling
 * Per Technical Specification Sections 6.6 and 8.1.1
 */

import type { ErrorsModel } from '../types/Errors';

interface HttpRequestOptions {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  requiresAuth?: boolean;
}

// Custom error classes
export class AuthError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthError';
  }
}

export class ServerError extends Error {
  constructor(message: string = 'Server error occurred') {
    super(message);
    this.name = 'ServerError';
  }
}

export class ValidationError extends Error {
  public errors: ErrorsModel;

  constructor(errors: ErrorsModel, message: string = 'Validation failed') {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

// Token provider function - will be set by AuthContext
let tokenProvider: (() => string | null) | null = null;

/**
 * Set the token provider function
 * Called by AuthContext to provide access to current token
 */
export function setTokenProvider(provider: () => string | null): void {
  tokenProvider = provider;
}

/**
 * Get access token from the registered token provider
 */
function getAccessToken(): string | null {
  if (!tokenProvider) {
    return null;
  }
  return tokenProvider();
}

/**
 * Build query string from params object
 */
function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Handle HTTP response errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  // Handle 401 - Unauthorized
  if (response.status === 401) {
    throw new AuthError('Authentication required. Please log in.');
  }

  // Handle successful responses
  if (response.ok) {
    // Return empty object for 204 No Content
    if (response.status === 204) {
      return {} as T;
    }
    return response.json() as Promise<T>;
  }

  // Handle 4xx errors (validation, bad request, etc.)
  if (response.status >= 400 && response.status < 500) {
    try {
      const errorData = await response.json() as ErrorsModel;
      if (errorData.errors && errorData.errors.length > 0) {
        // Structured validation errors
        throw new ValidationError(errorData);
      }
    } catch (error) {
      // If we can't parse error data or it's not ValidationError, fall through
      if (error instanceof ValidationError) {
        throw error;
      }
    }
    // Generic 4xx error
    throw new Error(`Request failed: ${response.statusText}`);
  }

  // Handle 5xx errors
  if (response.status >= 500) {
    throw new ServerError('A server error occurred. Please try again later.');
  }

  // Fallback for other status codes
  throw new Error(`Unexpected error: ${response.status} ${response.statusText}`);
}

/**
 * HTTP GET request
 */
export async function get<TResponse>(
  url: string,
  options?: HttpRequestOptions
): Promise<TResponse> {
  const queryString = options?.params ? buildQueryString(options.params) : '';
  const fullUrl = `${url}${queryString}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add auth token if required
  if (options?.requiresAuth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(fullUrl, {
    method: 'GET',
    headers,
  });

  return handleResponse<TResponse>(response);
}

/**
 * HTTP POST request
 */
export async function post<TBody, TResponse>(
  url: string,
  body: TBody,
  options?: HttpRequestOptions
): Promise<TResponse> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add auth token if required
  if (options?.requiresAuth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  return handleResponse<TResponse>(response);
}

/**
 * HTTP PUT request
 */
export async function put<TBody, TResponse>(
  url: string,
  body: TBody,
  options?: HttpRequestOptions
): Promise<TResponse> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add auth token if required
  if (options?.requiresAuth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });

  return handleResponse<TResponse>(response);
}
