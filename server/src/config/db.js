// db.js - MongoDB Connection Configuration
// This file connects our Express application to MongoDB using the Mongoose ODM library.

const mongoose = require('mongoose');

// Asynchronous function to connect to the MongoDB database
async function connectDB() {
  try {
    // Connect to database URI from .env or fallback to local MongoDB instance
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/notenest'
    );

    console.log(`MongoDB connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error.message);

    // If database connection fails outside of tests, stop the server
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }

    throw error;
  }
}

module.exports = connectDB;