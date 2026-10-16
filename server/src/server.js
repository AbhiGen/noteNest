// server.js - Backend Entry Point
// This file initializes and starts our Express HTTP server and connects to the database.

const app = require('./app');
const connectDB = require('./config/db');

// Set the port number from environment variables or default to 5000
const PORT = process.env.PORT || 5000;

// Start database connection first, then start listening for HTTP requests
const startServer = async () => {
  try {
    // 1. Connect to MongoDB database
    await connectDB();

    // 2. Start the Express server on specified PORT
    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 NoteNest Server running on http://localhost:${PORT}`);
      console.log(`📡 Health Check URL: http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1); // Exit process if server cannot connect or start
  }
};

// Execute start server function
startServer();
