const express = require('express');
const router = express.Router();
const {
  createPost,
  getPost,
  getMyPosts,
  getAllPosts,
  updatePost,
  deletePost,
  getPostsByUser,
  addComment,
  getComments,
  deleteComment,
  supportPost,
  unsupportPost,
  sharePost,
} = require('../controllers/postController');
const authMiddleware = require('../middlewares/auth');
const { uploadMiddleware } = require('../middlewares/upload');

// Rotas públicas
router.get('/', getAllPosts);
router.get('/:id', getPost);
router.get('/user/:id_usuario', getPostsByUser);

// Comentários
router.get('/:id/comments', getComments); // listar comentários de um post
router.post('/:id/comments', authMiddleware, addComment); // comentar em um post
router.delete('/:id/comments/:commentId', authMiddleware, deleteComment); // remover comentário próprio

// Apoios
router.post('/:id/support', authMiddleware, supportPost); // apoiar (curtir/descurtir)
router.delete('/:id/support', authMiddleware, unsupportPost); // remover apoio

// Compartilhamento
router.post('/:id/share', authMiddleware, sharePost);

// Rotas protegidas relacionadas a posts
router.post('/', authMiddleware, uploadMiddleware, createPost);
router.get('/my/posts', authMiddleware, getMyPosts);
router.put('/:id', authMiddleware, updatePost);
router.delete('/:id', authMiddleware, deletePost);

module.exports = router;