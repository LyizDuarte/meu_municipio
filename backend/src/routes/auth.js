const express = require('express');
const router = express.Router();
const { register, login, me, patchMe, patchAvatar } = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');
const { uploadAvatarMiddleware } = require('../middlewares/upload');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me (protegida)
router.get('/me', authMiddleware, me);

// PATCH /api/auth/me (protegida)
router.patch('/me', authMiddleware, patchMe);

// PATCH /api/auth/me/avatar (protegida, upload de avatar)
router.patch('/me/avatar', authMiddleware, uploadAvatarMiddleware, patchAvatar);

module.exports = router;
