/**
 * Integration tests for the complete validation middleware
 */

import express from 'express';
import request from 'supertest';
import { validate } from '../index.js';

const createNoteSchema = {
  title: {
    required: true,
    minLength: 1,
    maxLength: 200,
    trim: true,
    errorMessage: 'Title is required and must be between 1-200 characters'
  },
  content: {
    required: true,
    maxLength: 10000,
    errorMessage: 'Content is required and must not exceed 10000 characters'
  },
  category: {
    required: false,
    maxLength: 50,
    trim: true
  },
  color: {
    required: false,
    pattern: /^#[0-9A-Fa-f]{6}$/,
    errorMessage: 'Color must be in hex format (#RRGGBB)'
  },
  isPinned: {
    required: false,
    type: 'boolean',
    default: false,
    transform: (value) => {
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
      }
      return value;
    }
  }
};

const updateNoteSchema = {
  title: {
    required: false,
    minLength: 1,
    maxLength: 200,
    trim: true,
    errorMessage: 'Title must be between 1-200 characters'
  },
  content: {
    required: false,
    maxLength: 10000,
    errorMessage: 'Content must not exceed 10000 characters'
  },
  category: {
    required: false,
    maxLength: 50,
    trim: true
  },
  color: {
    required: false,
    pattern: /^#[0-9A-Fa-f]{6}$/,
    errorMessage: 'Color must be in hex format (#RRGGBB)'
  },
  isPinned: {
    required: false,
    type: 'boolean',
    transform: (value) => {
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
      }
      return value;
    }
  }
};

const noteQuerySchema = {
  category: {
    required: false,
    maxLength: 50,
    trim: true
  },
  isPinned: {
    required: false,
    type: 'boolean',
    transform: (value) => value.toLowerCase() === 'true',
    errorMessage: 'isPinned must be "true" or "false"'
  },
  search: {
    required: false,
    maxLength: 200,
    trim: true
  },
  sortBy: {
    required: false,
    custom: (value) => {
      const validFields = ['createdAt', 'updatedAt', 'title', 'created_at', 'updated_at'];
      if (value && !validFields.includes(value)) {
        return `sortBy must be one of: ${validFields.join(', ')}`;
      }
      return true;
    },
    default: 'created_at'
  },
  order: {
    required: false,
    pattern: /^(asc|desc)$/i,
    transform: (value) => value ? value.toLowerCase() : 'desc',
    default: 'desc',
    errorMessage: 'order must be "asc" or "desc"'
  },
  page: {
    required: false,
    type: 'number',
    min: 1,
    default: 1,
    transform: (value) => {
      const num = parseInt(value, 10);
      return isNaN(num) ? 1 : num;
    }
  },
  limit: {
    required: false,
    type: 'number',
    min: 1,
    max: 100,
    default: 10,
    transform: (value) => {
      const num = parseInt(value, 10);
      return isNaN(num) ? 10 : num;
    }
  }
};

