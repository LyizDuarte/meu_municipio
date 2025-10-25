const pool = require('../config/database');

async function addCompartilhamento(id_usuario, id_post) {
  const [result] = await pool.execute(
    `INSERT INTO Compartilhamentos (id_usuario, id_post)
     VALUES (?, ?)`,
    [id_usuario, id_post]
  );
  return result.insertId;
}

async function countCompartilhamentos(id_post) {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as total FROM Compartilhamentos WHERE id_post = ?',
    [id_post]
  );
  return rows[0]?.total || 0;
}

module.exports = {
  addCompartilhamento,
  countCompartilhamentos,
};