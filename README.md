# Express Request Validator

Lightweight Express.js middleware for declarative request validation with schema-based rules.

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

// Define validation schema
const noteSchema = {
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
  isPinned: {
    required: false,
    type: 'boolean',
    default: false
  }
};

// Use middleware in routes
app.post('/api/notes', validate(noteSchema), (req, res) => {
  // req.body is validated and sanitized
  res.json({ success: true, data: req.body });
});

app.listen(3000);
```

## Features

- ✅ Declarative schema-based validation
- ✅ Type checking (string, number, boolean, array, object)
- ✅ Length and range validation
- ✅ Pattern matching (regex)
- ✅ Custom validators
- ✅ Data transformation (trim, type conversion)
- ✅ Partial validation for PATCH/PUT requests
- ✅ Consistent error responses
- ✅ Zero dependencies
- ✅ Lightweight (~2KB)

## Documentation

See [full documentation](./docs/README.md) for:
- Complete API reference
- Schema definition guide
- Advanced usage examples
- Custom validators
- Testing strategies

## License

MIT
