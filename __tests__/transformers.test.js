/**
 * Tests for data transformation utilities
 */

import { jest } from '@jest/globals';
import { trim, toNumber, toBoolean, applyTransform } from '../lib/transformers.js';

describe('Transformers', () => {
  describe('trim', () => {
    it('should trim whitespace from string', () => {
      expect(trim('  hello  ')).toBe('hello');
      expect(trim('  hello world  ')).toBe('hello world');
      expect(trim('\n\ttest\t\n')).toBe('test');
    });

    it('should return non-string values unchanged', () => {
      expect(trim(123)).toBe(123);
      expect(trim(null)).toBe(null);
      expect(trim(undefined)).toBe(undefined);
      expect(trim(true)).toBe(true);
    });
  });

  describe('toNumber', () => {
    it('should convert string to number', () => {
      expect(toNumber('123')).toBe(123);
      expect(toNumber('45.67')).toBe(45.67);
      expect(toNumber('-10')).toBe(-10);
    });

    it('should return NaN for invalid strings', () => {
      expect(toNumber('abc')).toBe(NaN);
      expect(toNumber('12.34.56')).toBe(NaN);
    });

    it('should return number values unchanged', () => {
      expect(toNumber(123)).toBe(123);
      expect(toNumber(45.67)).toBe(45.67);
    });

    it('should handle edge cases', () => {
      expect(toNumber('')).toBe(0);
      expect(toNumber('0')).toBe(0);
      expect(toNumber(null)).toBe(0);
      expect(toNumber(undefined)).toBe(NaN);
    });
  });

  describe('toBoolean', () => {
    it('should convert string "true" to boolean true', () => {
      expect(toBoolean('true')).toBe(true);
      expect(toBoolean('TRUE')).toBe(true);
      expect(toBoolean('True')).toBe(true);
    });

    it('should convert string "false" to boolean false', () => {
      expect(toBoolean('false')).toBe(false);
      expect(toBoolean('FALSE')).toBe(false);
      expect(toBoolean('False')).toBe(false);
    });

    it('should return boolean values unchanged', () => {
      expect(toBoolean(true)).toBe(true);
      expect(toBoolean(false)).toBe(false);
    });

    it('should handle other string values', () => {
      expect(toBoolean('yes')).toBe(false);
      expect(toBoolean('1')).toBe(false);
      expect(toBoolean('')).toBe(false);
    });
  });

  describe('applyTransform', () => {
    it('should apply preset "trim" transformation', () => {
      expect(applyTransform('  hello  ', 'trim')).toBe('hello');
    });

    it('should apply preset "toNumber" transformation', () => {
      expect(applyTransform('123', 'toNumber')).toBe(123);
    });

    it('should apply preset "toBoolean" transformation', () => {
      expect(applyTransform('true', 'toBoolean')).toBe(true);
    });

    it('should apply custom function transformation', () => {
      const transform = (val) => val.toUpperCase();
      expect(applyTransform('hello', transform)).toBe('HELLO');
    });

    it('should pass field and allData to custom function', () => {
      const transform = jest.fn((val) => val);
      const allData = { key: 'value' };
      
      applyTransform('test', transform, 'field', allData);
      
      expect(transform).toHaveBeenCalledWith('test', 'field', allData);
    });

    it('should return value unchanged for unknown preset', () => {
      expect(applyTransform('test', 'unknown')).toBe('test');
    });

    it('should handle null/undefined values', () => {
      expect(applyTransform(null, 'trim')).toBe(null);
      expect(applyTransform(undefined, 'toNumber')).toBe(NaN);
    });
  });
});
