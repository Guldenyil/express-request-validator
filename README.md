# Express Request Validator

A lightweight, zero-dependency Express.js middleware for declarative request validation. Define schemas once, validate everywhere.

## Features

- ✅ **Zero dependencies** - No external packages required
- 🚀 **Simple API** - Define validation rules in plain JavaScript objects
- 🎯 **Type-safe** - Built-in validators for common types (string, number, boolean, array)
- 🔧 **Flexible** - Validate `body`, `query`, `params`, or custom sources
- 🎨 **Transformations** - Automatically transform and sanitize data
- 📝 **Clear errors** - Structured error responses with field-level details
- ⚡ **Fast** - Minimal overhead, no parsing complexity
- 🔌 **Composable** - Chain multiple validations per route

## Installation

```bash
npm install express-request-validator
```

## Quick Start

```javascript
const express = require('express');
const { validate } = require('express-request-validator');

const app = express();
app.use(express.json());

// Define a schema
const createUserSchema = {
  name: {
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 50,
    trim: true
  },
  email: {
    required: true,
    type: 'string',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorMessage: 'Invalid email format'
  },
  age: {
    required: false,
    type: 'number',
    min: 18,
    max: 120
  }
};

// Use the middleware
app.post('/users', validate(createUserSchema), (req, res) => {
  // req.body is validated and sanitized
  const user = req.body;
  res.status(201).json({ success: true, data: user });
});

app.listen(3000);
```

## API Reference

### `validate(schema, options)`

Creates a validation middleware for Express routes.

**Parameters:**

- `schema` (Object): Validation schema defining rules for each field
- `options` (Object, optional): Configuration options
  - `source` (string): Where to validate from - `'body'`, `'query'`, `'params'`, or custom path (default: `'body'`)
  - `partial` (boolean): Allow partial validation - only validate provided fields (default: `false`)
  - `strict` (boolean): Reject requests with unknown fields (default: `false`)
  - `stripUnknown` (boolean): Remove unknown fields from request (default: `false`)
  - `abortEarly` (boolean): Stop validation on first error (default: `false`)

**Returns:** Express middleware function

**Example:**

```javascript
// Validate request body
app.post('/api/notes', validate(createNoteSchema), handler);

// Validate query parameters
app.get('/api/notes', validate(querySchema, { source: 'query' }), handler);

// Validate URL parameters
app.get('/api/notes/:id', validate(idSchema, { source: 'params' }), handler);

// Partial update - only validate provided fields
app.patch('/api/notes/:id', validate(updateSchema, { partial: true }), handler);

// Strict mode - reject unknown fields
app.post('/api/notes', validate(schema, { strict: true }), handler);
```

## Schema Definition

Each field in a schema can have the following validators:

### Built-in Validators

#### `required`
- **Type:** `boolean`
- **Description:** Field must be present and not null/undefined
- **Example:** `required: true`

#### `type`
- **Type:** `string`
- **Values:** `'string'`, `'number'`, `'boolean'`, `'array'`, `'object'`
- **Description:** Validates JavaScript type
- **Example:** `type: 'string'`

#### `minLength` / `maxLength`
- **Type:** `number`
- **Applies to:** Strings and Arrays
- **Description:** Minimum/maximum length constraint
- **Example:** `minLength: 1, maxLength: 200`

#### `min` / `max`
- **Type:** `number`
- **Applies to:** Numbers
- **Description:** Minimum/maximum value constraint
- **Example:** `min: 18, max: 120`

#### `pattern`
- **Type:** `RegExp`
- **Applies to:** Strings
- **Description:** Regular expression pattern matching
- **Example:** `pattern: /^#[0-9A-Fa-f]{6}$/`

#### `minItems` / `maxItems`
- **Type:** `number`
- **Applies to:** Arrays
- **Description:** Minimum/maximum array length
- **Example:** `minItems: 1, maxItems: 10`

#### `custom`
- **Type:** `function(value, field, allData) => boolean | string`
- **Description:** Custom validation function
- **Returns:** `true` if valid, error message string if invalid
- **Example:**
  ```javascript
  custom: (value) => {
    if (value && !['active', 'inactive'].includes(value)) {
      return 'Status must be active or inactive';
    }
    return true;
  }
  ```

### Transformations

Fields can be automatically transformed before validation:

#### `trim`
- **Type:** `boolean`
- **Applies to:** Strings
- **Description:** Remove leading/trailing whitespace
- **Example:** `trim: true`

#### `transform`
- **Type:** `function(value, field, allData) => any` or `string`
- **Description:** Custom transformation function or preset name
- **Presets:** `'trim'`, `'toNumber'`, `'toBoolean'`
- **Example:**
  ```javascript
  transform: (value) => value.toLowerCase()
  // or
  transform: 'toNumber'
  ```

#### `default`
- **Type:** `any`
- **Description:** Default value if field is missing
- **Example:** `default: false`

### Error Messages

#### `errorMessage`
- **Type:** `string`
- **Description:** Custom error message for this field
- **Example:** `errorMessage: 'Email must be in valid format'`

