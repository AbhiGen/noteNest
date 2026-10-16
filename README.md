# 🪶 NoteNest — Secure Personal Notes Manager

> A full-stack MERN application built for the **Full Stack Frameworks** individual mini project evaluation on **16 October 2026**.

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-0d9488.svg)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-v20.18-339933.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-v18.3-61dafb.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-v5.4-646cff.svg)](https://vitejs.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Local%20%2F%20Atlas-47a248.svg)](https://mongodb.com)
[![Tests](https://img.shields.io/badge/Jest%20Tests-24%2F24%20Passing-brightgreen.svg)](https://jestjs.io)

---

## 📖 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [Prerequisites & System Requirements](#-prerequisites--system-requirements)
5. [Installation & Setup](#-installation--setup)
6. [Running the Application](#-running-the-application)
7. [Running Automated Tests](#-running-automated-tests)
8. [REST API Endpoints](#-rest-api-endpoints)
9. [Project Structure](#-project-structure)
10. [Screenshots Guide](#-screenshots-guide)
11. [Known Limitations & Future Enhancements](#-known-limitations--future-enhancements)
12. [Documentation Index](#-documentation-index)

---

## 🌟 Project Overview

**NoteNest** is a secure, personal productivity web application engineered to solve real-world problems in digital note-taking: confidentiality, multi-tenant isolation, instant retrieval, and intuitive categorization. 

Unlike simple demo applications, NoteNest prioritizes **defensive security architecture**:
- **Stateless Authentication:** JSON Web Tokens (JWT) stored in HTTP-only cookies and Authorization headers.
- **Credential Protection:** Passwords securely salted and hashed using `bcryptjs`.
- **Absolute Tenant Isolation:** Enforces user ownership (`userId: req.user.id`) across every single database query, permanently preventing Insecure Direct Object References (IDOR).
- **Refreshing Design System:** Built with an eye-soothing, professional color palette: Coral Terracotta (`#DF896B`), Midnight Navy (`#202B43`), Cool Slate Grey (`#F4F6FA`), and pastel categorization tags (`#DDF1E9`, `#FFF0CC`, `#FBE1E7`, `#EAE5FC`) matching modern productivity suites.

---

## ✨ Key Features

- 🔐 **User Authentication:** Registration with validation, login with credential checking, profile retrieval (`/api/auth/me`), and logout.
- 📝 **Full Note CRUD:** Create notes, view list, inspect single note, update note contents, and delete notes with a safety confirmation dialog.
- 📌 **Pinning & Prioritized Sorting:** Pin important notes to the top of your workspace; automatic secondary sorting by most recently updated (`updatedAt`).
- 🏷️ **Smart Tagging:** Add dynamic tags via comma or Enter keypress; filter dashboard notes instantly by clicking tag pills.
- 🔍 **Real-Time Debounced Search:** Search dynamically across both note titles and content simultaneously.
- 🛡️ **Protected Route Guards:** Intercepts unauthenticated navigation in React and halts unauthenticated API calls on Express.
- 🎨 **Polished UX:** Intentional empty states, responsive modals, live character counters, and loading spinners.

---

## 🛠️ Technology Stack

| Layer | Technology | Reason Chosen |
|---|---|---|
| **Frontend** | React 18 | Declarative component model, state hooks, and fast Virtual DOM reconciliation. |
| **Build Tool** | Vite 5 | Instant cold server start, blazing-fast Hot Module Replacement (HMR). |
| **Routing** | React Router 6 | Client-side routing with route guards (`ProtectedRoute.jsx`). |
| **HTTP Client** | Axios | Interceptors, default base URLs, automatic JSON serialization, and credentials support (`withCredentials: true`). |
| **Styling** | Plain CSS | Complete design freedom, zero utility-class bloat, custom CSS design system with reusable variables. |
| **Backend** | Node.js + Express 4 | Fast, non-blocking asynchronous I/O, robust middleware ecosystem. |
| **Database** | MongoDB + Mongoose 8 | Flexible document schema, validation hooks, compound indexing. |
| **Security** | bcryptjs + jsonwebtoken | Industry-standard password hashing and cryptographically signed tokens. |
| **Testing** | Jest + Supertest | Automated integration testing for HTTP APIs and database assertions. |

---

## 📋 Prerequisites & System Requirements

Ensure you have installed:
- **Node.js**: v18.x or v20.x+ (`node -v`)
- **npm**: v9.x or v10.x+ (`npm -v`)
- **MongoDB**: Local MongoDB Server running on `127.0.0.1:27017` or MongoDB Atlas URI.

---

## 🚀 Installation & Setup

Clone or open the project folder in your terminal:

```bash
cd full_stack_mini_project
```

### 1. Install Backend Dependencies
```bash
cd server
npm install
```

Verify or configure `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/notenest
JWT_SECRET=notenest_secure_jwt_secret_key_student_eval_2026
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
```

### 2. Install Frontend Dependencies
```bash
cd ../client
npm install
```

---

## 💻 Running the Application

### Start the Backend Server (Terminal 1)
```bash
cd server
npm run dev
# Or: npm start
```
*Backend runs on: `http://localhost:5000`*

### Start the Frontend Dev Server (Terminal 2)
```bash
cd client
npm run dev
```
*Frontend runs on: `http://localhost:5173`*

Open **`http://localhost:5173`** in your browser.

---

## 🧪 Running Automated Tests

NoteNest includes comprehensive integration test suites verifying all authentication flows, note CRUD operations, validation rules, and cross-user data isolation:

```bash
cd server
npm test
```

### Actual Test Execution Output:
```text
PASS tests/auth.test.js
  Authentication API (POST /api/auth/...)
    ✓ 1. POST /api/auth/register - Should register a new user successfully (201)
    ✓ 2. POST /api/auth/register - Should reject duplicate email registration (400)
    ✓ 3. POST /api/auth/register - Should reject registration with missing fields (400)
    ✓ 4. POST /api/auth/login - Should login successfully with correct credentials (200)
    ✓ 5. POST /api/auth/login - Should reject login with invalid password (401)
    ✓ 6. POST /api/auth/login - Should reject login with unregistered email (401)
    ✓ 7. GET /api/auth/me - Should return current user profile with valid token (200)
    ✓ 8. GET /api/auth/me - Should reject unauthenticated requests without token (401)
    ✓ 9. POST /api/auth/logout - Should clear token cookie (200)

PASS tests/notes.test.js
  Notes API & Cross-User Security
    ✓ 1. GET /api/notes - Unauthenticated user cannot access notes (401)
    ✓ 2. POST /api/notes - Creates a note for User A with timestamps (201)
    ✓ 3. POST /api/notes - Rejects note creation with missing title (400)
    ✓ 4. POST /api/notes - Rejects note creation with missing content (400)
    ✓ 5. GET /api/notes - User A can see their own note
    ✓ 6. DATA ISOLATION: User B cannot see User A's note in notes list
    ✓ 7. DATA ISOLATION: User B cannot view User A's note by ID (404)
    ✓ 8. DATA ISOLATION: User B cannot update User A's note (404)
    ✓ 9. DATA ISOLATION: User B cannot delete User A's note (404)
    ✓ 10. PUT /api/notes/:id - User A can update their own note and pin it (200)
    ✓ 11. Sorting: Pinned notes appear first
    ✓ 12. Search: GET /api/notes?search=Roadmap filters by keyword
    ✓ 13. Tag Filter: GET /api/notes?tag=college filters by tag
    ✓ 14. Invalid ObjectId: GET /api/notes/invalid123 returns 400
    ✓ 15. DELETE /api/notes/:id - User A can delete their note (200)

Test Suites: 2 passed, 2 total
Tests:       24 passed, 24 total
Snapshots:   0 total
Time:        5.915 s
```

---

## 📡 REST API Endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create new account & issue JWT cookie/token |
| `POST` | `/api/auth/login` | Public | Authenticate credentials & issue JWT |
| `POST` | `/api/auth/logout` | Public | Clear session cookie |
| `GET` | `/api/auth/me` | Protected | Verify active session & return profile |
| `GET` | `/api/notes` | Protected | List user's notes (supports `?search` & `?tag`) |
| `POST` | `/api/notes` | Protected | Create new note for authenticated user |
| `GET` | `/api/notes/:id` | Protected | Get note by ID (user-isolated) |
| `PUT` | `/api/notes/:id` | Protected | Update note (user-isolated) |
| `DELETE` | `/api/notes/:id` | Protected | Delete note (user-isolated) |
| `GET` | `/api/health` | Public | Backend health check & server status |

---

## 📁 Project Structure

```text
NoteNest/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js            # Axios client with credentials & interceptors
│   │   ├── components/
│   │   │   ├── Sidebar.jsx         # Left navigation sidebar with counts & tag dots
│   │   │   ├── NoteCard.jsx        # Note card with pastel tags, pin, edit, delete
│   │   │   ├── NoteModal.jsx       # Modal for create & edit note with tags
│   │   │   ├── DeleteConfirmModal.jsx # Delete confirmation dialog
│   │   │   └── ProtectedRoute.jsx  # Route guard redirecting to /login
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Global authentication state & operations
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx       # User login view with validation
│   │   │   ├── RegisterPage.jsx    # User registration view
│   │   │   └── DashboardPage.jsx   # Notes workspace, search, tags, pinned
│   │   ├── styles/
│   │   │   ├── index.css           # Global design system & typography tokens
│   │   │   ├── auth.css            # Styles for auth cards
│   │   │   └── dashboard.css       # Styles for dashboard, cards, modals
│   │   ├── App.jsx                 # Client routes
│   │   └── main.jsx                # React DOM entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # Mongoose MongoDB connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.js  # Register, login, logout, getMe
│   │   │   └── note.controller.js  # Note CRUD, search, tags, pinning
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js  # JWT extraction & verification
│   │   │   └── error.middleware.js # CastError, ValidationError, 404, 500
│   │   ├── models/
│   │   │   ├── User.js             # User schema with bcrypt pre-save hook
│   │   │   └── Note.js             # Note schema with compound indexes
│   │   ├── routes/
│   │   │   ├── auth.routes.js      # Auth router definition
│   │   │   └── note.routes.js      # Note router definition
│   │   ├── app.js                  # Express app setup (separated for Supertest)
│   │   └── server.js               # Network listener on port 5000
│   ├── tests/
│   │   ├── auth.test.js            # Automated auth tests (9 test cases)
│   │   └── notes.test.js           # Automated notes tests (15 test cases)
│   ├── .env
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── PROJECT_REPORT.md           # Formal academic project report
│   ├── ARCHITECTURE.md            # Request flow, sequence diagrams, architecture
│   ├── API_DOCUMENTATION.md       # Complete REST API specification
│   ├── DATABASE_SCHEMA.md         # ER diagram, Mongoose schemas, isolation
│   ├── SETUP_AND_DEPLOYMENT.md    # Local setup and deployment instructions
│   └── VIVA_QUESTIONS.md          # 35 technical viva questions & answers
├── .gitignore
└── README.md
```

---

## 📸 Screenshots Guide

To capture real screenshots for your presentation or project report:

1. **Login & Registration:** Open `http://localhost:5173/login` and `http://localhost:5173/register`.
2. **Empty Dashboard:** Register a new user and capture the "Your nest is empty" intentional state.
3. **Notes Dashboard:** Create 2–3 notes, pin one note, and capture the distinct amber styling of the Pinned section.
4. **Create / Edit Modal:** Open the note modal and capture tag chip creation and title counter.
5. **Delete Confirmation Dialog:** Click the trash icon and capture the modal preventing accidental deletion.
6. **Search & Tag Filter:** Type a keyword into the search bar or click a tag pill to capture filtered results.

---

## ⚠️ Known Limitations & Future Enhancements

### Known Limitations
- The JWT expiration is fixed to 7 days; a production system would combine 15-minute access tokens with refresh tokens in Redis.
- Text search uses regex substring matching; for millions of notes, MongoDB Atlas full-text indexing would be preferred.

### Future Enhancements
- Markdown rendering with preview tab.
- Trash bin / soft deletion with 30-day restore.
- Note color coding and folder categorization.
- Export notes as Markdown, PDF, or JSON.

---

## 📚 Documentation Index

For complete evaluations and viva preparation, refer to:
- 📑 [Project Report](docs/PROJECT_REPORT.md)
- 🏗️ [Architecture & Request Flow](docs/ARCHITECTURE.md)
- 🔌 [REST API Documentation](docs/API_DOCUMENTATION.md)
- 🗄️ [Database Schema & Tenancy](docs/DATABASE_SCHEMA.md)
- ⚙️ [Setup & Deployment Guide](docs/SETUP_AND_DEPLOYMENT.md)
- 🎓 [Viva Questions & Answers](docs/VIVA_QUESTIONS.md)
#   n o t e N e s t  
 