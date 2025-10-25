const { 
  createPost, 
  addPostMidia, 
  findPostById, 
  findPostsByUsuario, 
  findAllPosts, 
  updatePost, 
  deletePost 
} = require('../models/postModel');
const { getMediaUrl } = require('../middlewares/upload');

async function createPostWithMidias({ id_usuario, id_categoria, id_cidade, tipo_post, titulo, descricao, local_latitude, local_longitude, midias = [] }) {
  // Validações básicas
  if (!id_usuario || !id_categoria || !id_cidade || !tipo_post || !titulo || !descricao) {
    const err = new Error('Campos obrigatórios: id_usuario, id_categoria, id_cidade, tipo_post, titulo, descricao');
    err.status = 400;
    throw err;
  }

  // Validar tipo_post
  const tiposValidos = ['sugestao', 'reclamacao'];
  if (!tiposValidos.includes(tipo_post)) {
    const err = new Error('tipo_post deve ser "sugestao" ou "reclamacao"');
    err.status = 400;
    throw err;
  }

  // Validar coordenadas se fornecidas
  if (local_latitude !== null && local_latitude !== undefined) {
    const lat = parseFloat(local_latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      const err = new Error('local_latitude deve ser um número entre -90 e 90');
      err.status = 400;
      throw err;
    }
    local_latitude = lat;
  }

  if (local_longitude !== null && local_longitude !== undefined) {
    const lng = parseFloat(local_longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      const err = new Error('local_longitude deve ser um número entre -180 e 180');
      err.status = 400;
      throw err;
    }
    local_longitude = lng;
  }

  try {
    // Criar o post
    const post = await createPost({
      id_usuario,
      id_categoria,
      id_cidade,
      tipo_post,
      titulo,
      descricao,
      local_latitude,
      local_longitude
    });

    // Adicionar mídias se houver
    const midiaUrls = [];
    if (midias && midias.length > 0) {
      for (const midia of midias) {
        const midiaUrl = getMediaUrl(midia.filename);
        await addPostMidia(post.id_post, midiaUrl);
        midiaUrls.push({
          filename: midia.filename,
          originalname: midia.originalname,
          url: midiaUrl
        });
      }
    }

    return {
      ...post,
      midias: midiaUrls
    };
  } catch (error) {
    // Se houver erro, pode ser necessário limpar arquivos já salvos
    error.status = error.status || 500;
    throw error;
  }
}

async function getPostWithDetails(id_post) {
  const post = await findPostById(id_post);
  if (!post) {
    const err = new Error('Post não encontrado');
    err.status = 404;
    throw err;
  }
  return post;
}

async function getUserPosts(id_usuario, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  const posts = await findPostsByUsuario(id_usuario, limit, offset);
  return posts;
}

async function getAllPostsWithFilters(filters = {}, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  
  // Validar filtros
  const validFilters = {};
  
  if (filters.tipo_post) {
    const tiposValidos = ['sugestao', 'reclamacao'];
    if (tiposValidos.includes(filters.tipo_post)) {
      validFilters.tipo_post = filters.tipo_post;
    }
  }
  
  if (filters.status_post) {
    const statusValidos = ['aberto', 'em_analise', 'resolvido', 'arquivado'];
    if (statusValidos.includes(filters.status_post)) {
      validFilters.status_post = filters.status_post;
    }
  }
  
  if (filters.id_categoria && !isNaN(parseInt(filters.id_categoria))) {
    validFilters.id_categoria = parseInt(filters.id_categoria);
  }
  
  if (filters.id_cidade && !isNaN(parseInt(filters.id_cidade))) {
    validFilters.id_cidade = parseInt(filters.id_cidade);
  }

  const posts = await findAllPosts(limit, offset, validFilters);
  return posts;
}

async function updatePostData(id_post, id_usuario, updates) {
  // Verificar se o post existe e pertence ao usuário
  const post = await findPostById(id_post);
  if (!post) {
    const err = new Error('Post não encontrado');
    err.status = 404;
    throw err;
  }

  if (post.id_usuario !== id_usuario) {
    const err = new Error('Você não tem permissão para editar este post');
    err.status = 403;
    throw err;
  }

  // Validar campos de atualização
  const validUpdates = {};
  
  if (updates.titulo !== undefined) {
    if (!updates.titulo || updates.titulo.trim().length === 0) {
      const err = new Error('Título não pode estar vazio');
      err.status = 400;
      throw err;
    }
    validUpdates.titulo = updates.titulo.trim();
  }
  
  if (updates.descricao !== undefined) {
    if (!updates.descricao || updates.descricao.trim().length === 0) {
      const err = new Error('Descrição não pode estar vazia');
      err.status = 400;
      throw err;
    }
    validUpdates.descricao = updates.descricao.trim();
  }
  
  if (updates.status_post !== undefined) {
    const statusValidos = ['aberto', 'em_analise', 'resolvido', 'arquivado'];
    if (!statusValidos.includes(updates.status_post)) {
      const err = new Error('Status inválido');
      err.status = 400;
      throw err;
    }
    validUpdates.status_post = updates.status_post;
  }

  if (updates.local_latitude !== undefined) {
    if (updates.local_latitude !== null) {
      const lat = parseFloat(updates.local_latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        const err = new Error('local_latitude deve ser um número entre -90 e 90');
        err.status = 400;
        throw err;
      }
      validUpdates.local_latitude = lat;
    } else {
      validUpdates.local_latitude = null;
    }
  }

  if (updates.local_longitude !== undefined) {
    if (updates.local_longitude !== null) {
      const lng = parseFloat(updates.local_longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        const err = new Error('local_longitude deve ser um número entre -180 e 180');
        err.status = 400;
        throw err;
      }
      validUpdates.local_longitude = lng;
    } else {
      validUpdates.local_longitude = null;
    }
  }

  const success = await updatePost(id_post, validUpdates);
  if (!success) {
    const err = new Error('Erro ao atualizar post');
    err.status = 500;
    throw err;
  }

  return await findPostById(id_post);
}

async function deletePostById(id_post, id_usuario) {
  // Verificar se o post existe e pertence ao usuário
  const post = await findPostById(id_post);
  if (!post) {
    const err = new Error('Post não encontrado');
    err.status = 404;
    throw err;
  }

  if (post.id_usuario !== id_usuario) {
    const err = new Error('Você não tem permissão para deletar este post');
    err.status = 403;
    throw err;
  }

  const success = await deletePost(id_post);
  if (!success) {
    const err = new Error('Erro ao deletar post');
    err.status = 500;
    throw err;
  }

  return true;
}

module.exports = {
  createPostWithMidias,
  getPostWithDetails,
  getUserPosts,
  getAllPostsWithFilters,
  updatePostData,
  deletePostById
};