## Complete Schema Example

```javascript
const createNoteSchema = {
  title: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 200,
    trim: true,
    errorMessage: 'Title is required and must be 1-200 characters'
  },
  content: {
    required: true,
    type: 'string',
    maxLength: 10000
  },
  category: {
    required: false,
    type: 'string',
    maxLength: 50,
    trim: true,
    custom: (value) => {
      const allowed = ['personal', 'work', 'ideas'];
      if (value && !allowed.includes(value)) {
        return `Category must be one of: ${allowed.join(', ')}`;
      }
      return true;
    }
  },
  color: {
    required: false,
    type: 'string',
    pattern: /^#[0-9A-Fa-f]{6}$/,
    errorMessage: 'Color must be hex format (#RRGGBB)'
  },
  isPinned: {
    required: false,
    type: 'boolean',
    default: false,
    transform: 'toBoolean'
  },
  tags: {
    required: false,
    type: 'array',
    minItems: 1,
    maxItems: 5
  }
};
```

## Error Response Format

When validation fails, the middleware returns a 400 Bad Request with:

```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "value": "invalid-email"
    },
    {
      "field": "age",
      "message": "Must be at least 18",
      "value": 15
    }
  ]
}
```

## Usage Examples

### Basic CRUD Operations

```javascript
const express = require('express');
const { validate, schemas } = require('express-request-validator');

const app = express();
app.use(express.json());

// Create
app.post('/api/notes', 
  validate(schemas.createNoteSchema),
  (req, res) => {
    const note = req.body; // Validated and sanitized
    res.status(201).json({ success: true, data: note });
  }
);

// Read (with query filters)
app.get('/api/notes',
  validate(schemas.noteQuerySchema, { source: 'query' }),
  (req, res) => {
    const { category, isPinned, page, limit } = req.query;
    res.json({ success: true, data: [] });
  }
);

// Update (partial)
app.put('/api/notes/:id',
  validate(schemas.noteIdSchema, { source: 'params' }),
  validate(schemas.updateNoteSchema, { partial: true }),
  (req, res) => {
    const id = req.params.id;
    const updates = req.body;
    res.json({ success: true, data: { id, ...updates } });
  }
);

// Delete
app.delete('/api/notes/:id',
  validate(schemas.noteIdSchema, { source: 'params' }),
  (req, res) => {
    const id = req.params.id;
    res.json({ success: true, message: 'Deleted' });
  }
);
```

### Multiple Validations

Chain multiple validations to validate different sources:

```javascript
app.put('/api/users/:userId/posts/:postId',
  validate(userIdSchema, { source: 'params' }),
  validate(postIdSchema, { source: 'params' }),
  validate(updatePostSchema),
  (req, res) => {
    // All validated
    const { userId, postId } = req.params;
    const updates = req.body;
    res.json({ success: true });
  }
);
```

### Custom Source Path

Validate nested data:

```javascript
app.post('/api/bulk',
  validate(itemSchema, { source: 'body.items[0]' }),
  (req, res) => {
    res.json({ success: true });
  }
);
```

### Strict Mode

Reject requests with unexpected fields:

```javascript
app.post('/api/notes',
  validate(createNoteSchema, { strict: true }),
  (req, res) => {
    // Only schema-defined fields allowed
    res.status(201).json({ success: true });
  }
);
```

## Predefined Schemas

The package includes ready-to-use schemas for common use cases:

```javascript
const { schemas } = require('express-request-validator');

// Available schemas:
// - schemas.createNoteSchema
// - schemas.updateNoteSchema
// - schemas.noteQuerySchema
// - schemas.noteIdSchema
```

See [schemas/note.js](schemas/note.js) for details.

## Advanced Usage

### Custom Validator Functions

```javascript
const passwordSchema = {
  password: {
    required: true,
    type: 'string',
    minLength: 8,
    custom: (value) => {
      if (!/[A-Z]/.test(value)) {
        return 'Password must contain uppercase letter';
      }
      if (!/[a-z]/.test(value)) {
        return 'Password must contain lowercase letter';
      }
      if (!/[0-9]/.test(value)) {
        return 'Password must contain number';
      }
      return true;
    }
  }
};
```

### Conditional Validation

```javascript
const schema = {
  type: {
    required: true,
    type: 'string'
  },
  companyName: {
    required: false,
    type: 'string',
    custom: (value, field, data) => {
      if (data.type === 'business' && !value) {
        return 'Company name required for business accounts';
      }
      return true;
    }
  }
};
```

### Data Transformations

```javascript
const schema = {
  email: {
    required: true,
    type: 'string',
    transform: (value) => value.toLowerCase().trim()
  },
  tags: {
    required: false,
    type: 'array',
    transform: (value) => value.map(tag => tag.trim().toLowerCase())
  }
};
```

## Testing

Run tests with Jest:

```bash
npm test
```

See [examples/notes-api.js](examples/notes-api.js) for a complete working example.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Author

Created as part of the Mini Notes PWA project.
