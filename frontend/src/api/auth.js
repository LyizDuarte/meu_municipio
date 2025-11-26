import { api } from "./client";

export async function login({ email, senha }) {
  const { data } = await api.post("/auth/login", { email, senha });
  return data; // { token, user }
}

export async function register({ nome, email, senha, id_cidade }) {
  const { data } = await api.post("/auth/register", {
    nome,
    email,
    senha,
    id_cidade,
  });
  return data; // { token, user }
}

export async function me() {
  const { data } = await api.get("/auth/me");
  return data; // user
}

export async function updateMe(payload) {
  const { data } = await api.patch("/auth/me", payload);
  return data; // updated user
}

export async function uploadAvatar(file) {
  const form = new FormData();
  const uri = file?.uri || file;
  if (!uri) throw new Error("Arquivo inválido");
  let name =
    (typeof file?.name === "string" && file.name) ||
    uri.split("/").pop() ||
    "avatar.jpg";
  if (!/\.(jpe?g|png|gif|webp)$/i.test(name)) name = `${name}.jpg`;
  let type = file?.type || "application/octet-stream";
  const lower = name.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) type = "image/jpeg";
  else if (lower.endsWith(".png")) type = "image/png";
  else if (lower.endsWith(".gif")) type = "image/gif";
  else if (lower.endsWith(".webp")) type = "image/webp";

  if (typeof window !== "undefined" && window.Blob && uri.startsWith("http")) {
    const res = await fetch(uri);
    const blob = await res.blob();
    const f = new File([blob], name, { type: blob.type || type });
    form.append("avatar", f);
  } else {
    form.append("avatar", { uri, name, type });
  }

  try {
    const { data } = await api.patch("/auth/me/avatar", form);
    return data; // updated user com media_url
  } catch (err) {
    const baseURL = api?.defaults?.baseURL || "";
    const auth = api?.defaults?.headers?.common?.Authorization;
    const resp = await fetch(`${baseURL}/auth/me/avatar`, {
      method: "PATCH",
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
