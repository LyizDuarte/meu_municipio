const pool = require('../config/database');

async function listCidadesByEstado(id_estado) {
  const [rows] = await pool.execute(
    'SELECT id_cidade, nome_cidade, id_estado FROM Cidades WHERE id_estado = ? ORDER BY nome_cidade',
    [id_estado]
  );
  return rows || [];
}

module.exports = {
  listCidadesByEstado,
};