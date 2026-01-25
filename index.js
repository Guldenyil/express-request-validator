/**
 * Express Request Validator
 * Lightweight middleware for declarative request validation
 */

const validate = require('./lib/validate');
const validators = require('./lib/validators');

module.exports = {
  validate,
  validators
};
