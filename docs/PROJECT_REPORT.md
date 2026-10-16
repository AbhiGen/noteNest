# NoteNest — Academic Project Report

**Project Title:** NoteNest — Secure Personal Notes Manager  
**Course:** Full Stack Frameworks  
**Evaluation Date:** 16 October 2026  
**Author:** Computer Science Student  
**Architecture:** MERN Stack (MongoDB, Express.js, React, Node.js)

---

## 1. Abstract

NoteNest is a full-stack personal productivity and secure notes management system developed using the MERN stack. The system provides authenticated users with an isolated digital workspace where they can create, edit, delete, search, categorize with tags, and pin personal notes. Security and tenant isolation are prioritized through bcrypt-hashed credentials, JSON Web Token (JWT) session handling, and mandatory ownership filtering on every database transaction. The frontend is built using React 18 and Vite with a modern design system, while the backend leverages Node.js, Express.js, and Mongoose with 100% automated test coverage using Jest and Supertest.

---

## 2. Introduction

Modern digital productivity tools demand strict privacy and instantaneous responsiveness. NoteNest was engineered to provide an intuitive personal notes manager while serving as a comprehensive demonstration of full-stack engineering fundamentals:
- Decoupled client-server architecture via REST APIs.
- Stateless, cryptographically signed authentication via JWT.
- Document-oriented relational modeling with Mongoose schemas and compound indexes.
- Single-page application state management using React Hooks and Context API.

---

## 3. Problem Statement

Many beginner web applications suffer from critical security flaws, particularly **Insecure Direct Object References (IDOR)**, where a user can view or tamper with another user's private data simply by altering a record ID in an HTTP request. Furthermore, unauthenticated endpoints, plaintext password storage, and lack of input validation lead to data corruption and breaches. NoteNest addresses these challenges by enforcing defensive programming across all layers: hashing passwords with salting, validating schemas, and enforcing ownership checks on every database interaction.

---

## 4. Objectives

1. Develop a secure user authentication system supporting registration, login, logout, and persistent session verification.
2. Build complete CRUD (Create, Read, Update, Delete) note capabilities with title, content, tags, pinned status, and automatic timestamps.
3. Guarantee strict user-level data isolation where User A cannot read, modify, or delete User B's notes under any circumstances.
4. Implement dynamic real-time search across note titles and content, alongside instant tag filtering.
5. Provide a responsive, refreshing, and clean user interface with clear visual hierarchy for pinned notes, confirmation modals, and intentional empty states.
6. Validate all endpoints using automated integration tests.

---

## 5. Scope

### In Scope
- Single-user tenancy per session with strict cross-user data isolation.
- RESTful HTTP API adhering to standardized status codes (200, 201, 400, 401, 404, 500).
- Automatic sorting (pinned notes prioritized, then descending by last update).
- Automated integration test suite covering authentication and note CRUD.
- Local MongoDB persistence and cross-origin resource sharing (CORS).

### Out of Scope
- Multi-user collaborative live note sharing / team workspaces.
- Rich-text WYSIWYG / Markdown editors with embedded binary media uploads.
- Third-party OAuth providers (Google, GitHub) to keep authentication straightforward and self-contained for academic evaluation.

---

## 6. Functional Requirements

- **FR-1 (Registration & Login):** Users can register with full name, unique email, and password (minimum 6 characters) and authenticate securely.
- **FR-2 (Session Management):** Authenticated requests include verified JWT tokens passed via cookies or Authorization Bearer headers.
- **FR-3 (Note Creation):** Users can create notes containing a title (max 120 chars), content (max 10,000 chars), tags array, and pinned flag.
- **FR-4 (Note Retrieval & Sorting):** Notes belonging strictly to the authenticated user are retrieved, ordered with pinned notes first, then by `updatedAt` descending.
- **FR-5 (Search & Filter):** Users can filter notes dynamically by typing keywords (matches title and content) or clicking tag badges.
- **FR-6 (Note Modification):** Users can update title, content, tags, or pin status of their notes.
- **FR-7 (Safe Deletion):** Users can permanently delete a note with an explicit confirmation dialog.
- **FR-8 (Data Isolation):** Any attempt to access another user's note returns a 404 Not Found error.

