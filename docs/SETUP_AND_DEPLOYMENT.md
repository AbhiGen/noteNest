# NoteNest — Setup & Deployment Guide

This guide provides step-by-step instructions for running NoteNest locally, configuring environment variables, running automated tests, and troubleshooting common setup issues.

---

## 1. Prerequisites

Before installing, ensure your development machine has:
- **Node.js**: Version 18.x or 20.x+ (`node -v`)
- **npm**: Version 9.x or 10.x+ (`npm -v`)
- **MongoDB**: Local MongoDB Server running on port 27017 or a MongoDB Atlas connection string URI.

---

## 2. Directory Structure Overview

```text
full_stack_mini_project/
  server/      <- Express & Mongoose Backend API
  client/      <- React & Vite Frontend Single-Page App
  docs/        <- Comprehensive Project Documentation
  README.md    <- Project overview and quickstart
```

---

## 3. Backend Setup

### Step 1: Navigate to Server Directory
```bash
cd server
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create or verify `.env` inside `server/`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/notenest
JWT_SECRET=notenest_secure_jwt_secret_key_student_eval_2026
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
```

> **Note:** If using MongoDB Atlas, replace `MONGODB_URI` with your connection string:
> `mongodb+srv://<username>:<password>@cluster0.mongodb.net/notenest?retryWrites=true&w=majority`

### Step 4: Run Automated Tests
```bash
npm test
```
*Expected result:* All 24 tests in `tests/auth.test.js` and `tests/notes.test.js` pass with 100% success.

### Step 5: Start Backend Server
```bash
# For development with auto-reload:
npm run dev

# Or standard production start:
npm start
```
*The server will start listening on `http://localhost:5000`.*

---

## 4. Frontend Setup

### Step 1: Open a New Terminal and Navigate to Client
```bash
cd client
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start Frontend Dev Server
```bash
npm run dev
```
*Vite will start the client on `http://localhost:5173`.*

### Step 4: Build for Production (Optional)
To test the production build:
```bash
npm run build
```
Build output is saved to `client/dist/`.

---

## 5. Verification Checklist

1. Open your browser and navigate to: `http://localhost:5173/`
2. You should be redirected automatically to `http://localhost:5173/login`.
3. Click "Create an account" and register a test user.
4. On the dashboard, click "+ Create Note", add title, content, tags, and pin status.
5. Verify your note card is rendered and persists on browser refresh.

---

## 6. Troubleshooting Common Issues

### Issue 1: MongoDB Connection Refused (`ECONNREFUSED 127.0.0.1:27017`)
- **Cause:** MongoDB service is not started on Windows.
- **Solution:** Open PowerShell as Administrator and run:
  ```powershell
  Start-Service MongoDB
  ```
  Or check status with `Get-Service MongoDB`.

### Issue 2: Port 5000 or 5173 Already in Use
- **Cause:** Another process is occupying the port.
- **Solution:**
  ```powershell
  # Find PID occupying port 5000
  Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess
  # Or change PORT in server/.env to 5001
  ```

### Issue 3: CORS Error in Browser Console
- **Cause:** Backend `CLIENT_ORIGIN` does not match the frontend origin.
- **Solution:** Ensure `CLIENT_ORIGIN=http://localhost:5173` in `server/.env`.
