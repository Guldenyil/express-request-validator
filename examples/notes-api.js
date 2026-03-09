/**
 * Example usage of note validation schemas
 */

import express from 'express';
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
    pattern: /^(true|false)$/i,
    transform: (value) => value.toLowerCase() === 'true'
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

const noteIdSchema = {
  id: {
    required: true,
    transform: (value) => {
      const num = parseInt(value, 10);
      if (isNaN(num)) {
        throw new Error('Note ID must be a valid number');
      }
      return num;
    }
  }
};

const app = express();
app.use(express.json());

// Example: Create note endpoint with validation
app.post('/api/notes', validate(createNoteSchema), (req, res) => {
  // req.body is validated and sanitized
  // title is trimmed, isPinned has default value
  const note = req.body;
  
  console.log('Creating note:', note);
  
  res.status(201).json({
    success: true,
    data: {
      id: 1,
      ...note,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
});

// Example: Update note endpoint with partial validation
app.put('/api/notes/:id', 
  validate(noteIdSchema, { source: 'params' }),
  validate(updateNoteSchema, { partial: true }),
  (req, res) => {
    const noteId = req.params.id; // Already validated and converted to number
    const updates = req.body;     // Only provided fields are validated
    
    console.log(`Updating note ${noteId}:`, updates);
    
    res.json({
      success: true,
      data: {
        id: noteId,
        ...updates,
        updatedAt: new Date()
      }
    });
  }
);

// Example: Get notes with query parameter validation
app.get('/api/notes',
  validate(noteQuerySchema, { source: 'query', strict: false }),
  (req, res) => {
    const { category, isPinned, search, sortBy, order, page, limit } = req.query;
    
    console.log('Fetching notes with filters:', req.query);
    
    // All query params are validated and transformed
    // page and limit are converted to numbers
    // isPinned is converted to boolean
    // sortBy and order have default values
    
    res.json({
      success: true,
      data: [],
      pagination: {
        page,
        limit,
        total: 0
      }
    });
  }
);

// Example: Get single note
app.get('/api/notes/:id',
  validate(noteIdSchema, { source: 'params' }),
  (req, res) => {
    const noteId = req.params.id; // Validated and converted to number
    
    console.log(`Fetching note ${noteId}`);
    
    res.json({
      success: true,
      data: {
        id: noteId,
        title: 'Example Note',
        content: 'This is an example'
      }
    });
  }
);

// Example: Delete note
app.delete('/api/notes/:id',
  validate(noteIdSchema, { source: 'params' }),
  (req, res) => {
    const noteId = req.params.id;
    
    console.log(`Deleting note ${noteId}`);
    
    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  }
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Example server running on http://localhost:${PORT}`);
  console.log('\\nTry these endpoints:');
  console.log('  POST   /api/notes');
  console.log('  GET    /api/notes?category=work&isPinned=true');
  console.log('  GET    /api/notes/1');
  console.log('  PUT    /api/notes/1');
  console.log('  DELETE /api/notes/1');
});
