# NoteNest — REST API Documentation

**Base URL:** `http://localhost:5000/api`  
**Data Format:** JSON (`Content-Type: application/json`)  
**Authentication:** Cookie (`token=<jwt>`) or Authorization Header (`Bearer <jwt>`)

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Endpoint:** `POST /api/auth/register`
- **Access:** Public
- **Description:** Registers a new user account, hashes the password with bcrypt, generates a signed JWT, and sets an HTTP-only cookie.
- **Request Body:**
```json
{
  "name": "Aarav Sharma",
  "email": "aarav@example.com",
  "password": "password123"
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "user": {
    "id": "670ba5e80123456789abcdef",
    "name": "Aarav Sharma",
    "email": "aarav@example.com",
    "createdAt": "2026-10-13T09:23:13.088Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Error Responses:**
  - `400 Bad Request` (Missing fields): `{"success": false, "message": "Please provide all required fields: name, email, and password."}`
  - `400 Bad Request` (Duplicate email): `{"success": false, "message": "An account with this email address already exists."}`

---

### 1.2 Login User
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Description:** Verifies credentials, generates signed JWT, and sets an HTTP-only cookie.
- **Request Body:**
```json
{
  "email": "aarav@example.com",
  "password": "password123"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged in successfully.",
  "user": {
    "id": "670ba5e80123456789abcdef",
    "name": "Aarav Sharma",
    "email": "aarav@example.com",
    "createdAt": "2026-10-13T09:23:13.088Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Error Responses:**
  - `401 Unauthorized` (Invalid credentials): `{"success": false, "message": "Invalid email or password."}`

---

### 1.3 Get Current User Profile
- **Endpoint:** `GET /api/auth/me`
- **Access:** Private (Protected via JWT)
- **Description:** Returns the profile of the authenticated user decoded from token.
- **Success Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "670ba5e80123456789abcdef",
    "name": "Aarav Sharma",
    "email": "aarav@example.com",
    "createdAt": "2026-10-13T09:23:13.088Z"
  }
}
```
- **Error Responses:**
  - `401 Unauthorized` (Token missing or expired): `{"success": false, "message": "Access denied. No authentication token provided."}`

---

### 1.4 Logout User
- **Endpoint:** `POST /api/auth/logout`
- **Access:** Public
- **Description:** Clears the HTTP-only `token` cookie.
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

---

## 2. Note Management Endpoints

All note endpoints require authentication.

### 2.1 Get All Notes (with Search & Tag Filtering)
- **Endpoint:** `GET /api/notes`
- **Access:** Private (Protected)
- **Query Parameters:**
  - `search` (optional): Substring to match against note title or content (case-insensitive).
  - `tag` (optional): Exact tag name to filter by.
- **Example URL:** `/api/notes?search=framework&tag=college`
- **Success Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "notes": [
    {
      "_id": "6acdf8819953627df9fc9140",
      "userId": "670ba5e80123456789abcdef",
      "title": "Full Stack Frameworks Exam",
      "content": "Evaluation on 16 October 2026. Review React state and JWT.",
      "tags": ["college", "exam"],
      "isPinned": true,
      "createdAt": "2026-10-13T09:23:13.088Z",
      "updatedAt": "2026-10-13T09:23:13.088Z"
    }
  ]
}
```

---

### 2.2 Create Note
- **Endpoint:** `POST /api/notes`
- **Access:** Private (Protected)
- **Description:** Creates a new note assigned strictly to the authenticated user's ID.
- **Request Body:**
```json
{
  "title": "Weekend Grocery List",
  "content": "Almond milk, oats, apples, green tea.",
  "tags": ["personal", "errands"],
  "isPinned": false
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Note created successfully.",
  "note": {
    "_id": "6acdf8819953627df9fc9141",
    "userId": "670ba5e80123456789abcdef",
    "title": "Weekend Grocery List",
    "content": "Almond milk, oats, apples, green tea.",
    "tags": ["personal", "errands"],
    "isPinned": false,
    "createdAt": "2026-10-13T09:25:00.000Z",
    "updatedAt": "2026-10-13T09:25:00.000Z"
  }
}
```
- **Error Responses:**
  - `400 Bad Request` (Missing title): `{"success": false, "message": "Note title is required."}`
  - `400 Bad Request` (Title too long): `{"success": false, "message": "Title cannot exceed 120 characters."}`

---

### 2.3 Get Single Note by ID
- **Endpoint:** `GET /api/notes/:id`
- **Access:** Private (Protected)
- **Description:** Fetches an individual note if and only if owned by the logged-in user.
- **Success Response (200 OK):**
```json
{
  "success": true,
  "note": {
    "_id": "6acdf8819953627df9fc9140",
    "userId": "670ba5e80123456789abcdef",
    "title": "Full Stack Frameworks Exam",
    "content": "Evaluation on 16 October 2026.",
    "tags": ["college"],
    "isPinned": true,
    "createdAt": "2026-10-13T09:23:13.088Z",
    "updatedAt": "2026-10-13T09:23:13.088Z"
  }
}
```
- **Error Responses:**
  - `400 Bad Request` (Invalid ID): `{"success": false, "message": "Invalid Note ID format."}`
  - `404 Not Found` (Not found or owned by another user): `{"success": false, "message": "Note not found."}`

---

### 2.4 Update Note
- **Endpoint:** `PUT /api/notes/:id`
- **Access:** Private (Protected)
- **Description:** Updates fields (`title`, `content`, `tags`, `isPinned`) of an owned note.
- **Request Body (partial updates allowed):**
```json
{
  "title": "Updated Title",
  "isPinned": true
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Note updated successfully.",
  "note": {
    "_id": "6acdf8819953627df9fc9140",
    "title": "Updated Title",
    "isPinned": true,
    "updatedAt": "2026-10-13T09:28:00.000Z"
  }
}
```
- **Error Responses:**
  - `404 Not Found` (Unauthorized or nonexistent): `{"success": false, "message": "Note not found or unauthorized."}`

---

### 2.5 Delete Note
- **Endpoint:** `DELETE /api/notes/:id`
- **Access:** Private (Protected)
- **Description:** Permanently deletes a note if and only if owned by the authenticated user.
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Note deleted successfully.",
  "id": "6acdf8819953627df9fc9140"
}
```
- **Error Responses:**
  - `404 Not Found`: `{"success": false, "message": "Note not found or unauthorized."}`

---

## 3. System & Health Check

### 3.1 Server Health
- **Endpoint:** `GET /api/health`
- **Access:** Public
- **Success Response (200 OK):**
```json
{
  "status": "ok",
  "service": "NoteNest API",
  "timestamp": "2026-10-13T09:23:03.637Z"
}
```
