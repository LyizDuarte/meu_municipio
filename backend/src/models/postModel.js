const pool = require("../config/database");

async function createPost({
  id_usuario,
  id_categoria,
  id_cidade,
  tipo_post,
  titulo,
  descricao,
  local_latitude = null,
  local_longitude = null,
}) {
  const [result] = await pool.execute(
    `INSERT INTO Posts (id_usuario, id_categoria, id_cidade, tipo_post, titulo, descricao, local_latitude, local_longitude) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id_usuario,
      id_categoria,
      id_cidade,
      tipo_post,
      titulo,
      descricao,
      local_latitude,
      local_longitude,
    ]
  );

  const insertedId = result.insertId;
  const [rows] = await pool.execute("SELECT * FROM Posts WHERE id_post = ?", [
    insertedId,
  ]);
  return rows[0] || null;
}

async function addPostMidia(id_post, midia_url) {
  const [result] = await pool.execute(
    "INSERT INTO PostsMidias (id_post, midia_url) VALUES (?, ?)",
    [id_post, midia_url]
  );
  return result.insertId;
}

async function findPostById(id_post) {
  const [rows] = await pool.execute(
    `
    SELECT p.*, u.nome as autor_nome, u.media_url as autor_media_url, c.nome_categoria, ci.nome_cidade 
    FROM Posts p
    JOIN Usuarios u ON p.id_usuario = u.id_usuario
    JOIN Categorias c ON p.id_categoria = c.id_categoria
    JOIN Cidades ci ON p.id_cidade = ci.id_cidade
    WHERE p.id_post = ?
  `,
    [id_post]
  );

  if (!rows[0]) return null;

  // Buscar mídias do post
  const [midias] = await pool.execute(
    "SELECT id_midia, midia_url FROM PostsMidias WHERE id_post = ?",
    [id_post]
  );

  return {
    ...rows[0],
    midias: midias || [],
  };
}

async function findPostsByUsuario(id_usuario, limit = 10, offset = 0) {
  const [rows] = await pool.execute(
    `
    SELECT p.*, u.nome as autor_nome, u.media_url as autor_media_url, c.nome_categoria, ci.nome_cidade 
    FROM Posts p
    JOIN Usuarios u ON p.id_usuario = u.id_usuario
    JOIN Categorias c ON p.id_categoria = c.id_categoria
    JOIN Cidades ci ON p.id_cidade = ci.id_cidade
    WHERE p.id_usuario = ?
    ORDER BY p.data_criacao DESC
    LIMIT ? OFFSET ?
  `,
    [id_usuario, limit, offset]
  );

  return rows;
}

async function findAllPosts(limit = 20, offset = 0, filters = {}) {
  let query = `
    SELECT p.*, u.nome as autor_nome, u.media_url as autor_media_url, c.nome_categoria, ci.nome_cidade 
    FROM Posts p
    JOIN Usuarios u ON p.id_usuario = u.id_usuario
    JOIN Categorias c ON p.id_categoria = c.id_categoria
    JOIN Cidades ci ON p.id_cidade = ci.id_cidade
    WHERE 1=1
  `;

  const params = [];

  if (filters.tipo_post) {
    query += " AND p.tipo_post = ?";
    params.push(filters.tipo_post);
  }

  if (filters.id_categoria) {
    query += " AND p.id_categoria = ?";
    params.push(filters.id_categoria);
  }

  if (filters.id_cidade) {
    query += " AND p.id_cidade = ?";
    params.push(filters.id_cidade);
  }

  if (filters.status_post) {
    query += " AND p.status_post = ?";
    params.push(filters.status_post);
  }

  query += " ORDER BY p.data_criacao DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const [rows] = await pool.execute(query, params);
  return rows;
}

async function updatePost(id_post, updates) {
  const allowedFields = [
    "titulo",
    "descricao",
    "status_post",
    "local_latitude",
    "local_longitude",
  ];
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key) && value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    throw new Error("Nenhum campo válido para atualizar");
  }

  values.push(id_post);

  const [result] = await pool.execute(
    `UPDATE Posts SET ${fields.join(", ")} WHERE id_post = ?`,
    values
  );

  return result.affectedRows > 0;
}

async function deletePost(id_post) {
  // As mídias serão deletadas automaticamente por CASCADE
  const [result] = await pool.execute("DELETE FROM Posts WHERE id_post = ?", [
    id_post,
  ]);
  return result.affectedRows > 0;
}

module.exports = {
  createPost,
  addPostMidia,
  findPostById,
  findPostsByUsuario,
  findAllPosts,
  updatePost,
  deletePost,
};
