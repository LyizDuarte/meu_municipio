const pool = require('../config/database');

async function findUsuarioByEmail(email) {
  const [rows] = await pool.execute('SELECT * FROM Usuarios WHERE email = ?', [email]);
  return rows[0] || null;
}

async function findUsuarioById(id) {
  const [rows] = await pool.execute('SELECT * FROM Usuarios WHERE id_usuario = ?', [id]);
  return rows[0] || null;
}

async function createUsuario({ nome, email, descricao = null, senhaHash, media_url = null, id_cidade }) {
  const [result] = await pool.execute(
    `INSERT INTO Usuarios (nome, email, descricao, senha, media_url, id_cidade) VALUES (?, ?, ?, ?, ?, ?)`,
    [nome, email, descricao, senhaHash, media_url, id_cidade]
  );
  const insertedId = result.insertId;
  const [rows] = await pool.execute('SELECT * FROM Usuarios WHERE id_usuario = ?', [insertedId]);
  return rows[0] || null;
}

module.exports = {
  findUsuarioByEmail,
  findUsuarioById,
  createUsuario,
};