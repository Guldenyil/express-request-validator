/**
 * Tests for error formatting utilities
 */

import { formatError, createErrorResponse } from '../lib/errors.js';

describe('Error Utilities', () => {
  describe('formatError', () => {
    it('should format error with all fields', () => {
      const error = formatError('email', 'Invalid email format', 'invalid@');
      
      expect(error).toEqual({
        field: 'email',
        message: 'Invalid email format',
        value: 'invalid@'
      });
    });

    it('should format error without value', () => {
      const error = formatError('password', 'Password is required');
      
      expect(error).toEqual({
        field: 'password',
        message: 'Password is required',
        value: undefined
      });
    });

    it('should handle various value types', () => {
      expect(formatError('age', 'Too young', 15).value).toBe(15);
      expect(formatError('active', 'Invalid', false).value).toBe(false);
      expect(formatError('tags', 'Invalid', [1, 2, 3]).value).toEqual([1, 2, 3]);
      expect(formatError('obj', 'Invalid', { key: 'val' }).value).toEqual({ key: 'val' });
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response with single error', () => {
      const errors = [formatError('email', 'Invalid email')];
      const response = createErrorResponse(errors);
      
      expect(response).toEqual({
        success: false,
        errors: [
          {
            field: 'email',
            message: 'Invalid email',
            value: undefined
          }
        ]
      });
    });

    it('should create error response with multiple errors', () => {
      const errors = [
        formatError('email', 'Invalid email', 'bad@'),
        formatError('age', 'Too young', 15),
        formatError('name', 'Required')
      ];
      const response = createErrorResponse(errors);
      
      expect(response).toEqual({
        success: false,
        errors: [
          { field: 'email', message: 'Invalid email', value: 'bad@' },
          { field: 'age', message: 'Too young', value: 15 },
          { field: 'name', message: 'Required', value: undefined }
        ]
      });
    });

    it('should create error response with empty errors array', () => {
      const response = createErrorResponse([]);
      
      expect(response).toEqual({
        success: false,
        errors: []
      });
    });
  });
});
