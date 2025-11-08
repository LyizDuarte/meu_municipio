const express = require('express');
const router = express.Router();
const { getEstados, getCidades } = require('../controllers/locationController');

// Rotas públicas de localização
router.get('/estados', getEstados);
router.get('/cidades', getCidades); // ?id_estado=ID

module.exports = router;