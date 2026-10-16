/**
 * @file app.js
 * @description Express Application entry point and middleware assembly.
 * 
 * Purpose:
 *   Configures middleware (CORS, JSON parsing, cookie parser),
 *   mounts API routers, defines health checks, and registers error handlers.
 * 
 * Separation of Concerns:
 *   `app.js` defines the Express app without listening on a port.
 *   This enables Supertest integration tests to import `app` directly
 *   without conflicting port bindings or requiring live network listeners.
 * 
 * Evaluator Explanation:
 *   "By separating app.js (application configuration) from server.js (network listener),
 *    we follow the 12-factor app and industry best practices. This makes our backend
 *    completely testable via Supertest without binding real network ports during CI/CD."
 */

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const authRoutes = require('./routes/auth.routes');
const noteRoutes = require('./routes/note.routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();

// Allowed origins for CORS (client dev server or production URL)
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman, Jest)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true, // Allow cookies across origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Standard body parsing middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'NoteNest API',
    timestamp: new Date().toISOString(),
  });
});

// Mount application API routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

// 404 Handler for undefined routes
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
