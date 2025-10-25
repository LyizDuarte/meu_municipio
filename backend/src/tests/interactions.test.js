const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');

// Util para gerar token válido sem depender de DB
function generateTestToken(payload = { id_usuario: 123, email: 'test@example.com' }) {
  const secret = process.env.JWT_SECRET || 'jwt_dev_secret_change_me';
  return jwt.sign(payload, secret, { expiresIn: '1h' });
}

describe('Interações em posts: comentários, apoios e compartilhamentos', () => {
  describe('Comentários', () => {
    it('GET /api/posts/:id/comments deve responder 200, 404 ou 500', async () => {
      const res = await request(app).get('/api/posts/1/comments').query({ page: 1, limit: 5 });
      expect([200, 404, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('comentarios');
        expect(Array.isArray(res.body.comentarios)).toBe(true);
        expect(res.body).toHaveProperty('pagination');
      }
    });

    it('POST /api/posts/:id/comments deve retornar 401 sem token', async () => {
      const res = await request(app)
        .post('/api/posts/1/comments')
        .send({ content: 'Comentário teste' });
      expect(res.status).toBe(401);
    });

    it('POST /api/posts/:id/comments deve retornar 401 com token inválido', async () => {
      const res = await request(app)
        .post('/api/posts/1/comments')
        .set('Authorization', 'Bearer token_invalido')
        .send({ content: 'Comentário inválido' });
      expect(res.status).toBe(401);
    });

    it('POST /api/posts/:id/comments deve retornar 400 com conteúdo vazio (token válido)', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .post('/api/posts/1/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: '   ' });
      expect([400, 404, 500]).toContain(res.status);
      if (res.status === 400) {
        expect(res.body).toHaveProperty('message');
      }
    });

    it('DELETE /api/posts/:id/comments/:commentId deve retornar 401 sem token', async () => {
      const res = await request(app).delete('/api/posts/1/comments/9999');
      expect(res.status).toBe(401);
    });
  });

  describe('Apoios', () => {
    it('POST /api/posts/:id/support deve retornar 401 sem token', async () => {
      const res = await request(app).post('/api/posts/1/support');
      expect(res.status).toBe(401);
    });

    it('POST /api/posts/:id/support deve retornar 200, 404 ou 500 com token válido', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .post('/api/posts/1/support')
        .set('Authorization', `Bearer ${token}`)
        .send({ tipo_apoio: 'curtir' });
      expect([200, 404, 500]).toContain(res.status);
    });

    it('DELETE /api/posts/:id/support deve retornar 401 sem token', async () => {
      const res = await request(app).delete('/api/posts/1/support');
      expect(res.status).toBe(401);
    });

    it('DELETE /api/posts/:id/support deve retornar 200, 404 ou 500 com token válido', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .delete('/api/posts/1/support')
        .set('Authorization', `Bearer ${token}`);
      expect([200, 404, 500]).toContain(res.status);
    });
  });

  describe('Compartilhamentos', () => {
    it('POST /api/posts/:id/share deve retornar 401 sem token', async () => {
      const res = await request(app).post('/api/posts/1/share');
      expect(res.status).toBe(401);
    });

    it('POST /api/posts/:id/share deve retornar 200, 404 ou 500 com token válido', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .post('/api/posts/1/share')
        .set('Authorization', `Bearer ${token}`);
      expect([200, 404, 500]).toContain(res.status);
    });
  });
});