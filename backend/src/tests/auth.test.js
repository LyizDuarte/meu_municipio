const request = require('supertest');
const app = require('../app');

describe('Auth endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('retorna 400 quando faltam campos obrigatórios', async () => {
      const res = await request(app).post('/api/auth/register').send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/login', () => {
    it('retorna 400 quando faltam email e senha', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('GET /api/auth/me', () => {
    it('retorna 401 quando não há token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
    });
  });
});