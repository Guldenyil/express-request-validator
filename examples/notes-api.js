/**
 * Example usage of note validation schemas
 */

const express = require('express');
const { validate } = require('../index');
const {
  createNoteSchema,
  updateNoteSchema,
  noteQuerySchema,
  noteIdSchema
} = require('../schemas/note');

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
