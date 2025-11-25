const { listCategorias } = require('../models/categoriaModel');

async function getCategorias(req, res) {
  try {
    const categorias = await listCategorias();
    return res.status(200).json({ categorias });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Erro interno' });
  }
}

module.exports = {
  getCategorias,
};