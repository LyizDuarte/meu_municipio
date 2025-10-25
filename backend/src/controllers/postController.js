const {
  createPostWithMidias,
  getPostWithDetails,
  getUserPosts,
  getAllPostsWithFilters,
  updatePostData,
  deletePostById,
  addCommentToPost,
  listCommentsForPost,
  deleteCommentFromPost,
  supportPostByUser,
  unsupportPostByUser,
  sharePostByUser,
} = require('../services/postService');

async function createPost(req, res) {
  try {
    const { id_categoria, id_cidade, tipo_post, titulo, descricao, local_latitude, local_longitude } = req.body;
    const id_usuario = req.user.id_usuario;
    
    // Arquivos de mídia (se houver)
    const midias = req.files || [];
    
    const post = await createPostWithMidias({
      id_usuario,
      id_categoria: parseInt(id_categoria),
      id_cidade: parseInt(id_cidade),
      tipo_post,
      titulo,
      descricao,
      local_latitude: local_latitude ? parseFloat(local_latitude) : null,
      local_longitude: local_longitude ? parseFloat(local_longitude) : null,
      midias
    });

    return res.status(201).json({
      message: 'Post criado com sucesso',
      post
    });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Erro interno' });
  }
}

async function getPost(req, res) {
  try {
    const { id } = req.params;
    const post = await getPostWithDetails(parseInt(id));
    
    return res.status(200).json(post);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Erro interno' });
  }
}

async function getMyPosts(req, res) {
  try {
    const id_usuario = req.user.id_usuario;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const posts = await getUserPosts(id_usuario, page, limit);
    
    return res.status(200).json({
      posts,
      pagination: {
        page,
        limit,
        total: posts.length
      }
    });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Erro interno' });
  }
}

async function getAllPosts(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    // Filtros opcionais
    const filters = {
      tipo_post: req.query.tipo_post,
      status_post: req.query.status_post,
      id_categoria: req.query.id_categoria,
      id_cidade: req.query.id_cidade
    };
    
    const posts = await getAllPostsWithFilters(filters, page, limit);
    
    return res.status(200).json({
      posts,
      pagination: {
        page,
        limit,
        total: posts.length
      },
      filters: filters
    });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Erro interno' });
  }
}

async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const id_usuario = req.user.id_usuario;
    const updates = req.body;
    
    const post = await updatePostData(parseInt(id), id_usuario, updates);
    
    return res.status(200).json({
      message: 'Post atualizado com sucesso',
      post
    });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Erro interno' });
  }
}

async function deletePost(req, res) {
  try {
    const { id } = req.params;
    const id_usuario = req.user.id_usuario;
    
    await deletePostById(parseInt(id), id_usuario);
    
    return res.status(200).json({
      message: 'Post deletado com sucesso'
    });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Erro interno' });
  }
}

async function getPostsByUser(req, res) {
  try {
    const { id_usuario } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const posts = await getUserPosts(parseInt(id_usuario), page, limit);
    
    return res.status(200).json({
      posts,
      pagination: {
        page,
        limit,
        total: posts.length
      }
    });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Erro interno' });
  }
}

async function addComment(req, res) {
  try {
    const { id } = req.params; // id_post
    const id_usuario = req.user.id_usuario;
    const { conteudo, id_comentario_pai } = req.body;
    const comentario = await addCommentToPost({ id_post: parseInt(id), id_usuario, conteudo, id_comentario_pai });
    return res.status(201).json({ message: 'Comentário adicionado', comentario });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Erro interno' });
  }
}

async function getComments(req, res) {
  try {
    const { id } = req.params; // id_post
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { comentarios, pagination } = await listCommentsForPost(parseInt(id), page, limit);
    return res.status(200).json({ comentarios, pagination });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Erro interno' });
  }
}

async function deleteComment(req, res) {
  try {
    const { id, commentId } = req.params;
    const id_usuario = req.user.id_usuario;
    await deleteCommentFromPost(parseInt(commentId), id_usuario);
    return res.status(200).json({ message: 'Comentário removido' });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Erro interno' });
  }
}

async function supportPost(req, res) {
  try {
    const { id } = req.params; // id_post
    const id_usuario = req.user.id_usuario;
    const { tipo_apoio = 'curtir' } = req.body;
    const result = await supportPostByUser(parseInt(id), id_usuario, tipo_apoio);
    return res.status(200).json({ message: 'Apoio registrado', ...result });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Erro interno' });
  }
}

async function unsupportPost(req, res) {
  try {
    const { id } = req.params; // id_post
    const id_usuario = req.user.id_usuario;
    const result = await unsupportPostByUser(parseInt(id), id_usuario);
    return res.status(200).json({ message: 'Apoio removido', ...result });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Erro interno' });
  }
}

async function sharePost(req, res) {
  try {
    const { id } = req.params; // id_post
    const id_usuario = req.user.id_usuario;
    const result = await sharePostByUser(parseInt(id), id_usuario);
    return res.status(200).json({ message: 'Compartilhamento registrado', ...result });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ message: err.message || 'Erro interno' });
  }
}

module.exports = {
  createPost,
  getPost,
  getMyPosts,
  getAllPosts,
  updatePost,
  deletePost,
  getPostsByUser,
  addComment,
  getComments,
  deleteComment,
  supportPost,
  unsupportPost,
  sharePost,
};