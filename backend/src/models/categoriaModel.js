const pool = require('../config/database');

async function listCategorias() {
  const [rows] = await pool.execute(
    'SELECT id_categoria, nome_categoria FROM Categorias ORDER BY nome_categoria'
  );
  return rows || [];
}

module.exports = {
  listCategorias,
};