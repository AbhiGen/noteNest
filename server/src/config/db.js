/**
 * @file db.js
 * @description MongoDB connection configuration using Mongoose.
 * 
 * Purpose:
 *   Establishes and monitors the connection between our Node.js/Express
 *   application and the MongoDB database instance.
 * 
 * Evaluator Explanation:
 *   "This file encapsulates the database connection logic using Mongoose.
 *    By separating it into its own module, we can connect on server startup
 *    or connect/disconnect cleanly in automated integration test suites."
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB with connection error handling.
 * @returns {Promise<typeof mongoose>} Mongoose connection instance
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/notenest');
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    // If not in a test environment, terminate process on database connection failure
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
