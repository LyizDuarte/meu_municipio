const pool = require("../config/database");

async function addCompartilhamento(id_usuario, id_post) {
  const [result] = await pool.execute(
    `INSERT INTO Compartilhamentos (id_usuario, id_post)
     VALUES (?, ?)`,
    [id_usuario, id_post]
  );
  return result.insertId;
}

async function removeCompartilhamento(id_usuario, id_post) {
  const [result] = await pool.execute(
    `DELETE FROM Compartilhamentos WHERE id_usuario = ? AND id_post = ?`,
    [id_usuario, id_post]
  );
  return result.affectedRows > 0;
}

async function findCompartilhamentoByUserPost(id_usuario, id_post) {
  const [rows] = await pool.execute(
    `SELECT id_usuario, id_post FROM Compartilhamentos WHERE id_usuario = ? AND id_post = ? LIMIT 1`,
    [id_usuario, id_post]
  );
  return rows[0] || null;
}

async function countCompartilhamentos(id_post) {
  const [rows] = await pool.execute(
    "SELECT COUNT(*) as total FROM Compartilhamentos WHERE id_post = ?",
    [id_post]
  );
  return rows[0]?.total || 0;
}

module.exports = {
  addCompartilhamento,
  countCompartilhamentos,
  removeCompartilhamento,
  findCompartilhamentoByUserPost,
};
