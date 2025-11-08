const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const healthRoutes = require('./health');
const postRoutes = require('./posts');
const locationRoutes = require('./locations');

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/posts', postRoutes);
router.use('/locations', locationRoutes);

module.exports = router;