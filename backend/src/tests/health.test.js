const request = require('supertest');
const app = require('../app');

describe('GET /api/health', () => {
  it('deve responder com status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});