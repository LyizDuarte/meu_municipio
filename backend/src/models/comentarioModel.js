const pool = require("../config/database");

async function addComentario({
  id_usuario,
  id_post,
  conteudo,
  id_comentario_pai = null,
}) {
  const [result] = await pool.execute(
    `INSERT INTO Comentarios (id_usuario, id_post, conteudo, id_comentario_pai)
     VALUES (?, ?, ?, ?)`,
    [id_usuario, id_post, conteudo, id_comentario_pai]
  );
  const insertedId = result.insertId;
  const [rows] = await pool.execute(
    "SELECT * FROM Comentarios WHERE id_comentario = ?",
    [insertedId]
  );
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
    "DELETE FROM Comentarios WHERE id_comentario = ? AND id_usuario = ?",
    [id_comentario, id_usuario]
  );
  return result.affectedRows > 0;
}

async function countComentarios(id_post) {
  const [rows] = await pool.execute(
    "SELECT COUNT(*) as total FROM Comentarios WHERE id_post = ?",
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

// Lista posts nos quais o usuário comentou
async function findPostsComentadosByUsuario(
  id_usuario,
  limit = 10,
  offset = 0
) {
  const [rows] = await pool.execute(
    `SELECT p.*, u.nome as autor_nome, c.nome_categoria, ci.nome_cidade
     FROM Posts p
     JOIN Usuarios u ON p.id_usuario = u.id_usuario
     JOIN Categorias c ON p.id_categoria = c.id_categoria
     JOIN Cidades ci ON p.id_cidade = ci.id_cidade
     WHERE p.id_post IN (
       SELECT DISTINCT c.id_post FROM Comentarios c WHERE c.id_usuario = ?
     )
     ORDER BY p.data_criacao DESC
     LIMIT ? OFFSET ?`,
    [id_usuario, limit, offset]
  );
  return rows;
}

module.exports.findPostsComentadosByUsuario = findPostsComentadosByUsuario;

async function listComentariosByUsuario(id_usuario, limit = 10, offset = 0) {
  const [rows] = await pool.execute(
    `SELECT id_comentario, id_usuario, id_post, conteudo, data_comentario, id_comentario_pai
     FROM Comentarios
     WHERE id_usuario = ?
     ORDER BY data_comentario DESC
     LIMIT ? OFFSET ?`,
    [id_usuario, limit, offset]
  );
  return rows;
}

module.exports.listComentariosByUsuario = listComentariosByUsuario;
