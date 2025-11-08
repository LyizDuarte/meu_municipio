const { listEstados } = require('../models/estadoModel');
const { listCidadesByEstado } = require('../models/cidadeModel');

async function getEstados(req, res) {
  try {
    const estados = await listEstados();
    return res.status(200).json({ estados });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Erro interno' });
  }
}

async function getCidades(req, res) {
  try {
    const id_estado = parseInt(req.query.id_estado);
    if (!id_estado || Number.isNaN(id_estado)) {
      return res.status(400).json({ message: 'Parâmetro id_estado é obrigatório e deve ser numérico' });
    }
    const cidades = await listCidadesByEstado(id_estado);
    return res.status(200).json({ cidades });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Erro interno' });
  }
}

module.exports = {
  getEstados,
  getCidades,
};