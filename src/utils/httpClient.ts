/**
 * HTTP client wrapper with authentication and error handling
 * Per Technical Specification Sections 6.6 and 8.1.1
 */

import type { ErrorsModel } from '../types/Errors';

interface HttpRequestOptions {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  requiresAuth?: boolean;
  retryCount?: number; // Number of retry attempts (default: 0)
  retryDelay?: number; // Delay between retries in ms (default: 1000)
  timeout?: number; // Request timeout in ms (default: 30000)
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

export class NetworkError extends Error {
  constructor(message: string = 'Network error occurred') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
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
 * Create a fetch request with timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle abort (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TimeoutError(`Request timed out after ${timeoutMs}ms`);
    }

    // Handle network errors (no internet, DNS failure, CORS, etc.)
    if (error instanceof TypeError) {
      throw new NetworkError('Network error: Unable to connect to server. Please check your internet connection.');
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Sleep for specified milliseconds (for retry delays)
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Determine if error is retryable
 */
function isRetryableError(error: unknown): boolean {
  // Retry on network errors
  if (error instanceof NetworkError) {
    return true;
  }
  // Retry on timeout errors
  if (error instanceof TimeoutError) {
    return true;
  }
  // Retry on 503 Service Unavailable or 429 Too Many Requests
  if (error instanceof ServerError && (error.message.includes('503') || error.message.includes('429'))) {
    return true;
  }
  // Don't retry auth errors, validation errors, or other 4xx errors
  return false;
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
    if (response.status === 503) {
      throw new ServerError('Service temporarily unavailable. Please try again later.');
    }
    throw new ServerError(`Server error (${response.status}): ${response.statusText}`);
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
  const timeout = options?.timeout ?? 30000; // 30 seconds default
  const maxRetries = options?.retryCount ?? 0;
  const retryDelay = options?.retryDelay ?? 1000;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add auth token if required
  if (options?.requiresAuth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('Auth required but no token available');
    }
  }

  // Retry logic
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(
        fullUrl,
        {
          method: 'GET',
          headers,
        },
        timeout
      );

      return handleResponse<TResponse>(response);
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw error; // Not retryable, throw immediately
      }

      // If this was the last retry, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying (with exponential backoff)
      const delayMs = retryDelay * Math.pow(2, attempt);
      console.warn(`Request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delayMs}ms...`);
      await sleep(delayMs);
    }
  }

  // Should never reach here, but TypeScript needs this
  throw lastError ?? new Error('Request failed');
}

/**
 * HTTP POST request
 */
export async function post<TBody, TResponse>(
  url: string,
  body: TBody,
  options?: HttpRequestOptions
): Promise<TResponse> {
  const timeout = options?.timeout ?? 30000; // 30 seconds default
  const maxRetries = options?.retryCount ?? 0;
  const retryDelay = options?.retryDelay ?? 1000;

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

  // Retry logic
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        },
        timeout
      );

      return handleResponse<TResponse>(response);
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw error; // Not retryable, throw immediately
      }

      // If this was the last retry, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying (with exponential backoff)
      const delayMs = retryDelay * Math.pow(2, attempt);
      console.warn(`Request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delayMs}ms...`);
      await sleep(delayMs);
    }
  }

  // Should never reach here, but TypeScript needs this
  throw lastError ?? new Error('Request failed');
}

/**
 * HTTP PUT request
 */
export async function put<TBody, TResponse>(
  url: string,
  body: TBody,
  options?: HttpRequestOptions
): Promise<TResponse> {
  const timeout = options?.timeout ?? 30000; // 30 seconds default
  const maxRetries = options?.retryCount ?? 0;
  const retryDelay = options?.retryDelay ?? 1000;

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

  // Retry logic
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(
        url,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify(body),
        },
        timeout
      );

      return handleResponse<TResponse>(response);
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw error; // Not retryable, throw immediately
      }

      // If this was the last retry, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying (with exponential backoff)
      const delayMs = retryDelay * Math.pow(2, attempt);
      console.warn(`Request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delayMs}ms...`);
      await sleep(delayMs);
    }
  }

  // Should never reach here, but TypeScript needs this
  throw lastError ?? new Error('Request failed');
}
