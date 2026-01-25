/**
 * Tests for main validation middleware
 */

const validate = require('../lib/validate');

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {}
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res)
    };
    next = jest.fn();
  });

  describe('Basic validation', () => {
    it('should pass validation with valid data', () => {
      const schema = {
        name: { required: true, type: 'string' },
        age: { required: true, type: 'number' }
      };
      req.body = { name: 'John', age: 30 };

      const middleware = validate(schema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail validation with missing required field', () => {
      const schema = {
        name: { required: true, type: 'string' }
      };
      req.body = {};

      const middleware = validate(schema);
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: [
          { field: 'name', message: 'name is required', value: undefined }
        ]
      });
    });

    it('should fail validation with wrong type', () => {
      const schema = {
        age: { required: true, type: 'number' }
      };
      req.body = { age: 'thirty' };

      const middleware = validate(schema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: [
          { field: 'age', message: 'age must be a number', value: 'thirty' }
        ]
      });
    });

    it('should collect multiple errors', () => {
      const schema = {
        name: { required: true, type: 'string' },
        age: { required: true, type: 'number' }
      };
      req.body = { age: 'invalid' };

      const middleware = validate(schema);
      middleware(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          errors: expect.arrayContaining([
            expect.objectContaining({ field: 'name' }),
            expect.objectContaining({ field: 'age' })
          ])
        })
      );
    });
  });

  describe('Source option', () => {
    it('should validate query parameters', () => {
      const schema = {
        search: { required: true, type: 'string' }
      };
      req.query = { search: 'test' };

      const middleware = validate(schema, { source: 'query' });
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should validate URL parameters', () => {
      const schema = {
        id: { required: true, type: 'string' }
      };
      req.params = { id: '123' };

      const middleware = validate(schema, { source: 'params' });
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should validate custom nested path', () => {
      const schema = {
        street: { required: true, type: 'string' }
      };
      req.body = { address: { street: 'Main St' } };

      const middleware = validate(schema, { source: 'body.address' });
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('Partial validation', () => {
    it('should validate only provided fields when partial=true', () => {
      const schema = {
        name: { required: true, type: 'string' },
        age: { required: true, type: 'number' }
      };
      req.body = { name: 'John' }; // age is missing

      const middleware = validate(schema, { partial: true });
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should still validate provided fields in partial mode', () => {
      const schema = {
        name: { required: true, type: 'string' },
        age: { type: 'number', min: 18 }
      };
      req.body = { age: 15 }; // Provided but invalid

      const middleware = validate(schema, { partial: true });
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({ field: 'age', message: 'age must be at least 18' })
          ])
        })
      );
    });
  });

  describe('Strict mode', () => {
    it('should reject unknown fields when strict=true', () => {
      const schema = {
        name: { required: true, type: 'string' }
      };
      req.body = { name: 'John', extra: 'field' };

      const middleware = validate(schema, { strict: true });
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({ field: 'extra', message: 'extra is not allowed' })
          ])
        })
      );
    });

    it('should allow known fields when strict=true', () => {
      const schema = {
        name: { required: true, type: 'string' }
      };
      req.body = { name: 'John' };

      const middleware = validate(schema, { strict: true });
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('Strip unknown fields', () => {
    it('should remove unknown fields when stripUnknown=true', () => {
      const schema = {
        name: { required: true, type: 'string' }
      };
      req.body = { name: 'John', extra: 'field', another: 'value' };

      const middleware = validate(schema, { stripUnknown: true });
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.body).toEqual({ name: 'John' });
    });

    it('should keep known fields when stripUnknown=true', () => {
      const schema = {
        name: { required: true, type: 'string' },
        age: { type: 'number' }
      };
      req.body = { name: 'John', age: 30, extra: 'field' };

      const middleware = validate(schema, { stripUnknown: true });
      middleware(req, res, next);

      expect(req.body).toEqual({ name: 'John', age: 30 });
    });
  });

  describe('Abort early', () => {
    it('should stop at first error when abortEarly=true', () => {
      const schema = {
        name: { required: true, type: 'string' },
        age: { required: true, type: 'number' }
      };
      req.body = {};

      const middleware = validate(schema, { abortEarly: true });
      middleware(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.any(Object)
          ])
        })
      );
      // Should have only one error, not both
      const errors = res.json.mock.calls[0][0].errors;
      expect(errors.length).toBe(1);
    });

    it('should collect all errors when abortEarly=false', () => {
      const schema = {
        name: { required: true, type: 'string' },
        age: { required: true, type: 'number' }
      };
      req.body = {};

      const middleware = validate(schema, { abortEarly: false });
      middleware(req, res, next);

      const errors = res.json.mock.calls[0][0].errors;
      expect(errors.length).toBe(2);
    });
  });

  describe('Transformations', () => {
    it('should apply trim transformation', () => {
      const schema = {
        name: { required: true, type: 'string', trim: true }
      };
      req.body = { name: '  John  ' };

      const middleware = validate(schema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.body.name).toBe('John');
    });

    it('should apply transform function', () => {
      const schema = {
        email: { 
          required: true, 
          type: 'string',
          transform: (val) => val.toLowerCase()
        }
      };
      req.body = { email: 'JOHN@EXAMPLE.COM' };

      const middleware = validate(schema);
      middleware(req, res, next);

      expect(req.body.email).toBe('john@example.com');
    });

    it('should apply default value', () => {
      const schema = {
        isPinned: { type: 'boolean', default: false }
      };
      req.body = {};

      const middleware = validate(schema);
      middleware(req, res, next);

      expect(req.body.isPinned).toBe(false);
    });

    it('should not override provided value with default', () => {
      const schema = {
        isPinned: { type: 'boolean', default: false }
      };
      req.body = { isPinned: true };

      const middleware = validate(schema);
      middleware(req, res, next);

      expect(req.body.isPinned).toBe(true);
    });
  });

  describe('Custom error messages', () => {
    it('should use custom error message when provided', () => {
      const schema = {
        email: {
          required: true,
          type: 'string',
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          errorMessage: 'Please provide a valid email address'
        }
      };
      req.body = { email: 'invalid' };

      const middleware = validate(schema);
      middleware(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({ 
              field: 'email',
              message: 'Please provide a valid email address'
            })
          ])
        })
      );
    });
  });

  describe('Complex validations', () => {
    it('should validate nested schema with all rules', () => {
      const schema = {
        title: {
          required: true,
          type: 'string',
          minLength: 1,
          maxLength: 200,
          trim: true
        },
        content: {
          required: true,
          type: 'string',
          maxLength: 10000
        },
        category: {
          required: false,
          type: 'string',
          custom: (value) => {
            if (value && !['work', 'personal'].includes(value)) {
              return 'Invalid category';
            }
            return true;
          }
        },
        isPinned: {
          type: 'boolean',
          default: false,
          transform: 'toBoolean'
        }
      };

      req.body = {
        title: '  My Note  ',
        content: 'This is content',
        category: 'work',
        isPinned: 'true'
      };

      const middleware = validate(schema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.body).toEqual({
        title: 'My Note',
        content: 'This is content',
        category: 'work',
        isPinned: true
      });
    });
  });
});
