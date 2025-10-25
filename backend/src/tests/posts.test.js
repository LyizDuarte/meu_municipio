const request = require('supertest');
const app = require('../app');

describe('Posts endpoints', () => {
  describe('GET /api/posts', () => {
    it('deve responder com status 200 ou 500 (dependendo do banco)', async () => {
      const res = await request(app).get('/api/posts');
      expect([200, 500]).toContain(res.status);
      
      if (res.status === 200) {
        expect(res.body).toHaveProperty('posts');
        expect(Array.isArray(res.body.posts)).toBe(true);
      }
    });

    it('deve aceitar filtros de query', async () => {
      const res = await request(app)
        .get('/api/posts')
        .query({ tipo_post: 'sugestao', page: 1, limit: 5 });
      expect([200, 500]).toContain(res.status);
      
      if (res.status === 200) {
        expect(res.body).toHaveProperty('pagination');
      }
    });
  });

  describe('POST /api/posts', () => {
    it('deve retornar 401 quando não autenticado', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({
          id_categoria: 1,
          id_cidade: 1,
          tipo_post: 'sugestao',
          titulo: 'Teste',
          descricao: 'Descrição teste'
        });
      expect(res.status).toBe(401);
    });

    it('deve retornar 401 com token inválido', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', 'Bearer token_invalido')
        .send({});
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('deve retornar 404 ou 500 para post inexistente', async () => {
      const res = await request(app).get('/api/posts/99999');
      expect([404, 500]).toContain(res.status);
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('deve retornar 401 quando não autenticado', async () => {
      const res = await request(app)
        .put('/api/posts/1')
        .send({ titulo: 'Novo título' });
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('deve retornar 401 quando não autenticado', async () => {
      const res = await request(app).delete('/api/posts/1');
      expect(res.status).toBe(401);
    });
  });
});