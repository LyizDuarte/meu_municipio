import { api } from './client';

export async function login({ email, senha }) {
  const { data } = await api.post('/auth/login', { email, senha });
  return data; // { token, user }
}

export async function register({ nome, email, senha, id_cidade }) {
  const { data } = await api.post('/auth/register', { nome, email, senha, id_cidade });
  return data; // { token, user }
}

export async function me() {
  const { data } = await api.get('/auth/me');
  return data; // user
}