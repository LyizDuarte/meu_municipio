/** Entidade Apoio */
const TIPOS_APOIO = ["curtir", "descurtir"];

class Apoio {
  constructor({ id_apoio, id_usuario, id_post, tipo_apoio }) {
    this.id_apoio = id_apoio ?? null;
    this.id_usuario = id_usuario;
    this.id_post = id_post;
    this.tipo_apoio = TIPOS_APOIO.includes(tipo_apoio) ? tipo_apoio : null;
  }

  static fromRow(row) {
    if (!row) return null;
    return new Apoio({
      id_apoio: row.id_apoio,
      id_usuario: row.id_usuario,
      id_post: row.id_post,
      tipo_apoio: row.tipo_apoio,
    });
  }
}

module.exports = { Apoio, TIPOS_APOIO };