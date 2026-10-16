# NoteNest — Comprehensive Viva & Technical Evaluation Guide

This guide contains **35 essential viva questions with simple, precise, beginner-friendly answers**, specifically tailored to the NoteNest codebase for your Full Stack Frameworks evaluation on 16 October 2026.

---

## Section 1: Architecture & Full-Stack Fundamentals

### Q1: What does the MERN stack stand for, and what role does each component play in NoteNest?
**Answer:**
- **M - MongoDB:** NoSQL database that stores data as JSON-like BSON documents (`users` and `notes` collections).
- **E - Express.js:** Minimalist Node.js web framework providing HTTP routing, middleware, and request/response handling.
- **R - React:** Frontend library that builds declarative, reactive single-page user interfaces.
- **N - Node.js:** JavaScript runtime engine executing backend code outside the browser.

---

### Q2: What is the difference between Authentication and Authorization?
**Answer:**
- **Authentication:** Verifying *who you are* (e.g., verifying user credentials via email and password in `POST /api/auth/login`).
- **Authorization:** Verifying *what you have permission to do* (e.g., ensuring User A cannot read or delete User B's notes in `DELETE /api/notes/:id`).

---

### Q3: What is a REST API, and what principles does NoteNest follow?
**Answer:**
REST (Representational State Transfer) is an architectural style for distributed web services. NoteNest follows REST by:
1. Using standard HTTP methods (`GET` for reading, `POST` for creating, `PUT` for updating, `DELETE` for removing).
2. Being stateless (the server doesn't store session state; every request carries its own JWT).
3. Using resource-oriented URLs (e.g., `/api/notes` and `/api/notes/:id`).
4. Returning standardized JSON data and appropriate HTTP status codes.

---

### Q4: Why did you use PUT instead of POST or PATCH for updating notes?
**Answer:**
- `POST` is used to create a new resource (`POST /api/notes`).
- `PUT` is used to replace or update an existing resource at a specific URI (`PUT /api/notes/:id`).
- `PATCH` is for partial updates, but `PUT` is standard in CRUD REST evaluations when updating editable records. In NoteNest, `PUT /api/notes/:id` updates title, content, tags, or pinned status safely.

---

### Q5: What is CORS, and why is it necessary in this project?
**Answer:**
CORS (Cross-Origin Resource Sharing) is a browser security mechanism that blocks web pages from making HTTP requests to a different domain or port than the one that served the web page. Since Vite runs on port `5173` and Express runs on port `5000`, CORS middleware in Express explicitly permits requests from `http://localhost:5173` with credentials (`withCredentials: true`).

---

## Section 2: Backend (Node.js & Express.js)

### Q6: What is Express middleware, and how does `next()` work?
**Answer:**
Middleware is a function that has access to the request object (`req`), response object (`res`), and the `next` function in the application's request-response cycle. It can execute code, modify `req` or `res`, end the request, or call `next()` to pass control to the subsequent middleware or controller.

---

### Q7: Why is `app.js` separated from `server.js` in your backend?
**Answer:**
To separate application configuration from network listening. `app.js` sets up routes and middleware without calling `.listen()`. This allows Supertest in Jest to test HTTP endpoints directly without occupying network ports. `server.js` connects to MongoDB and starts listening on port 5000.

---

### Q8: How does your centralized error handler in `error.middleware.js` work?
**Answer:**
Express recognizes error handlers by their four parameters: `(err, req, res, next)`. When any controller catches an error and calls `next(error)`, Express skips all regular routes and directs the request to `errorHandler`, which formats Mongoose CastErrors (invalid ObjectIds) and ValidationErrors into clean JSON with status 400 or 500.

---

### Q9: What HTTP status codes does NoteNest return, and when?
**Answer:**
- **200 OK:** Successful retrieval, update, or deletion.
- **201 Created:** Successful creation of a user or note.
- **400 Bad Request:** Validation failure, missing fields, or invalid ObjectId.
- **401 Unauthorized:** Missing, expired, or invalid JWT authentication token.
- **404 Not Found:** Note or route does not exist (also returned when accessing another user's note).
- **500 Internal Server Error:** Unexpected server-side database or runtime exception.

---

## Section 3: Authentication & Security (JWT & bcrypt)

### Q10: How does password hashing with `bcryptjs` work?
**Answer:**
Plaintext passwords are never stored. In `User.js`, a Mongoose `pre('save')` hook generates a cryptographic salt (work factor 10) and hashes the password into a one-way hash. When the user logs in, `bcrypt.compare()` hashes the incoming password with the stored salt to verify the match without ever decrypting the password.

---

### Q11: What is a JSON Web Token (JWT), and what are its three parts?
**Answer:**
A JWT is a compact, URL-safe means of securely transmitting claims between parties. Its three parts separated by dots are:
1. **Header:** Algorithm and token type (`{"alg": "HS256", "typ": "JWT"}`).
2. **Payload:** Claims such as user ID and expiration (`{"id": "...", "exp": 1729000000}`).
3. **Signature:** Cryptographic hash of the header and payload signed with our server's secret key (`JWT_SECRET`).

---

### Q12: How does NoteNest mitigate Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF)?
**Answer:**
- **XSS Mitigation:** The JWT is stored in an `httpOnly` cookie (`httpOnly: true`), which prevents malicious JavaScript running in the browser from accessing or stealing the token.
- **CSRF Mitigation:** The cookie uses `sameSite: 'lax'`, preventing the cookie from being sent in cross-site requests. Additionally, sensitive state mutations require explicit JSON headers.

---

### Q13: How does NoteNest guarantee user data isolation?
**Answer:**
We never trust a `userId` supplied in the request body or URL parameters. Every note operation extracts the authenticated user's ID directly from the verified JWT (`req.user.id`). Furthermore, every database query includes `{ userId: req.user.id }`. If User B attempts to manipulate User A's note ID, the query returns `null` and responds with 404.

---

## Section 4: Database (MongoDB & Mongoose)

### Q14: What is Mongoose, and why use it instead of the native MongoDB driver?
**Answer:**
Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It provides schema validation, type casting, default values, pre/post middleware hooks, and model methods, ensuring structured and reliable database interactions.

---

### Q15: What is the purpose of `timestamps: true` in Mongoose schemas?
**Answer:**
It instructs Mongoose to automatically add and manage two date fields on every document: `createdAt` (set upon insertion) and `updatedAt` (updated whenever `.save()` is called). NoteNest uses `updatedAt` to display the "Updated: Oct 13, 2026" timestamp on note cards.

---

### Q16: Why did you create compound indexes in the Note schema?
**Answer:**
In `Note.js`, we defined `noteSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 })`. Because our main dashboard query filters by `userId` and sorts by `isPinned` descending and `updatedAt` descending, this compound index satisfies both the filter and the sort directly from the index tree in RAM, avoiding slow in-memory sorting.

---

### Q17: What is a MongoDB ObjectId, and how long is it?
**Answer:**
An ObjectId is a 12-byte (24-character hexadecimal) unique identifier generated by MongoDB. It consists of a 4-byte timestamp, a 5-byte random value, and a 3-byte incrementing counter.

---

## Section 5: Frontend (React 18 & Vite)

### Q18: Why did you choose Vite instead of Create React App (CRA)?
**Answer:**
Vite uses native ES modules (ESM) and an esbuild pre-bundler, delivering near-instant server starts and hot module replacement (HMR), whereas Create React App is slower and now deprecated by the React team.

---

### Q19: What is the purpose of React Context API in NoteNest?
**Answer:**
`AuthContext.jsx` provides global state management for the authenticated user object (`user`, `loading`, `login`, `register`, `logout`). This prevents "prop drilling" (passing authentication props manually through every level of the component tree).

---

### Q20: How does `ProtectedRoute.jsx` work?
**Answer:**
It wraps protected routes in React Router. If the authentication state is still loading from `/api/auth/me`, it renders a clean loading spinner. If the user is unauthenticated, it returns `<Navigate to="/login" replace />`. If the user is authenticated, it renders the protected child components (`<DashboardPage />`).

---

### Q21: What is a controlled component in React?
**Answer:**
A component whose form inputs are controlled by React state. In `NoteModal.jsx` and `LoginPage.jsx`, input elements have `value={title}` and `onChange={(e) => setTitle(e.target.value)}`. React state is the single source of truth for the input's current value.

---

### Q22: What does `useMemo` do in `DashboardPage.jsx`?
**Answer:**
`useMemo` memoizes expensive computations. In `DashboardPage.jsx`, it extracts all unique tags from the notes list (`allUniqueTags`) and splits notes into `pinnedNotes` and `otherNotes`. These calculations only recalculate when the `notes` dependency array changes, preventing redundant processing on every render.

---

### Q23: Why is debouncing used for the search bar in `DashboardPage.jsx`?
**Answer:**
Debouncing delays calling the `fetchNotes` API until the user stops typing for 250 milliseconds (`setTimeout`). This prevents sending an HTTP request on every single keystroke, reducing server load and network traffic while keeping search responsive.

---

### Q24: What is `withCredentials: true` in Axios?
**Answer:**
By default, cross-origin HTTP requests do not send cookies. Setting `withCredentials: true` in `client/src/api/axios.js` instructs the browser to include our HTTP-only `token` cookie when making requests to `http://localhost:5000`.

---

## Section 6: Testing & Quality Assurance

### Q25: How did you test the backend endpoints?
**Answer:**
We wrote automated integration tests using Jest and Supertest (`tests/auth.test.js` and `tests/notes.test.js`). Supertest simulates HTTP requests against the Express app and asserts status codes, headers, and JSON response bodies.

---

### Q26: What specific tests did you write to verify cross-user data isolation?
**Answer:**
In `tests/notes.test.js`, we registered two distinct test users (User A and User B). User A created a note. We then used User B's token to attempt:
1. `GET /api/notes`: Verified User A's note is NOT visible in User B's list.
2. `GET /api/notes/:id`: Verified User B receives HTTP 404.
3. `PUT /api/notes/:id`: Verified User B cannot alter User A's note (HTTP 404).
4. `DELETE /api/notes/:id`: Verified User B cannot delete User A's note (HTTP 404).

---

## Section 7: Code-Specific File & Function Walkthrough

### Q27: Explain what `auth.middleware.js` does in detail.
**Answer:**
It checks `req.cookies.token` first, then falls back to `req.headers.authorization` (`Bearer <token>`). If no token exists, it halts with 401. If a token exists, it calls `jwt.verify()`. Upon verification, it attaches `{ id, email }` to `req.user` and calls `next()`.

---

### Q28: In `note.controller.js`, how does `createNote` handle tags?
**Answer:**
`createNote` sanitizes incoming tags via a custom Mongoose setter in `Note.js`. It trims whitespace, converts tags to lowercase, strips duplicates using a `Set`, and filters out empty strings.

---

### Q29: How does NoteNest sort pinned notes first?
**Answer:**
In `note.controller.js`, the query executes `.sort({ isPinned: -1, updatedAt: -1 })`. Because Boolean `true` is treated as 1 and `false` as 0 in MongoDB indexing, descending sort (`-1`) places pinned notes first, followed by the latest updated notes.

---

### Q30: How does tag chip creation work in `NoteModal.jsx`?
**Answer:**
When the user types inside the tag input and presses `Enter` or `,`, `handleAddTag` intercepts the event, trims the tag, verifies it is non-empty and unique, appends it to the `tags` state array, and clears the input field.

---

## Section 8: Five Challenging Follow-Up Questions

### Q31: If an attacker steals a user's JWT, can they access their notes? How would you revoke it?
**Answer:**
Because standard JWTs are stateless, any possession of a valid, unexpired token grants access. To allow instant revocation in production, we could:
1. Implement a token blacklist in Redis storing revoked token IDs (jti) until their expiration time.
2. Use short-lived access tokens (15 minutes) paired with rotating refresh tokens stored in the database.

---

### Q32: Why return 404 instead of 403 when User B tries to access User A's note?
**Answer:**
Returning `403 Forbidden` informs an attacker that the resource exists and belongs to someone else (resource enumeration). Returning `404 Not Found` reveals zero information about whether the ID exists, completely neutralizing enumeration attacks.

---

### Q33: How would NoteNest scale if a single user had 500,000 notes?
**Answer:**
1. **Pagination:** We would implement cursor-based or limit/skip pagination (`?page=1&limit=20`) on `GET /api/notes`.
2. **MongoDB Text Search:** Replace regex search with MongoDB Atlas Search / text indexes (`noteSchema.index({ title: 'text', content: 'text' })`) for fast full-text scoring.
3. **Compound Indexes:** Our compound index `{ userId: 1, isPinned: -1, updatedAt: -1 }` already ensures sorting is completed using index scans.
    
---

### Q34: What happens if MongoDB goes down while the Express server is running?
**Answer:**
Mongoose buffers operations for 10,000ms by default before timing out. In NoteNest, database connection errors are caught in our centralized error handler, returning an HTTP 500 JSON response rather than crashing the Node process. For clustering, PM2 or container health probes would automatically restart or alert the infrastructure.

---

### Q35: What would happen if a user entered `<script>alert('hacked')</script>` into a note?
**Answer:**
React automatically escapes all rendered strings inside JSX (`<p>{note.content}</p>`), treating it as plaintext rather than executable HTML/JavaScript. This prevents DOM-based XSS attacks out of the box.
