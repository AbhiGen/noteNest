/**
 * @file auth.routes.js
 * @description Authentication endpoint routing.
 * 
 * Endpoints:
 *   POST /api/auth/register - Register a new user
 *   POST /api/auth/login    - Authenticate user credentials
 *   POST /api/auth/logout   - Clear authentication cookie
 *   GET  /api/auth/me       - Verify session & return user profile
 */

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
