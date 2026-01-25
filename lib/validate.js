/**
 * Main validation middleware
 * Creates Express middleware for request validation
 */

const validators = require('./validators');
const { formatError, createErrorResponse } = require('./errors');
const { applyTransform } = require('./transformers');

/**
 * Creates a validation middleware
 * @param {Object} schema - Validation schema
 * @param {Object} options - Validation options
 * @returns {Function} Express middleware
 */
function validate(schema, options = {}) {
  const {
    source = 'body',
    partial = false,
    strict = false,
    stripUnknown = false,
    abortEarly = false
  } = options;

  return (req, res, next) => {
    try {
      // Get data source
      const sourcePath = source.split('.');
      let data = req;
      for (const key of sourcePath) {
        data = data[key];
        if (!data) {
          data = {};
          break;
        }
      }

      const errors = [];
      const validatedData = {};

      // Validate each field in schema
      for (const [field, rules] of Object.entries(schema)) {
        try {
          let value = data[field];

          // Apply default value if missing
          if (value === undefined && rules.default !== undefined) {
            value = rules.default;
          }

          // Apply transformations before validation
          if (value !== undefined && rules.transform) {
            value = applyTransform(value, rules.transform, field, data);
          }

          if (rules.trim && typeof value === 'string') {
            value = value.trim();
          }

          // Check required
          if (rules.required && !partial) {
            validators.required(value, field);
          }

          // Skip further validation if value is undefined/null and not required
          if ((value === undefined || value === null) && !rules.required) {
            continue;
          }

          // Type validation
          if (rules.type && value !== undefined && value !== null) {
            validators.type(value, field, rules.type);
          }

          // Length validations
          if (rules.minLength !== undefined && value !== undefined) {
            validators.minLength(value, field, rules.minLength);
          }
          if (rules.maxLength !== undefined && value !== undefined) {
            validators.maxLength(value, field, rules.maxLength);
          }

          // Pattern validation
          if (rules.pattern && value !== undefined) {
            validators.pattern(value, field, rules.pattern);
          }

          // Numeric validations
          if (rules.min !== undefined && value !== undefined) {
            validators.min(value, field, rules.min);
          }
          if (rules.max !== undefined && value !== undefined) {
            validators.max(value, field, rules.max);
          }

          // Array validations
          if (rules.minItems !== undefined && value !== undefined) {
            validators.minItems(value, field, rules.minItems);
          }
          if (rules.maxItems !== undefined && value !== undefined) {
            validators.maxItems(value, field, rules.maxItems);
          }

          // Custom validation
          if (rules.custom && value !== undefined) {
            validators.custom(value, field, rules.custom, data);
          }

          // Store validated value
          validatedData[field] = value;

        } catch (error) {
          const errorMessage = rules.errorMessage || error.message;
          errors.push(formatError(field, errorMessage, data[field]));

          if (abortEarly) {
            break;
          }
        }
      }

      // Check for unknown fields in strict mode
      if (strict) {
        for (const field of Object.keys(data)) {
          if (!schema[field]) {
            errors.push(formatError(field, 'Field is not allowed', data[field]));
          }
        }
      }

      // Return error response if validation failed
      if (errors.length > 0) {
        return res.status(400).json(createErrorResponse(errors));
      }

      // Update request with validated data
      let target = req;
      for (let i = 0; i < sourcePath.length - 1; i++) {
        target = target[sourcePath[i]];
      }

      if (stripUnknown) {
        target[sourcePath[sourcePath.length - 1]] = validatedData;
      } else {
        Object.assign(target[sourcePath[sourcePath.length - 1]], validatedData);
      }

      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal validation error'
      });
    }
  };
}

module.exports = validate;
