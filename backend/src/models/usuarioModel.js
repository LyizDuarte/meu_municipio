const pool = require("../config/database");

async function findUsuarioByEmail(email) {
  const [rows] = await pool.execute("SELECT * FROM Usuarios WHERE email = ?", [
    email,
  ]);
  return rows[0] || null;
}

async function findUsuarioById(id) {
  const [rows] = await pool.execute(
    "SELECT * FROM Usuarios WHERE id_usuario = ?",
    [id]
  );
  return rows[0] || null;
}

async function createUsuario({
  nome,
  email,
  descricao = null,
  senhaHash,
  media_url = null,
  id_cidade,
}) {
  const [result] = await pool.execute(
    `INSERT INTO Usuarios (nome, email, descricao, senha, media_url, id_cidade) VALUES (?, ?, ?, ?, ?, ?)`,
    [nome, email, descricao, senhaHash, media_url, id_cidade]
  );
  const insertedId = result.insertId;
  const [rows] = await pool.execute(
    "SELECT * FROM Usuarios WHERE id_usuario = ?",
    [insertedId]
  );
  return rows[0] || null;
}

async function updateUsuario(id_usuario, updates = {}) {
  const allowed = ["nome", "descricao", "media_url", "id_cidade"];
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(updates)) {
    if (allowed.includes(key) && value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }
  if (fields.length === 0) {
    return false;
  }
  values.push(id_usuario);
  const [result] = await pool.execute(
    `UPDATE Usuarios SET ${fields.join(", ")} WHERE id_usuario = ?`,
    values
  );
  return result.affectedRows > 0;
}

module.exports = {
  findUsuarioByEmail,
  findUsuarioById,
  createUsuario,
  updateUsuario,
};
