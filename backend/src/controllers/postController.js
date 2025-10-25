const {
  createPostWithMidias,
  getPostWithDetails,
  getUserPosts,
  getAllPostsWithFilters,
  updatePostData,
  deletePostById
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

module.exports = {
  createPost,
  getPost,
  getMyPosts,
  getAllPosts,
  updatePost,
  deletePost,
  getPostsByUser
};