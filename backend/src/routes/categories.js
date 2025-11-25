const express = require('express');
const router = express.Router();
const { getCategorias } = require('../controllers/categoryController');

// Rota pública para listar categorias
router.get('/', getCategorias);

module.exports = router;