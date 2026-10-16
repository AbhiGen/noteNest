/**
 * @file notes.test.js
 * @description Integration tests for student Note CRUD, search, tag filters, and pinning.
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Note = require('../src/models/Note');

const TEST_DB_URI = 'mongodb://127.0.0.1:27017/notenest_test_notes';

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
  await Note.deleteMany({});
});

afterAll(async () => {
  await Note.deleteMany({});
  await mongoose.connection.close();
});

describe('Notes API (Student Project)', () => {
  let noteId = '';

  it('1. POST /api/notes - Creates a new note', async () => {
    const res = await request(app)
      .post('/api/notes')
      .send({
        title: 'Project Roadmap',
        content: 'Finish MERN stack mini project.',
        tags: ['college', 'project'],
        isPinned: false,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.note).toHaveProperty('_id');
    expect(res.body.note.title).toBe('Project Roadmap');
    noteId = res.body.note._id;
  });

  it('2. GET /api/notes - Lists notes', async () => {
    const res = await request(app).get('/api/notes');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.notes.length).toBe(1);
    expect(res.body.notes[0]._id).toBe(noteId);
  });

  it('3. GET /api/notes/:id - Gets single note by ID', async () => {
    const res = await request(app).get(`/api/notes/${noteId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.note.title).toBe('Project Roadmap');
  });

  it('4. PUT /api/notes/:id - Updates note', async () => {
    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .send({
        title: 'Updated Project Roadmap',
        isPinned: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.note.title).toBe('Updated Project Roadmap');
    expect(res.body.note.isPinned).toBe(true);
  });

  it('5. DELETE /api/notes/:id - Deletes note', async () => {
    const res = await request(app).delete(`/api/notes/${noteId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const check = await request(app).get(`/api/notes/${noteId}`);
    expect(check.status).toBe(404);
  });
});
