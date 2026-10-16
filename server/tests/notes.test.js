/**
 * @file notes.test.js
 * @description Automated integration tests for Note CRUD, search, tag filters, pinning, and strict cross-user isolation.
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Note = require('../src/models/Note');

const TEST_DB_URI = 'mongodb://127.0.0.1:27017/notenest_test_notes';

let tokenA = '';
let tokenB = '';
let userA = null;
let userB = null;

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
  await User.deleteMany({});
  await Note.deleteMany({});

  // Register User A
  const resA = await request(app).post('/api/auth/register').send({
    name: 'User A',
    email: 'usera@example.com',
    password: 'password123',
  });
  tokenA = resA.body.token;
  userA = resA.body.user;

  // Register User B
  const resB = await request(app).post('/api/auth/register').send({
    name: 'User B',
    email: 'userb@example.com',
    password: 'password123',
  });
  tokenB = resB.body.token;
  userB = resB.body.user;
});

afterAll(async () => {
  await User.deleteMany({});
  await Note.deleteMany({});
  await mongoose.connection.close();
});

describe('Notes API & Cross-User Security', () => {
  let noteAId = '';

  it('1. GET /api/notes - Unauthenticated user cannot access notes (401)', async () => {
    const res = await request(app).get('/api/notes');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('2. POST /api/notes - Creates a note for User A with timestamps (201)', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Project Roadmap',
        content: 'Finish MERN stack mini project evaluation on 16 Oct.',
        tags: ['college', 'project', 'urgent'],
        isPinned: false,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.note).toHaveProperty('_id');
    expect(res.body.note.title).toBe('Project Roadmap');
    expect(res.body.note.tags).toContain('college');
    expect(res.body.note).toHaveProperty('createdAt');
    expect(res.body.note).toHaveProperty('updatedAt');

    noteAId = res.body.note._id;
  });

  it('3. POST /api/notes - Rejects note creation with missing title (400)', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        content: 'Content without title',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('4. POST /api/notes - Rejects note creation with missing content (400)', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Title without content',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('5. GET /api/notes - User A can see their own note', async () => {
    const res = await request(app)
      .get('/api/notes')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.notes.length).toBe(1);
    expect(res.body.notes[0]._id).toBe(noteAId);
  });

  // ================= CRITICAL ISOLATION TESTS =================
  it('6. DATA ISOLATION: User B cannot see User A\'s note in notes list', async () => {
    const res = await request(app)
      .get('/api/notes')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.notes.length).toBe(0); // User B has 0 notes
  });

  it('7. DATA ISOLATION: User B cannot view User A\'s note by ID (404)', async () => {
    const res = await request(app)
      .get(`/api/notes/${noteAId}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('8. DATA ISOLATION: User B cannot update User A\'s note (404)', async () => {
    const res = await request(app)
      .put(`/api/notes/${noteAId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        title: 'Hacked by User B',
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);

    // Verify User A's note was NOT altered
    const checkRes = await request(app)
      .get(`/api/notes/${noteAId}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(checkRes.body.note.title).toBe('Project Roadmap');
  });

  it('9. DATA ISOLATION: User B cannot delete User A\'s note (404)', async () => {
    const res = await request(app)
      .delete(`/api/notes/${noteAId}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
  // ============================================================

  it('10. PUT /api/notes/:id - User A can update their own note and pin it (200)', async () => {
    const res = await request(app)
      .put(`/api/notes/${noteAId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Updated Project Roadmap',
        isPinned: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.note.title).toBe('Updated Project Roadmap');
    expect(res.body.note.isPinned).toBe(true);
  });

  it('11. Sorting: Pinned notes appear first', async () => {
    // Create an unpinned note
    await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Random thoughts',
        content: 'Some quick thoughts.',
        isPinned: false,
      });

    const res = await request(app)
      .get('/api/notes')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.notes.length).toBe(2);
    // The first note must be pinned
    expect(res.body.notes[0].isPinned).toBe(true);
    expect(res.body.notes[1].isPinned).toBe(false);
  });

  it('12. Search: GET /api/notes?search=Roadmap filters by keyword', async () => {
    const res = await request(app)
      .get('/api/notes?search=Roadmap')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.notes.length).toBe(1);
    expect(res.body.notes[0].title).toContain('Roadmap');
  });

  it('13. Tag Filter: GET /api/notes?tag=college filters by tag', async () => {
    const res = await request(app)
      .get('/api/notes?tag=college')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.notes.length).toBe(1);
    expect(res.body.notes[0].tags).toContain('college');
  });

  it('14. Invalid ObjectId: GET /api/notes/invalid123 returns 400', async () => {
    const res = await request(app)
      .get('/api/notes/invalid123')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('15. DELETE /api/notes/:id - User A can delete their note (200)', async () => {
    const res = await request(app)
      .delete(`/api/notes/${noteAId}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify note is gone
    const checkRes = await request(app)
      .get(`/api/notes/${noteAId}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(checkRes.status).toBe(404);
  });
});
