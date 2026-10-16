// note.routes.js - Express Router for Note API Endpoints
// This file maps HTTP URL paths and methods (GET, POST, PUT, DELETE) to their controller functions.

const express = require('express');
const router = express.Router();

// Import controller functions that contain the database logic
const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} = require('../controllers/note.controller');

// Route for /api/notes
// GET  /api/notes -> List all notes (supports ?search= and ?tag= query params)
// POST /api/notes -> Create a new note
router.route('/')
  .get(getNotes)
  .post(createNote);

// Route for /api/notes/:id
// GET    /api/notes/:id -> Fetch one specific note by its MongoDB _id
// PUT    /api/notes/:id -> Update an existing note by its _id
// DELETE /api/notes/:id -> Delete a note by its _id
router.route('/:id')
  .get(getNoteById)
  .put(updateNote)
  .delete(deleteNote);

module.exports = router;
