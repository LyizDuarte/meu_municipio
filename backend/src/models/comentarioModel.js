const pool = require('../config/database');

async function addComentario({ id_usuario, id_post, conteudo, id_comentario_pai = null }) {
  const [result] = await pool.execute(
    `INSERT INTO Comentarios (id_usuario, id_post, conteudo, id_comentario_pai)
     VALUES (?, ?, ?, ?)`,
    [id_usuario, id_post, conteudo, id_comentario_pai]
  );
  const insertedId = result.insertId;
  const [rows] = await pool.execute('SELECT * FROM Comentarios WHERE id_comentario = ?', [insertedId]);
  return rows[0] || null;
}

async function listComentariosByPost(id_post, limit = 10, offset = 0) {
  const [rows] = await pool.execute(
    `SELECT c.*, u.nome as autor_nome, u.media_url as autor_media_url
     FROM Comentarios c
     JOIN Usuarios u ON c.id_usuario = u.id_usuario
     WHERE c.id_post = ?
     ORDER BY c.data_comentario DESC
     LIMIT ? OFFSET ?`,
    [id_post, limit, offset]
  );
  return rows;
}

async function deleteComentario(id_comentario, id_usuario) {
  const [result] = await pool.execute(
    'DELETE FROM Comentarios WHERE id_comentario = ? AND id_usuario = ?',
    [id_comentario, id_usuario]
  );
  return result.affectedRows > 0;
}

async function countComentarios(id_post) {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as total FROM Comentarios WHERE id_post = ?',
    [id_post]
  );
  return rows[0]?.total || 0;
}

module.exports = {
  addComentario,
  listComentariosByPost,
  deleteComentario,
  countComentarios,
};