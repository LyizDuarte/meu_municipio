const express = require('express');
const router = express.Router();
const {
  createPost,
  getPost,
  getMyPosts,
  getAllPosts,
  updatePost,
  deletePost,
  getPostsByUser
} = require('../controllers/postController');
const authMiddleware = require('../middlewares/auth');
const { uploadMiddleware } = require('../middlewares/upload');

// Rotas públicas
// GET /api/posts - Listar todos os posts (com filtros opcionais)
router.get('/', getAllPosts);

// GET /api/posts/:id - Obter um post específico
router.get('/:id', getPost);

// GET /api/posts/user/:id_usuario - Obter posts de um usuário específico
router.get('/user/:id_usuario', getPostsByUser);

// Rotas protegidas (requerem autenticação)
// POST /api/posts - Criar novo post (com upload de mídia)
router.post('/', authMiddleware, uploadMiddleware, createPost);

// GET /api/posts/my/posts - Obter meus posts
router.get('/my/posts', authMiddleware, getMyPosts);

// PUT /api/posts/:id - Atualizar post
router.put('/:id', authMiddleware, updatePost);

// DELETE /api/posts/:id - Deletar post
router.delete('/:id', authMiddleware, deletePost);

module.exports = router;