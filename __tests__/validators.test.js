/**
 * Tests for validator functions
 */

import { jest } from '@jest/globals';
import {
  required,
  type,
  minLength,
  maxLength,
  pattern,
  min,
  max,
  minItems,
  maxItems,
  custom
} from '../lib/validators.js';

describe('Validators', () => {
  describe('required', () => {
    it('should pass when value is provided', () => {
      expect(() => required('test', 'field')).not.toThrow();
      expect(() => required(0, 'field')).not.toThrow();
      expect(() => required(false, 'field')).not.toThrow();
      expect(() => required('', 'field')).not.toThrow();
    });

    it('should throw when value is null or undefined', () => {
      expect(() => required(null, 'field')).toThrow('field is required');
      expect(() => required(undefined, 'field')).toThrow('field is required');
    });
  });

  describe('type', () => {
    it('should validate string type', () => {
      expect(() => type('hello', 'field', 'string')).not.toThrow();
      expect(() => type(123, 'field', 'string')).toThrow('field must be a string');
    });

    it('should validate number type', () => {
      expect(() => type(123, 'field', 'number')).not.toThrow();
      expect(() => type('123', 'field', 'number')).toThrow('field must be a number');
    });

    it('should validate boolean type', () => {
      expect(() => type(true, 'field', 'boolean')).not.toThrow();
      expect(() => type(false, 'field', 'boolean')).not.toThrow();
      expect(() => type('true', 'field', 'boolean')).toThrow('field must be a boolean');
    });

    it('should validate array type', () => {
      expect(() => type([], 'field', 'array')).not.toThrow();
      expect(() => type([1, 2, 3], 'field', 'array')).not.toThrow();
      expect(() => type({}, 'field', 'array')).toThrow('field must be an array');
    });

    it('should validate object type', () => {
      expect(() => type({}, 'field', 'object')).not.toThrow();
      expect(() => type({ key: 'value' }, 'field', 'object')).not.toThrow();
      expect(() => type([], 'field', 'object')).toThrow('field must be an object');
      expect(() => type(null, 'field', 'object')).toThrow('field must be an object');
    });
  });

  describe('minLength', () => {
    it('should pass when string meets minimum length', () => {
      expect(() => minLength('hello', 'field', 5)).not.toThrow();
      expect(() => minLength('hello world', 'field', 5)).not.toThrow();
    });

    it('should throw when string is too short', () => {
      expect(() => minLength('hi', 'field', 5)).toThrow('field must be at least 5 characters');
    });

    it('should pass when array meets minimum length', () => {
      expect(() => minLength([1, 2, 3], 'field', 3)).not.toThrow();
      expect(() => minLength([1, 2, 3, 4], 'field', 3)).not.toThrow();
    });

    it('should throw when array is too short', () => {
      expect(() => minLength([1], 'field', 3)).toThrow('field must be at least 3 characters');
    });
  });

  describe('maxLength', () => {
    it('should pass when string is within maximum length', () => {
      expect(() => maxLength('hello', 'field', 10)).not.toThrow();
      expect(() => maxLength('hello', 'field', 5)).not.toThrow();
    });

    it('should throw when string is too long', () => {
      expect(() => maxLength('hello world', 'field', 5)).toThrow('field must be at most 5 characters');
    });

    it('should pass when array is within maximum length', () => {
      expect(() => maxLength([1, 2, 3], 'field', 5)).not.toThrow();
    });

    it('should throw when array is too long', () => {
      expect(() => maxLength([1, 2, 3, 4, 5, 6], 'field', 5)).toThrow('field must be at most 5 characters');
    });
  });

  describe('pattern', () => {
    it('should pass when string matches pattern', () => {
      expect(() => pattern('test@example.com', 'field', /^[^\s@]+@[^\s@]+\.[^\s@]+$/)).not.toThrow();
      expect(() => pattern('#FF5733', 'field', /^#[0-9A-Fa-f]{6}$/)).not.toThrow();
    });

    it('should throw when string does not match pattern', () => {
      expect(() => pattern('invalid-email', 'field', /^[^\s@]+@[^\s@]+\.[^\s@]+$/))
        .toThrow('field has invalid format');
      expect(() => pattern('#ZZZ', 'field', /^#[0-9A-Fa-f]{6}$/))
        .toThrow('field has invalid format');
    });

    it('should throw when value is not a string', () => {
      expect(() => pattern(123, 'field', /\d+/)).toThrow('field must be a string for pattern validation');
    });
  });

  describe('min', () => {
    it('should pass when number is above minimum', () => {
      expect(() => min(10, 'field', 5)).not.toThrow();
      expect(() => min(5, 'field', 5)).not.toThrow();
    });

    it('should throw when number is below minimum', () => {
      expect(() => min(3, 'field', 5)).toThrow('field must be at least 5');
    });

    it('should throw when value is not a number', () => {
      expect(() => min('10', 'field', 5)).toThrow('field must be a number for min validation');
    });
  });

  describe('max', () => {
    it('should pass when number is below maximum', () => {
      expect(() => max(5, 'field', 10)).not.toThrow();
      expect(() => max(10, 'field', 10)).not.toThrow();
    });

    it('should throw when number exceeds maximum', () => {
      expect(() => max(15, 'field', 10)).toThrow('field must be at most 10');
    });

    it('should throw when value is not a number', () => {
      expect(() => max('10', 'field', 5)).toThrow('field must be a number for max validation');
    });
  });

  describe('minItems', () => {
    it('should pass when array has minimum items', () => {
      expect(() => minItems([1, 2, 3], 'field', 3)).not.toThrow();
      expect(() => minItems([1, 2, 3, 4], 'field', 3)).not.toThrow();
    });

    it('should throw when array has too few items', () => {
      expect(() => minItems([1], 'field', 3)).toThrow('field must have at least 3 items');
    });

    it('should throw when value is not an array', () => {
      expect(() => minItems('not array', 'field', 3)).toThrow('field must be an array for minItems validation');
    });
  });

  describe('maxItems', () => {
    it('should pass when array has maximum items', () => {
      expect(() => maxItems([1, 2, 3], 'field', 5)).not.toThrow();
      expect(() => maxItems([1, 2, 3], 'field', 3)).not.toThrow();
    });

    it('should throw when array has too many items', () => {
      expect(() => maxItems([1, 2, 3, 4, 5, 6], 'field', 5)).toThrow('field must have at most 5 items');
    });

    it('should throw when value is not an array', () => {
      expect(() => maxItems('not array', 'field', 5)).toThrow('field must be an array for maxItems validation');
    });
  });

  describe('custom', () => {
    it('should pass when custom validator returns true', () => {
      const validator = (value) => value > 0 || 'Must be positive';
      expect(() => custom(10, 'field', validator)).not.toThrow();
    });

    it('should throw when custom validator returns error message', () => {
      const validator = (value) => value > 0 || 'Must be positive';
      expect(() => custom(-5, 'field', validator)).toThrow('Must be positive');
    });

    it('should throw when custom validator returns false', () => {
      const validator = () => false;
      expect(() => custom(10, 'field', validator)).toThrow('field is invalid');
    });

    it('should pass field name and all data to custom validator', () => {
      const validator = jest.fn(() => true);
      const allData = { field: 'value', other: 'data' };
      custom('value', 'field', validator, allData);
      
      expect(validator).toHaveBeenCalledWith('value', 'field', allData);
    });
  });
});
