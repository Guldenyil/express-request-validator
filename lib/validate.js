/**
 * Main validation middleware factory
 */

const validators = require('./validators');
const { formatError, createErrorResponse } = require('./errors');
const { trim, applyTransform } = require('./transformers');

/**
 * Creates a validation middleware
 * @param {Object} schema - Validation schema
 * @param {Object} options - Configuration options
 * @returns {Function} Express middleware function
 */
function validate(schema, options = {}) {
  // Default options
  const config = {
    partial: false,        // Allow partial validation (for PATCH/PUT)
    strict: true,          // Reject unknown fields
    stripUnknown: false,   // Remove unknown fields instead of rejecting
    abortEarly: false,     // Return all errors vs first error
    source: 'body',        // Validate req.body, req.query, or req.params
    ...options
  };

  return function validationMiddleware(req, res, next) {
    const data = req[config.source];
    const errors = [];
    const validated = {};

    try {
      // Validate each field in schema
      for (const [field, rules] of Object.entries(schema)) {
        try {
          let value = data[field];

          // Check if field is required
          if (rules.required && value === undefined) {
            if (!config.partial) {
              validators.required(value, field);
            }
          }

          // Skip validation if field not provided in partial mode
          if (value === undefined && config.partial) {
            continue;
          }

          // Apply default value if not provided
          if (value === undefined && rules.default !== undefined) {
            value = rules.default;
          }

          // Skip further validation if still undefined
          if (value === undefined) {
            continue;
          }

          // Apply trim transformation
          if (rules.trim && typeof value === 'string') {
            value = trim(value);
          }

          // Apply custom transformation
          if (rules.transform) {
            value = applyTransform(value, rules.transform);
          }

          // Type validation
          if (rules.type) {
            validators.type(value, rules.type, field);
          }

          // String validations
          if (rules.minLength !== undefined) {
            validators.minLength(value, rules.minLength, field);
          }
          if (rules.maxLength !== undefined) {
            validators.maxLength(value, rules.maxLength, field);
          }
          if (rules.pattern) {
            validators.pattern(value, rules.pattern, field);
          }

          // Number validations
          if (rules.min !== undefined) {
            validators.min(value, rules.min, field);
          }
          if (rules.max !== undefined) {
            validators.max(value, rules.max, field);
          }

          // Array validations
          if (rules.minItems !== undefined) {
            validators.minItems(value, rules.minItems, field);
          }
          if (rules.maxItems !== undefined) {
            validators.maxItems(value, rules.maxItems, field);
          }

          // Custom validator
          if (rules.custom) {
            validators.custom(value, rules.custom, field);
          }

          // Store validated value
          validated[field] = value;

        } catch (error) {
          const errorMessage = rules.errorMessage || error.message;
          errors.push(formatError(field, errorMessage, data[field]));

          if (config.abortEarly) {
            break;
          }
        }
      }

      // Check for unknown fields
      if (config.strict && !config.stripUnknown) {
        for (const field of Object.keys(data)) {
          if (!schema[field]) {
            errors.push(formatError(field, 'Field is not allowed', data[field]));
            if (config.abortEarly) {
              break;
            }
          }
        }
      }

      // Remove unknown fields if stripUnknown is true
      if (config.stripUnknown) {
        for (const field of Object.keys(data)) {
          if (schema[field]) {
            // Keep only known fields
            if (validated[field] !== undefined) {
              validated[field] = validated[field];
            }
          }
        }
      } else {
        // Preserve fields not in schema if not strict
        if (!config.strict) {
          for (const field of Object.keys(data)) {
            if (!schema[field]) {
              validated[field] = data[field];
            }
          }
        }
      }

      // Return errors if any
      if (errors.length > 0) {
        return res.status(400).json(createErrorResponse(errors));
      }

      // Update request with validated data
      req[config.source] = validated;
      next();

    } catch (error) {
      // Catch any unexpected errors
      return res.status(500).json({
        success: false,
        error: 'Validation error occurred'
      });
    }
  };
}

module.exports = validate;
