/**
 * Validation schemas for notes
 * Predefined schemas ready to use with the validation middleware
 */

/**
 * Schema for creating a new note
 * All required fields must be provided
 */
const createNoteSchema = {
  title: {
    required: true,
    // type: "string",
    minLength: 1,
    maxLength: 200,
    trim: true,
    errorMessage: 'Title is required and must be between 1-200 characters'
  },
  content: {
    required: true,
    // type: "string",
    maxLength: 10000,
    errorMessage: 'Content is required and must not exceed 10000 characters'
  },
  category: {
    required: false,
    // type: "string",
    maxLength: 50,
    trim: true,
    custom: (value) => {
      // Optional: validate against allowed categories
      // const validCategories = ['personal', 'work', 'shopping', 'ideas'];
      // if (value && !validCategories.includes(value.toLowerCase())) {
      //   return `Category must be one of: ${validCategories.join(', ')}`;
      // }
      return true;
    }
  },
  color: {
    required: false,
    // type: "string",
    pattern: /^#[0-9A-Fa-f]{6}$/,
    errorMessage: 'Color must be in hex format (#RRGGBB)'
  },
  isPinned: {
    required: false,
    type: 'boolean',
    default: false,
    transform: (value) => {
      // Convert string to boolean if needed
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
      }
      return value;
    }
  }
};

/**
 * Schema for updating a note
 * All fields are optional (partial update)
 * Use with { partial: true } option
 */
const updateNoteSchema = {
  title: {
    required: false,
    // type: "string",
    minLength: 1,
    maxLength: 200,
    trim: true,
    errorMessage: 'Title must be between 1-200 characters'
  },
  content: {
    required: false,
    // type: "string",
    maxLength: 10000,
    errorMessage: 'Content must not exceed 10000 characters'
  },
  category: {
    required: false,
    // type: "string",
    maxLength: 50,
    trim: true
  },
  color: {
    required: false,
    // type: "string",
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

/**
 * Schema for query parameters when fetching notes
 * Used for filtering and pagination
 */
const noteQuerySchema = {
  category: {
    required: false,
    // type: "string",
    maxLength: 50,
    trim: true
  },
  isPinned: {
    required: false,
    // type: "string",
    pattern: /^(true|false)$/i,
    transform: (value) => value.toLowerCase() === 'true',
    errorMessage: 'isPinned must be "true" or "false"'
  },
  search: {
    required: false,
    // type: "string",
    maxLength: 200,
    trim: true
  },
  sortBy: {
    required: false,
    // type: "string",
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
    // type: "string",
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

/**
 * Schema for note ID parameter
 * Used when accessing a single note by ID
 */
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

module.exports = {
  createNoteSchema,
  updateNoteSchema,
  noteQuerySchema,
  noteIdSchema
};
