/**
 * Utility functions for formatting data
 * Used across the application for consistent display
 */

import type { OrderStatus } from '../types/Orders';

/**
 * Format a date string to a human-readable format
 * @param dateString - ISO 8601 date string
 * @returns Formatted date string (e.g., "Nov 15, 2025")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a number as currency (USD)
 * @param amount - Numeric amount
 * @returns Formatted currency string (e.g., "$59.98")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Get Tailwind CSS classes for order status badge
 * @param status - Order status
 * @returns CSS class string for status badge
 */
export function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case 'created':
      return 'bg-blue-100 text-blue-800';
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'shipped':
      return 'bg-purple-100 text-purple-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Truncate a string to a specified length with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated string with "..." if needed
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}
