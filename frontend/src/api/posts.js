import { api } from "./client";
import { Platform } from "react-native";

export async function listPosts(params = {}) {
  const { data } = await api.get("/posts", { params });
  return data; // { posts, pagination }
}

export async function getPost(id) {
  const { data } = await api.get(`/posts/${id}`);
  return data; // { post, metrics }
}

export async function createPost(payload) {
  // payload: { id_categoria, id_cidade, tipo_post, titulo, descricao, local_latitude?, local_longitude?, fotos? }
  const hasFotos = Array.isArray(payload?.fotos) && payload.fotos.length > 0;

  if (hasFotos) {
    const form = new FormData();
    // Campos de texto
    const fields = [
      "id_categoria",
      "id_cidade",
      "tipo_post",
      "titulo",
      "descricao",
      "local_latitude",
      "local_longitude",
    ];
    fields.forEach((key) => {
      const val = payload[key];
      if (val !== undefined && val !== null) form.append(key, String(val));
    });

    // Arquivos (campo 'midias' conforme backend uploadMiddleware)
    // Anexa arquivos em 'midias' (compatível com RN e Web)
    for (let idx = 0; idx < payload.fotos.length; idx++) {
      const f = payload.fotos[idx];
      const uri = f?.uri || f;
      if (!uri) continue;
      let name =
        (typeof f?.name === "string" && f.name) ||
        uri.split("/").pop() ||
        `midia-${idx + 1}.jpg`;
      // Garante extensão no nome para passar no fileFilter do backend
      if (!/\.(jpe?g|png|gif|webp|mp4|mov|avi|webm)$/i.test(name)) {
        name = `${name}.jpg`;
      }
      let type = f?.type || "application/octet-stream";
      const lower = name.toLowerCase();
      if (lower.endsWith(".jpg") || lower.endsWith(".jpeg"))
        type = "image/jpeg";
      else if (lower.endsWith(".png")) type = "image/png";
      else if (lower.endsWith(".gif")) type = "image/gif";
      else if (lower.endsWith(".webp")) type = "image/webp";

      if (Platform.OS === "web") {
        // No web, converte URI em Blob/File
        try {
          const res = await fetch(uri);
          const blob = await res.blob();
          const file = new File([blob], name, { type: blob.type || type });
          form.append("midias", file);
        } catch (_) {
          // Se falhar em obter blob, ignora este arquivo
        }
      } else {
        form.append("midias", { uri, name, type });
      }
    }

    // Não defina manualmente o Content-Type: o navegador/device adiciona o boundary corretamente
    try {
      const { data } = await api.post("/posts", form);
      return data; // { post }
    } catch (err) {
      // Fallback para RN: usar fetch, que lida melhor com multipart em alguns ambientes
      const baseURL = api?.defaults?.baseURL || "";
      const auth = api?.defaults?.headers?.common?.Authorization;
      const resp = await fetch(`${baseURL}/posts`, {
        method: "POST",
        headers: auth ? { Authorization: auth } : undefined,
        body: form,
      });
      if (!resp.ok) {
        let body;
        try {
          body = await resp.json();
        } catch (_) {}
        const msg = body?.message || `Falha no upload (${resp.status})`;
        throw new Error(msg);
      }
      const json = await resp.json();
      return json;
    }
  }

  const { data } = await api.post("/posts", payload);
  return data; // { post }
}

export async function supportPost(id, tipo_apoio = "curtir") {
  const { data } = await api.post(`/posts/${id}/support`, { tipo_apoio });
  return data; // { message, ...result }
}

export async function removeSupport(id) {
  const { data } = await api.delete(`/posts/${id}/support`);
  return data;
}

export async function sharePost(id) {
  const { data } = await api.post(`/posts/${id}/share`);
  return data; // { total_compartilhamentos, share_url }
}

export async function unsharePost(id) {
  const { data } = await api.delete(`/posts/${id}/share`);
  return data; // { total_compartilhamentos }
}

export async function addComment(id, conteudo) {
  const { data } = await api.post(`/posts/${id}/comments`, { conteudo });
  return data; // { ...novoComentario }
}

export async function getComments(id, { page = 1, limit = 10 } = {}) {
  const { data } = await api.get(`/posts/${id}/comments`, {
    params: { page, limit },
  });
  return data; // { comentarios, pagination }
}

export async function listPostsByUser(id_usuario, params = {}) {
  const { data } = await api.get(`/posts/user/${id_usuario}`, { params });
  return data; // { posts, pagination }
}

export async function listLikedPostsByUser(id_usuario, params = {}) {
  const { data } = await api.get(`/posts/user/${id_usuario}/likes`, { params });
  return data; // { posts, pagination }
}

export async function listCommentsByUser(id_usuario, params = {}) {
  const { data } = await api.get(`/posts/user/${id_usuario}/comments`, {
    params,
  });
  return data; // { comentarios, pagination }
}

// Compatibilidade antiga (nome anterior):
export const listCommentedPostsByUser = listCommentsByUser;
