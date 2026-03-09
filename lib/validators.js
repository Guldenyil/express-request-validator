/**
 * Validator functions for input validation
 * Each validator throws an error if validation fails
 */

const validators = {
  /**
   * Validates that a value is required (not null/undefined)
   */
  required: (value, field) => {
    if (value === undefined || value === null) {
      throw new Error(`${field} is required`);
    }
  },

  /**
   * Validates value type
   */
  type: (value, field, expectedType) => {
    const actualType = value === null ? 'null' : (Array.isArray(value) ? 'array' : typeof value);
    if (actualType !== expectedType) {
      const article = ['array', 'object'].includes(expectedType) ? 'an' : 'a';
      throw new Error(`${field} must be ${article} ${expectedType}`);
    }
  },

  /**
   * Validates minimum length for strings or arrays
   */
  minLength: (value, field, minLen) => {
    if ((typeof value === 'string' || Array.isArray(value)) && value.length < minLen) {
      throw new Error(`${field} must be at least ${minLen} characters`);
    }
  },

  /**
   * Validates maximum length for strings or arrays
   */
  maxLength: (value, field, maxLen) => {
    if ((typeof value === 'string' || Array.isArray(value)) && value.length > maxLen) {
      throw new Error(`${field} must be at most ${maxLen} characters`);
    }
  },

  /**
   * Validates string pattern with regex
   */
  pattern: (value, field, regex) => {
    if (typeof value !== 'string') {
      throw new Error(`${field} must be a string for pattern validation`);
    }
    if (!regex.test(value)) {
      throw new Error(`${field} has invalid format`);
    }
  },

  /**
   * Validates minimum value for numbers
   */
  min: (value, field, minVal) => {
    if (typeof value !== 'number') {
      throw new Error(`${field} must be a number for min validation`);
    }
    if (value < minVal) {
      throw new Error(`${field} must be at least ${minVal}`);
    }
  },

  /**
   * Validates maximum value for numbers
   */
  max: (value, field, maxVal) => {
    if (typeof value !== 'number') {
      throw new Error(`${field} must be a number for max validation`);
    }
    if (value > maxVal) {
      throw new Error(`${field} must be at most ${maxVal}`);
    }
  },

  /**
   * Validates minimum array length
   */
  minItems: (value, field, minCount) => {
    if (!Array.isArray(value)) {
      throw new Error(`${field} must be an array for minItems validation`);
    }
    if (value.length < minCount) {
      throw new Error(`${field} must have at least ${minCount} items`);
    }
  },

  /**
   * Validates maximum array length
   */
  maxItems: (value, field, maxCount) => {
    if (!Array.isArray(value)) {
      throw new Error(`${field} must be an array for maxItems validation`);
    }
    if (value.length > maxCount) {
      throw new Error(`${field} must have at most ${maxCount} items`);
    }
  },

  /**
   * Custom validation function
   */
  custom: (value, field, validatorFn, allData) => {
    const result = validatorFn(value, field, allData);
    if (result === false) {
      throw new Error(`${field} is invalid`);
    } else if (typeof result === 'string') {
      throw new Error(result);
    }
  }
};

export default validators;

export const {
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
} = validators;