describe('Integration Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('Create Note Endpoint', () => {
    beforeEach(() => {
      app.post('/api/notes', validate(createNoteSchema), (req, res) => {
        res.status(201).json({ success: true, data: req.body });
      });
    });

    it('should create note with valid data', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send({
          title: 'Test Note',
          content: 'This is a test note'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        title: 'Test Note',
        content: 'This is a test note'
      });
    });

    it('should apply transformations', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send({
          title: '  Whitespace Title  ',
          content: 'Content',
          isPinned: 'true'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe('Whitespace Title');
      expect(response.body.data.isPinned).toBe(true);
    });

    it('should reject when title is missing', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send({
          content: 'Content without title'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({ field: 'title' })
      );
    });

    it('should reject when title is too long', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send({
          title: 'a'.repeat(201),
          content: 'Content'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({ 
          field: 'title',
          message: expect.stringContaining('200')
        })
      );
    });

    it('should reject when content is too long', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send({
          title: 'Title',
          content: 'a'.repeat(10001)
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({ field: 'content' })
      );
    });

    it('should validate color hex pattern', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send({
          title: 'Title',
          content: 'Content',
          color: 'invalid-color'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({ 
          field: 'color',
          message: expect.stringContaining('hex')
        })
      );
    });

    it('should accept valid hex color', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send({
          title: 'Title',
          content: 'Content',
          color: '#FF5733'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.color).toBe('#FF5733');
    });
  });

  describe('Update Note Endpoint', () => {
    beforeEach(() => {
      app.put('/api/notes/:id', 
        validate(updateNoteSchema, { partial: true }),
        (req, res) => {
          res.json({ success: true, data: { id: req.params.id, ...req.body } });
        }
      );
    });

    it('should allow partial updates', async () => {
      const response = await request(app)
        .put('/api/notes/1')
        .send({
          title: 'Updated Title'
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject({
        id: '1',
        title: 'Updated Title'
      });
    });

    it('should validate updated fields', async () => {
      const response = await request(app)
        .put('/api/notes/1')
        .send({
          title: 'a'.repeat(201)
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({ field: 'title' })
      );
    });

    it('should allow empty update', async () => {
      const response = await request(app)
        .put('/api/notes/1')
        .send({});

      expect(response.status).toBe(200);
    });
  });

  describe('Query Parameters Endpoint', () => {
    beforeEach(() => {
      app.get('/api/notes',
        validate(noteQuerySchema, { source: 'query' }),
        (req, res) => {
          res.json({ success: true, filters: req.validated?.query || req.query });
        }
      );
    });

    it('should validate and transform query parameters', async () => {
      const response = await request(app)
        .get('/api/notes?page=2&limit=20&isPinned=true');

      expect(response.status).toBe(200);
      expect(response.body.filters).toMatchObject({
        page: 2,
        limit: 20,
        isPinned: true
      });
    });

    it('should apply default values', async () => {
      const response = await request(app)
        .get('/api/notes');

      expect(response.status).toBe(200);
      expect(response.body.filters).toMatchObject({
        page: 1,
        limit: 10,
        order: 'desc',
        sortBy: 'created_at'
      });
    });

    it('should reject invalid page number', async () => {
      const response = await request(app)
        .get('/api/notes?page=0');

      expect(response.status).toBe(400);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({ field: 'page' })
      );
    });

    it('should reject limit above maximum', async () => {
      const response = await request(app)
        .get('/api/notes?limit=101');

      expect(response.status).toBe(400);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({ field: 'limit' })
      );
    });
  });

  describe('Strict Mode', () => {
    beforeEach(() => {
      app.post('/api/strict', 
        validate(createNoteSchema, { strict: true }),
        (req, res) => {
          res.status(201).json({ success: true });
        }
      );
    });

    it('should reject unknown fields in strict mode', async () => {
      const response = await request(app)
        .post('/api/strict')
        .send({
          title: 'Title',
          content: 'Content',
          unknownField: 'value'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({ 
          field: 'unknownField',
          message: expect.stringContaining('not allowed')
        })
      );
    });
  });

  describe('Strip Unknown Fields', () => {
    beforeEach(() => {
      app.post('/api/strip',
        validate(createNoteSchema, { stripUnknown: true }),
        (req, res) => {
          res.status(201).json({ success: true, data: req.body });
        }
      );
    });

    it('should remove unknown fields', async () => {
      const response = await request(app)
        .post('/api/strip')
        .send({
          title: 'Title',
          content: 'Content',
          extraField: 'should be removed',
          anotherExtra: 123
        });

      expect(response.status).toBe(201);
      expect(response.body.data).not.toHaveProperty('extraField');
      expect(response.body.data).not.toHaveProperty('anotherExtra');
      expect(response.body.data).toMatchObject({
        title: 'Title',
        content: 'Content'
      });
    });
  });
});
