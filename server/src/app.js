// app.js - Express Application Setup & Middleware Configuration
// This file configures Express, attaches middlewares (CORS, JSON parsing), and mounts routes.

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file into process.env
dotenv.config();

// Import note routes
const noteRoutes = require('./routes/note.routes');

// Initialize the Express application
const app = express();

// Middleware 1: Enable Cross-Origin Resource Sharing (CORS) so frontend React can talk to backend Express
app.use(cors());

// Middleware 2: Parse incoming JSON request bodies (e.g., req.body in POST and PUT requests)
app.use(express.json());

// Middleware 3: Parse incoming URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Health check endpoint - useful to quickly test if backend is active
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'NoteNest API',
    time: new Date().toISOString(),
  });
});

// Mount the Notes CRUD API routes at /api/notes
app.use('/api/notes', noteRoutes);

// Global Error Handler Middleware - Catches unhandled errors and returns a clean JSON error response
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Export the app instance so server.js (or tests) can use it
module.exports = app;
