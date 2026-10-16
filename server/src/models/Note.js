// Note.js - Mongoose Data Model for Note Documents
// This file defines the structure, data types, and validation rules for notes stored in MongoDB.

const mongoose = require('mongoose');

// Define Schema for notes
const noteSchema = new mongoose.Schema(
  {
    // Title of the note (String, mandatory)
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
    },

    // Detailed content of the note (String, mandatory)
    content: {
      type: String,
      required: [true, 'Note content is required'],
      trim: true,
    },

    // Array of string tags for categorizing notes (e.g. ['college', 'project'])
    tags: {
      type: [String],
      default: [],
    },

    // Boolean flag to pin important notes to the top of the list
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    // Automatically creates and manages 'createdAt' and 'updatedAt' Date fields
    timestamps: true,
  }
);

// Create the 'Note' model from the schema
const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
