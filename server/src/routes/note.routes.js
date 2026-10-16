/**
 * @file note.routes.js
 * @description Note management REST API endpoints.
 * 
 * Endpoints:
 *   GET    /api/notes      - List all notes for authenticated user (supports ?search & ?tag)
 *   POST   /api/notes      - Create a new note
 *   GET    /api/notes/:id  - Get a specific note by ID
 *   PUT    /api/notes/:id  - Update a note
 *   DELETE /api/notes/:id  - Delete a note
 * 
 * Security:
 *   All endpoints use the `protect` middleware to guarantee valid authentication
 *   before reaching any controller logic.
 */

const express = require('express');
const router = express.Router();
const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} = require('../controllers/note.controller');
const { protect } = require('../middleware/auth.middleware');

// Protect all note routes with JWT authentication middleware
router.use(protect);

router.route('/')
  .get(getNotes)
  .post(createNote);

router.route('/:id')
  .get(getNoteById)
  .put(updateNote)
  .delete(deleteNote);

module.exports = router;
