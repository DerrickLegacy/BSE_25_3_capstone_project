const request = require('supertest');
const app = require('../server'); // You may need to export your app from server.js

describe('Integration Tests', () => {
  test('GET /api/books should return 200 and data', async () => {
    const response = await request(app).get('/api/books?firstName=*');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
