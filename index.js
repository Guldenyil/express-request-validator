/**
 * Express Request Validator
 * Lightweight middleware for declarative request validation
 */

const validate = require('./lib/validate');
const validators = require('./lib/validators');
const schemas = require('./schemas/note');

module.exports = {
  validate,
  validators,
  schemas
};
