/** Entidade Usuario */
class Usuario {
  constructor({
    id_usuario,
    nome,
    email,
    descricao = null,
    senha,
    media_url = null,
    id_cidade,
    data_cadastro = new Date(),
    numero_visualizacoes = 0,
  }) {
    this.id_usuario = id_usuario ?? null;
    this.nome = nome;
    this.email = email;
    this.descricao = descricao;
    this.senha = senha;
    this.media_url = media_url;
    this.id_cidade = id_cidade;
    this.data_cadastro = data_cadastro instanceof Date ? data_cadastro : new Date(data_cadastro);
    this.numero_visualizacoes = numero_visualizacoes;
  }

  static fromRow(row) {
    if (!row) return null;
    return new Usuario({
      id_usuario: row.id_usuario,
      nome: row.nome,
      email: row.email,
      descricao: row.descricao ?? null,
      senha: row.senha,
      media_url: row.media_url ?? null,
      id_cidade: row.id_cidade,
      data_cadastro: row.data_cadastro,
      numero_visualizacoes: row.numero_visualizacoes,
    });
  }
}

module.exports = Usuario;