/** Entidade Categoria */
class Categoria {
  constructor({ id_categoria, nome_categoria, descricao = null }) {
    this.id_categoria = id_categoria ?? null;
    this.nome_categoria = nome_categoria;
    this.descricao = descricao;
  }

  static fromRow(row) {
    if (!row) return null;
    return new Categoria({
      id_categoria: row.id_categoria,
      nome_categoria: row.nome_categoria,
      descricao: row.descricao ?? null,
    });
  }
}

module.exports = Categoria;