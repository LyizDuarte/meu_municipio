const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const healthRoutes = require('./health');
const postRoutes = require('./posts');

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/posts', postRoutes);

module.exports = router;