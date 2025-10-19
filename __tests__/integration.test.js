const request = require('supertest');
const { app, pool } = require('../server');

describe('Integration Tests', () => {
  test('GET /api/notes should return 200 and array of notes', async () => {
    const response = await request(app).get('/api/notes');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /api/version should return version info', async () => {
    const response = await request(app).get('/api/version');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('environment');
  });

  afterAll(async () => {
    await pool.end(); // Gracefully close the DB pool
  });
});
