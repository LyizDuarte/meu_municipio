import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Define baseURL com suporte ao Android Emulator.
// Se extra.apiBaseUrl estiver setado com localhost, mapeia para 10.0.2.2 no Android.
function resolveBaseURL() {
  const extraBase = Constants?.expoConfig?.extra?.apiBaseUrl;

  // Tenta detectar o host do dev server (LAN) para dispositivos físicos
  const hostUri = Constants?.expoConfig?.hostUri; // ex: "172.17.21.208:8083"
  const hostIp = hostUri ? hostUri.split(':')[0] : null;

  if (Platform.OS === 'android') {
    // Se não houver base explícita, tenta LAN; senão, usa 10.0.2.2 para Emulador
    if (!extraBase) {
      if (hostIp) return `http://${hostIp}:3000/api`;
      return 'http://10.0.2.2:3000/api';
    }
    // Ajusta localhost para 10.0.2.2 quando em Emulador
    return extraBase
      .replace('localhost', '10.0.2.2')
      .replace('127.0.0.1', '10.0.2.2');
  }

  // Web/iOS: usa o extra ou localhost
  return extraBase || (hostIp ? `http://${hostIp}:3000/api` : 'http://localhost:3000/api');
}

const baseURL = resolveBaseURL();

export const api = axios.create({ baseURL });

export async function fetchEstados() {
  const { data } = await api.get('/locations/estados');
  return data.estados || [];
}

export async function fetchCidadesByEstado(id_estado) {
  const { data } = await api.get('/locations/cidades', { params: { id_estado } });
  return data.cidades || [];
}

export async function fetchCategorias() {
  const { data } = await api.get('/categories');
  return data.categorias || [];
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