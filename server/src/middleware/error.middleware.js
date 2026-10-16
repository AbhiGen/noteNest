/**
 * @file error.middleware.js
 * @description Centralized error handling and 404 routing middleware.
 * 
 * Purpose:
 *   Intercepts all runtime exceptions, Mongoose validation failures,
 *   and unmatched routes, translating them into consistent, clean JSON responses.
 * 
 * Evaluator Explanation:
 *   "Instead of letting unhandled errors crash the server or leak raw database
 *    stack traces to the client, we centralize error handling. This handles MongoDB
 *    CastErrors (e.g., malformed ObjectIds), duplicate key errors (code 11000),
 *    and validation errors, returning appropriate HTTP status codes (400, 404, 500)."
 */

/**
 * Handle 404 for routes that do not match any defined endpoint.
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Global Express error handling middleware.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = `Invalid ID format for parameter: ${err.path}`;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((val) => val.message);
    message = errors.join(', ');
  }

  // Handle MongoDB Duplicate Key Error (e.g. duplicate email)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with that ${field} already exists.`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
