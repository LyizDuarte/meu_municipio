/** Entidade Cidade */
class Cidade {
  constructor({ id_cidade, nome_cidade, id_estado }) {
    this.id_cidade = id_cidade ?? null;
    this.nome_cidade = nome_cidade;
    this.id_estado = id_estado;
  }

  static fromRow(row) {
    if (!row) return null;
    return new Cidade({
      id_cidade: row.id_cidade,
      nome_cidade: row.nome_cidade,
      id_estado: row.id_estado,
    });
  }
}

module.exports = Cidade;