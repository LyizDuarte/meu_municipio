/** Entidade Post */
const TIPOS_POST = ["sugestao", "reclamacao"];
const STATUS_POST = ["aberto", "em_analise", "resolvido", "arquivado"];

class Post {
  constructor({
    id_post,
    id_usuario,
    id_categoria,
    id_cidade,
    tipo_post,
    titulo,
    descricao,
    local_latitude = null,
    local_longitude = null,
    data_criacao = new Date(),
    data_atualizacao = new Date(),
    status_post = "aberto",
  }) {
    this.id_post = id_post ?? null;
    this.id_usuario = id_usuario;
    this.id_categoria = id_categoria;
    this.id_cidade = id_cidade;
    this.tipo_post = TIPOS_POST.includes(tipo_post) ? tipo_post : null;
    this.titulo = titulo;
    this.descricao = descricao;
    this.local_latitude = local_latitude == null ? null : parseFloat(local_latitude);
    this.local_longitude = local_longitude == null ? null : parseFloat(local_longitude);
    this.data_criacao = data_criacao instanceof Date ? data_criacao : new Date(data_criacao);
    this.data_atualizacao = data_atualizacao instanceof Date ? data_atualizacao : new Date(data_atualizacao);
    this.status_post = STATUS_POST.includes(status_post) ? status_post : "aberto";
  }

  static fromRow(row) {
    if (!row) return null;
    return new Post({
      id_post: row.id_post,
      id_usuario: row.id_usuario,
      id_categoria: row.id_categoria,
      id_cidade: row.id_cidade,
      tipo_post: row.tipo_post,
      titulo: row.titulo,
      descricao: row.descricao,
      local_latitude: row.local_latitude,
      local_longitude: row.local_longitude,
      data_criacao: row.data_criacao,
      data_atualizacao: row.data_atualizacao,
      status_post: row.status_post,
    });
  }
}

module.exports = { Post, TIPOS_POST, STATUS_POST };