/**
 * Express Request Validator
 * Lightweight middleware for declarative request validation
 */

import validate from './lib/validate.js';
import * as validators from './lib/validators.js';

export {
  validate,
  validators
};

export default {
  validate,
  validators
};
