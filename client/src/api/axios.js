// axios.js - Central Axios HTTP Client Setup
// This file creates a reusable Axios instance configured with a base URL for our backend API.

import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  // baseURL '/api' uses Vite's proxy (configured in vite.config.js) to forward requests to http://localhost:5000/api
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
