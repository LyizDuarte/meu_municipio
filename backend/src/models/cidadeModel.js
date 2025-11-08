const pool = require('../config/database');

async function listCidadesByEstado(id_estado) {
  const [rows] = await pool.execute(
    'SELECT id_cidade, nome_cidade, id_estado FROM Cidades WHERE id_estado = ? ORDER BY nome_cidade',
    [id_estado]
  );
  return rows || [];
}

async function findCidadeById(id_cidade) {
  const [rows] = await pool.execute(
    'SELECT id_cidade, nome_cidade, id_estado FROM Cidades WHERE id_cidade = ? LIMIT 1',
    [id_cidade]
  );
  return rows && rows[0] ? rows[0] : null;
}

module.exports = {
  listCidadesByEstado,
  findCidadeById,
};