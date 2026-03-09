/**
 * Error formatting utilities
 */

/**
 * Format a single validation error
 * @param {string} field - Field name
 * @param {string} message - Error message
 * @param {*} value - Field value
 * @returns {Object} Formatted error object
 */
function formatError(field, message, value) {
  return {
    field,
    message,
    value
  };
}

/**
 * Create error response
 * @param {Array} errors - Array of error objects
 * @returns {Object} Response object
 */
function createErrorResponse(errors) {
  return {
    success: false,
    errors
  };
}

export {
  formatError,
  createErrorResponse
};
