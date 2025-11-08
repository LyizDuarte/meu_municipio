import axios from 'axios';
import Constants from 'expo-constants';

const baseURL = (Constants?.expoConfig?.extra?.apiBaseUrl) || 'http://localhost:3000/api';

export const api = axios.create({ baseURL });

export async function fetchEstados() {
  const { data } = await api.get('/locations/estados');
  return data.estados || [];
}

export async function fetchCidadesByEstado(id_estado) {
  const { data } = await api.get('/locations/cidades', { params: { id_estado } });
  return data.cidades || [];
}

// Ajuda a obter o nome da cidade dado seu id, iterando pelos estados.
export async function fetchCidadeNomeById(id_cidade) {
  if (!id_cidade) return null;
  try {
    const { data } = await api.get(`/locations/cidade/${id_cidade}`);
    return data?.cidade?.nome_cidade || null;
  } catch (e) {
    // Fallback silencioso: tenta via listagem caso endpoint não disponível
    try {
      const { data: estadosRes } = await api.get('/locations/estados');
      const estados = estadosRes?.estados || [];
      for (const estado of estados) {
        const { data: cidadesRes } = await api.get('/locations/cidades', { params: { id_estado: estado.id_estado } });
        const cidades = cidadesRes?.cidades || [];
        const encontrada = cidades.find((c) => c.id_cidade === id_cidade);
        if (encontrada) return encontrada.nome_cidade;
      }
    } catch (_) {}
    return null;
  }
}

// Define o header Authorization do axios
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}