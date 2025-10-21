/** Entidade Estado */
class Estado {
  constructor({ id_estado, nome_estado }) {
    this.id_estado = id_estado ?? null;
    this.nome_estado = nome_estado;
  }

  static fromRow(row) {
    if (!row) return null;
    return new Estado({
      id_estado: row.id_estado,
      nome_estado: row.nome_estado,
    });
  }
}

module.exports = Estado;