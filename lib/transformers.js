/**
 * Data transformation utilities
 */

/**
 * Trim whitespace from string
 * @param {string} value - String to trim
 * @returns {string} Trimmed string
 */
function trim(value) {
  return typeof value === 'string' ? value.trim() : value;
}

/**
 * Convert string to number
 * @param {string} value - String to convert
 * @returns {number} Converted number
 */
function toNumber(value) {
  if (typeof value === 'number') return value;
  return Number(value);
}

/**
 * Convert string to boolean
 * @param {string} value - String to convert
 * @returns {boolean} Converted boolean
 */
function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true') return true;
    if (lower === 'false') return false;
    return false;
  }
  return Boolean(value);
}

/**
 * Apply transformation to value
 * @param {*} value - Value to transform
 * @param {Function|string} transformer - Transformation function or preset name
 * @returns {*} Transformed value
 */
function applyTransform(value, transformer, field, allData) {
  if (typeof transformer === 'function') {
    return transformer(value, field, allData);
  }
  
  // Preset transformers
  const presets = {
    trim,
    toNumber,
    toBoolean
  };
  
  if (typeof transformer === 'string' && presets[transformer]) {
    return presets[transformer](value);
  }
  
  return value;
}

export {
  trim,
  toNumber,
  toBoolean,
  applyTransform
};
