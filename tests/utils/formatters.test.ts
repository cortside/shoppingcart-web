/**
 * Tests for formatter utility functions
 */

import { describe, it, expect } from 'vitest';
import { formatDate, formatCurrency, getStatusColor, truncate } from '../../src/utils/formatters';

describe('formatters', () => {
  describe('formatDate', () => {
    it('should format ISO date string to readable format', () => {
      const result = formatDate('2025-11-15T10:30:00Z');
      expect(result).toBe('Nov 15, 2025');
    });

    it('should handle different date formats', () => {
      const result = formatDate('2025-01-01T00:00:00Z');
      // Note: May vary by timezone - using toContain instead of strict equality
      expect(result).toMatch(/Jan 1, 2025|Dec 31, 2024/);
    });
  });

  describe('formatCurrency', () => {
    it('should format number as USD currency', () => {
      expect(formatCurrency(59.98)).toBe('$59.98');
    });

    it('should handle whole numbers', () => {
      expect(formatCurrency(100)).toBe('$100.00');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle negative numbers', () => {
      expect(formatCurrency(-50.25)).toBe('-$50.25');
    });
  });

  describe('getStatusColor', () => {
    it('should return blue classes for created status', () => {
      expect(getStatusColor('created')).toBe('bg-blue-100 text-blue-800');
    });

    it('should return green classes for paid status', () => {
      expect(getStatusColor('paid')).toBe('bg-green-100 text-green-800');
    });

    it('should return purple classes for shipped status', () => {
      expect(getStatusColor('shipped')).toBe('bg-purple-100 text-purple-800');
    });

    it('should return red classes for cancelled status', () => {
      expect(getStatusColor('cancelled')).toBe('bg-red-100 text-red-800');
    });
  });

  describe('truncate', () => {
    it('should truncate string longer than maxLength', () => {
      expect(truncate('550e8400-e29b-41d4-a716-446655440000', 8)).toBe('550e8400...');
    });

    it('should not truncate string shorter than maxLength', () => {
      expect(truncate('short', 10)).toBe('short');
    });

    it('should not truncate string equal to maxLength', () => {
      expect(truncate('exactly10!', 10)).toBe('exactly10!');
    });
  });
});
