// note.controller.js - Note CRUD Business Logic & Database Operations
// This file contains all handler functions for creating, reading, updating, and deleting notes using Mongoose.

const Note = require('../models/Note');

// 1. Get all notes from MongoDB (with optional search and tag filters)
// Method: GET /api/notes
const getNotes = async (req, res) => {
  try {
    const { search, tag } = req.query;
    let query = {};

    // If search term is provided, filter notes by matching title OR content (case-insensitive)
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { content: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // If tag filter is provided, filter notes that include this tag
    if (tag && tag.trim() !== '') {
      query.tags = tag.trim().toLowerCase();
    }

    // Sort: pinned notes first (isPinned: -1), then newest first (updatedAt: -1)
    const notes = await Note.find(query).sort({ isPinned: -1, updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. Get a single note by its MongoDB _id
// Method: GET /api/notes/:id
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    // If note does not exist in database, return 404 Not Found
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    res.status(200).json({
      success: true,
      note,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. Create a new note in MongoDB
// Method: POST /api/notes
const createNote = async (req, res) => {
  try {
    const { title, content, tags, isPinned } = req.body;

    // Basic validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required fields',
      });
    }

    // Save note in MongoDB
    const note = await Note.create({
      title: title.trim(),
      content: content.trim(),
      tags: Array.isArray(tags) ? tags : [],
      isPinned: Boolean(isPinned),
    });

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 4. Update an existing note in MongoDB
// Method: PUT /api/notes/:id
const updateNote = async (req, res) => {
  try {
    const { title, content, tags, isPinned } = req.body;

    // Build the update object with provided fields
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
    if (isPinned !== undefined) updateData.isPinned = Boolean(isPinned);

    // findByIdAndUpdate returns the updated document when { new: true } is passed
    const updatedNote = await Note.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedNote) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      note: updatedNote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 5. Delete a note permanently from MongoDB
// Method: DELETE /api/notes/:id
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
};
