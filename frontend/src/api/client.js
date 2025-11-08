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