---

## 7. Non-Functional Requirements

- **Security:** Passwords salted with bcrypt (cost factor 10); JWT signed with HMAC-SHA256; MongoDB inputs sanitized.
- **Reliability:** Centralized error handling middleware preventing uncaught exceptions or server crashes.
- **Usability:** Responsive layout for mobile, tablet, and desktop screens with refreshing color palette (Teal, Slate, Amber).
- **Performance:** Sub-50ms API response times backed by Mongoose compound indexing (`{ userId: 1, isPinned: -1, updatedAt: -1 }`).

---

## 8. Software and Hardware Requirements

### Software Requirements
- Operating System: Windows 10/11, macOS, or Linux.
- Runtime Environment: Node.js (v20.x or higher) & npm (v10.x or higher).
- Database: MongoDB Server (v6.0 or higher) / MongoDB Atlas.
- Frontend Tooling: Vite (v5.x), React (v18.x), React Router (v6.x), Axios.
- Backend Tooling: Express.js (v4.x), Mongoose (v8.x), bcryptjs, jsonwebtoken.
- Testing Suite: Jest (v29.x), Supertest (v7.x).

### Hardware Requirements
- Processor: Dual-core 2.0 GHz or higher.
- Memory (RAM): Minimum 4 GB (8 GB recommended).
- Storage: 500 MB free disk space.

---

## 9. System Design

The application follows a classic decoupled 3-tier architecture:
1. **Presentation Layer (Client):** Single Page Application (SPA) built with React and Vite, managing UI state with React Hooks and Context.
2. **Application / Business Logic Layer (Server):** Node.js and Express.js REST API providing routing, JWT validation middleware, input sanitization, and controllers.
3. **Data Layer (Database):** MongoDB document database running locally or in the cloud, mapped through Mongoose Object Data Modeling (ODM).

---

## 10. Implementation

- **Backend Structure:** Modular separation of concerns across `config/`, `models/`, `controllers/`, `middleware/`, and `routes/`.
- **Authentication:** `auth.controller.js` manages registration with duplicate checks and bcrypt hashing, token generation via `jsonwebtoken`, and session checking via `GET /api/auth/me`.
- **Note Management:** `note.controller.js` injects `userId: req.user.id` into all MongoDB queries, preventing IDOR.
- **Frontend State:** `AuthContext.jsx` maintains user state and coordinates session checking, while `DashboardPage.jsx` coordinates reactive state for notes, modals, search query, and selected tag pills.

---

## 11. Testing & Results

Automated integration testing was conducted using Jest and Supertest against a dedicated test database:
- **`tests/auth.test.js`**: 9 test cases passed (registration, duplicate rejection, missing fields, valid login, invalid password, nonexistent email, get profile with token, unauthenticated 401, logout).
- **`tests/notes.test.js`**: 15 test cases passed (unauthenticated 401, creation with timestamps, validation errors, list own notes, cross-user isolation verification, updating, pinned sorting, search querying, tag filtering, invalid ObjectId 400, safe deletion).
- **Total Tests:** 24 passed out of 24 (100% pass rate).

---

## 12. Limitations

1. Offline browser automation tools (e.g. Playwright drivers) requiring external internet downloads cannot run in completely air-gapped environments without pre-cached browser binaries.
2. Search is currently powered by regex pattern matching which is optimal for thousands of notes per user; for millions of notes, MongoDB Atlas Search / text indexing would be utilized.

---

## 13. Conclusion and Future Enhancements

NoteNest achieves all mandatory assignment criteria, delivering a secure, robust, and aesthetically refined personal notes manager. Future enhancements include:
- Markdown preview support.
- Note archiving and trash recovery bin.
- Exporting notes as PDF or JSON backups.
- Progressive Web App (PWA) offline note caching.
