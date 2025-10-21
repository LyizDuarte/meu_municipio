/** Entidade Compartilhamento */
class Compartilhamento {
  constructor({ id_compartilhamento, id_usuario, id_post, data_compartilhamento = new Date() }) {
    this.id_compartilhamento = id_compartilhamento ?? null;
    this.id_usuario = id_usuario;
    this.id_post = id_post;
    this.data_compartilhamento = data_compartilhamento instanceof Date ? data_compartilhamento : new Date(data_compartilhamento);
  }

  static fromRow(row) {
    if (!row) return null;
    return new Compartilhamento({
      id_compartilhamento: row.id_compartilhamento,
      id_usuario: row.id_usuario,
      id_post: row.id_post,
      data_compartilhamento: row.data_compartilhamento,
    });
  }
}

module.exports = Compartilhamento;