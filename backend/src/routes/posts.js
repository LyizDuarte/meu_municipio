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
  getPostsLikedByUser,
  getPostsCommentedByUser,
  addComment,
  getComments,
  deleteComment,
  supportPost,
  unsupportPost,
  sharePost,
  unsharePost,
} = require('../controllers/postController');
const authMiddleware = require('../middlewares/auth');
const { uploadMiddleware } = require('../middlewares/upload');

// Rotas públicas
router.get('/', getAllPosts);
// IMPORTANTE: rotas de usuário devem vir ANTES de '/:id' para não colidir
router.get('/user/:id_usuario', getPostsByUser);
router.get('/user/:id_usuario/likes', getPostsLikedByUser);
router.get('/user/:id_usuario/comments', getPostsCommentedByUser);
router.get('/:id', getPost);

// Comentários
router.get('/:id/comments', getComments); // listar comentários de um post
router.post('/:id/comments', authMiddleware, addComment); // comentar em um post
router.delete('/:id/comments/:commentId', authMiddleware, deleteComment); // remover comentário próprio

// Apoios
router.post('/:id/support', authMiddleware, supportPost); // apoiar (curtir/descurtir)
router.delete('/:id/support', authMiddleware, unsupportPost); // remover apoio

// Compartilhamento
router.post('/:id/share', authMiddleware, sharePost);
router.delete('/:id/share', authMiddleware, unsharePost);

// Rotas protegidas relacionadas a posts
router.post('/', authMiddleware, uploadMiddleware, createPost);
router.get('/my/posts', authMiddleware, getMyPosts);
router.put('/:id', authMiddleware, updatePost);
router.delete('/:id', authMiddleware, deletePost);

module.exports = router;
