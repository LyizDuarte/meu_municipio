const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const healthRoutes = require('./health');
const postRoutes = require('./posts');
const locationRoutes = require('./locations');
const categoryRoutes = require('./categories');

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/posts', postRoutes);
router.use('/locations', locationRoutes);
router.use('/categories', categoryRoutes);

module.exports = router;