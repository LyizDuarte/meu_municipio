import { api } from './client';

export async function listPosts(params = {}) {
  const { data } = await api.get('/posts', { params });
  return data; // { posts, pagination }
}

export async function createPost(payload) {
  // payload: { tipo, categoria, titulo, descricao, fotos, latitude, longitude }
  const { data } = await api.post('/posts', payload);
  return data; // { post }
}

export async function supportPost(id, tipo_apoio = 'curtir') {
  const { data } = await api.post(`/posts/${id}/support`, { tipo_apoio });
  return data; // { message, ...result }
}

export async function removeSupport(id) {
  const { data } = await api.delete(`/posts/${id}/support`);
  return data;
}

export async function sharePost(id) {
  const { data } = await api.post(`/posts/${id}/share`);
  return data; // { message, total_compartilhamentos, share_url }
}

export async function addComment(id, conteudo) {
  const { data } = await api.post(`/posts/${id}/comments`, { conteudo });
  return data; // { ...novoComentario }
}