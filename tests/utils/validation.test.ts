/**
 * Tests for validation utilities
 */

import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidBirthdate,
  isRequired,
  validateRequired,
  validateEmail,
  validatePostalCode,
} from '../../src/utils/validation';

describe('validation utilities', () => {
  describe('isValidEmail', () => {
    it('accepts valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@example.com')).toBe(true);
      expect(isValidEmail('user+tag@example.co.uk')).toBe(true);
      expect(isValidEmail('test_123@test-domain.org')).toBe(true);
    });

    it('rejects invalid emails', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
      expect(isValidEmail('user name@example.com')).toBe(false);
    });
  });

  describe('isValidBirthdate', () => {
    it('accepts valid YYYY-MM-DD dates', () => {
      expect(isValidBirthdate('1990-01-01')).toBe(true);
      expect(isValidBirthdate('2000-12-31')).toBe(true);
      expect(isValidBirthdate('1985-06-15')).toBe(true);
    });

    it('rejects invalid date formats', () => {
      expect(isValidBirthdate('')).toBe(false);
      expect(isValidBirthdate('01/01/1990')).toBe(false);
      expect(isValidBirthdate('1990-1-1')).toBe(false);
      expect(isValidBirthdate('90-01-01')).toBe(false);
      expect(isValidBirthdate('not-a-date')).toBe(false);
    });

    it('rejects invalid dates', () => {
      expect(isValidBirthdate('1990-13-01')).toBe(false); // Invalid month
      expect(isValidBirthdate('1990-02-30')).toBe(false); // Invalid day for February
      expect(isValidBirthdate('1990-00-01')).toBe(false); // Invalid month
      expect(isValidBirthdate('1990-01-32')).toBe(false); // Invalid day
    });
  });

  describe('isRequired', () => {
    it('returns true for non-empty strings', () => {
      expect(isRequired('test')).toBe(true);
      expect(isRequired('a')).toBe(true);
      expect(isRequired('  text  ')).toBe(true);
    });

    it('returns false for empty values', () => {
      expect(isRequired('')).toBe(false);
      expect(isRequired('   ')).toBe(false);
      expect(isRequired(null)).toBe(false);
      expect(isRequired(undefined)).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('returns error message for empty values', () => {
      expect(validateRequired('', 'First Name')).toBe('First Name is required');
      expect(validateRequired('   ', 'Email')).toBe('Email is required');
      expect(validateRequired(null, 'Field')).toBe('Field is required');
      expect(validateRequired(undefined, 'Field')).toBe('Field is required');
    });

    it('returns undefined for valid values', () => {
      expect(validateRequired('test', 'Field')).toBeUndefined();
      expect(validateRequired('  value  ', 'Field')).toBeUndefined();
    });
  });

  describe('validateEmail', () => {
    it('returns error message for invalid emails', () => {
      expect(validateEmail('')).toBe('Please enter a valid email address');
      expect(validateEmail('not-an-email')).toBe('Please enter a valid email address');
      expect(validateEmail('@example.com')).toBe('Please enter a valid email address');
    });

    it('returns undefined for valid emails', () => {
      expect(validateEmail('test@example.com')).toBeUndefined();
      expect(validateEmail('user@domain.co.uk')).toBeUndefined();
    });
  });

  describe('validatePostalCode', () => {
    describe('USA postal codes', () => {
      it('accepts valid US ZIP codes', () => {
        expect(validatePostalCode('12345', 'USA')).toBeUndefined();
        expect(validatePostalCode('80014', 'USA')).toBeUndefined();
        expect(validatePostalCode('12345-6789', 'USA')).toBeUndefined();
        expect(validatePostalCode('80302-1234', 'USA')).toBeUndefined();
      });

      it('rejects invalid US ZIP codes', () => {
        expect(validatePostalCode('', 'USA')).toBe('Please enter a valid ZIP code');
        expect(validatePostalCode('abc', 'USA')).toBe('Please enter a valid ZIP code');
        expect(validatePostalCode('123', 'USA')).toBe('Please enter a valid ZIP code');
        expect(validatePostalCode('1234', 'USA')).toBe('Please enter a valid ZIP code');
        expect(validatePostalCode('123456', 'USA')).toBe('Please enter a valid ZIP code');
        expect(validatePostalCode('12345-', 'USA')).toBe('Please enter a valid ZIP code');
        expect(validatePostalCode('12345-123', 'USA')).toBe('Please enter a valid ZIP code');
      });
    });

    describe('Canadian postal codes', () => {
      it('accepts valid Canadian postal codes', () => {
        expect(validatePostalCode('K1A 0B1', 'CAN')).toBeUndefined();
        expect(validatePostalCode('M5W 1E6', 'CAN')).toBeUndefined();
        expect(validatePostalCode('V6B 1A1', 'CAN')).toBeUndefined();
        expect(validatePostalCode('k1a 0b1', 'CAN')).toBeUndefined(); // Lowercase
      });

      it('rejects invalid Canadian postal codes', () => {
        expect(validatePostalCode('', 'CAN')).toBe('Please enter a valid postal code');
        expect(validatePostalCode('12345', 'CAN')).toBe('Please enter a valid postal code');
        expect(validatePostalCode('K1A0B1', 'CAN')).toBe('Please enter a valid postal code'); // Missing space
        expect(validatePostalCode('K1A  0B1', 'CAN')).toBe('Please enter a valid postal code'); // Double space
        expect(validatePostalCode('D1A 1A1', 'CAN')).toBe('Please enter a valid postal code'); // D not allowed as first letter
      });
    });

    describe('Mexican postal codes', () => {
      it('accepts valid Mexican postal codes', () => {
        expect(validatePostalCode('12345', 'MEX')).toBeUndefined();
        expect(validatePostalCode('01000', 'MEX')).toBeUndefined();
        expect(validatePostalCode('99999', 'MEX')).toBeUndefined();
      });

      it('rejects invalid Mexican postal codes', () => {
        expect(validatePostalCode('', 'MEX')).toBe('Please enter a valid postal code');
        expect(validatePostalCode('123', 'MEX')).toBe('Please enter a valid postal code');
        expect(validatePostalCode('123456', 'MEX')).toBe('Please enter a valid postal code');
        expect(validatePostalCode('abcde', 'MEX')).toBe('Please enter a valid postal code');
      });
    });

    describe('unknown countries', () => {
      it('requires non-empty postal code', () => {
        expect(validatePostalCode('anything', 'GBR')).toBeUndefined();
        expect(validatePostalCode('SW1A 1AA', 'GBR')).toBeUndefined();
        expect(validatePostalCode('', 'GBR')).toBe('Please enter a valid postal code');
        expect(validatePostalCode('   ', 'GBR')).toBe('Please enter a valid postal code');
      });
    });
  });
});
