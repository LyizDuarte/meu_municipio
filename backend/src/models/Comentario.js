/** Entidade Comentario */
class Comentario {
  constructor({
    id_comentario,
    id_usuario,
    id_post,
    conteudo,
    data_comentario = new Date(),
    id_comentario_pai = null,
  }) {
    this.id_comentario = id_comentario ?? null;
    this.id_usuario = id_usuario;
    this.id_post = id_post;
    this.conteudo = conteudo;
    this.data_comentario = data_comentario instanceof Date ? data_comentario : new Date(data_comentario);
    this.id_comentario_pai = id_comentario_pai ?? null;
  }

  static fromRow(row) {
    if (!row) return null;
    return new Comentario({
      id_comentario: row.id_comentario,
      id_usuario: row.id_usuario,
      id_post: row.id_post,
      conteudo: row.conteudo,
      data_comentario: row.data_comentario,
      id_comentario_pai: row.id_comentario_pai ?? null,
    });
  }
}

module.exports = Comentario;