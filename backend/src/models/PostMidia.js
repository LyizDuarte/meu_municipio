/** Entidade PostMidia (tabela PostsMidias) */
class PostMidia {
  constructor({ id_midia, id_post, midia_url }) {
    this.id_midia = id_midia ?? null;
    this.id_post = id_post;
    this.midia_url = midia_url;
  }

  static fromRow(row) {
    if (!row) return null;
    return new PostMidia({
      id_midia: row.id_midia,
      id_post: row.id_post,
      midia_url: row.midia_url,
    });
  }
}

module.exports = PostMidia;