const pool = require('../config/database');

async function addApoio(id_usuario, id_post, tipo_apoio = 'curtir') {
  const [result] = await pool.execute(
    `INSERT INTO Apoios (id_usuario, id_post, tipo_apoio)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE tipo_apoio = VALUES(tipo_apoio)`,
    [id_usuario, id_post, tipo_apoio]
  );
  return result.insertId || true; // true quando é update
}

async function removeApoio(id_usuario, id_post) {
  const [result] = await pool.execute(
    'DELETE FROM Apoios WHERE id_usuario = ? AND id_post = ?',
    [id_usuario, id_post]
  );
  return result.affectedRows > 0;
}

async function findApoioByUserPost(id_usuario, id_post) {
  const [rows] = await pool.execute(
    'SELECT * FROM Apoios WHERE id_usuario = ? AND id_post = ?',
    [id_usuario, id_post]
  );
  return rows[0] || null;
}

async function countApoios(id_post) {
  const [rows] = await pool.execute(
    `SELECT tipo_apoio, COUNT(*) as total FROM Apoios WHERE id_post = ? GROUP BY tipo_apoio`,
    [id_post]
  );
  const counts = { curtir: 0, descurtir: 0 };
  for (const row of rows) {
    counts[row.tipo_apoio] = row.total;
  }
  return counts;
}

module.exports = {
  addApoio,
  removeApoio,
  findApoioByUserPost,
  countApoios,
};

// Lista posts curtidos por um usuário
async function findPostsCurtidosByUsuario(id_usuario, limit = 10, offset = 0) {
  const [rows] = await pool.execute(
    `SELECT p.*, u.nome as autor_nome, u.media_url as autor_media_url, c.nome_categoria, ci.nome_cidade
     FROM Apoios a
     JOIN Posts p ON a.id_post = p.id_post
     JOIN Usuarios u ON p.id_usuario = u.id_usuario
     JOIN Categorias c ON p.id_categoria = c.id_categoria
     JOIN Cidades ci ON p.id_cidade = ci.id_cidade
     WHERE a.id_usuario = ? AND a.tipo_apoio = 'curtir'
     ORDER BY p.data_criacao DESC
     LIMIT ? OFFSET ?`,
    [id_usuario, limit, offset]
  );
  return rows;
}

module.exports.findPostsCurtidosByUsuario = findPostsCurtidosByUsuario;
