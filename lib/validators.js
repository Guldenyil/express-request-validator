/**
 * Individual validator functions
 * Each validator throws an error if validation fails
 */

const validators = {
  /**
   * Check if value is required
   */
  required: (value, field) => {
    if (value === undefined || value === null || value === '') {
      throw new Error(`${field} is required`);
    }
  },

  /**
   * Check value type
   */
  type: (value, expectedType, field) => {
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== expectedType) {
      throw new Error(`${field} must be of type ${expectedType}`);
    }
  },

  /**
   * Check minimum string length
   */
  minLength: (value, min, field) => {
    if (typeof value === 'string' && value.length < min) {
      throw new Error(`${field} must be at least ${min} characters`);
    }
  },

  /**
   * Check maximum string length
   */
  maxLength: (value, max, field) => {
    if (typeof value === 'string' && value.length > max) {
      throw new Error(`${field} must not exceed ${max} characters`);
    }
  },

  /**
   * Check pattern matching
   */
  pattern: (value, regex, field) => {
    if (typeof value === 'string' && !regex.test(value)) {
      throw new Error(`${field} format is invalid`);
    }
  },

  /**
   * Check minimum numeric value
   */
  min: (value, min, field) => {
    if (typeof value === 'number' && value < min) {
      throw new Error(`${field} must be at least ${min}`);
    }
  },

  /**
   * Check maximum numeric value
   */
  max: (value, max, field) => {
    if (typeof value === 'number' && value > max) {
      throw new Error(`${field} must not exceed ${max}`);
    }
  },

  /**
   * Check minimum array length
   */
  minItems: (value, min, field) => {
    if (Array.isArray(value) && value.length < min) {
      throw new Error(`${field} must contain at least ${min} items`);
    }
  },

  /**
   * Check maximum array length
   */
  maxItems: (value, max, field) => {
    if (Array.isArray(value) && value.length > max) {
      throw new Error(`${field} must not contain more than ${max} items`);
    }
  },

  /**
   * Run custom validator function
   */
  custom: (value, validatorFn, field) => {
    const result = validatorFn(value, field);
    if (result !== true && result !== undefined) {
      throw new Error(result);
    }
  }
};

module.exports = validators;
