import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import PostCard from '../components/PostCard';
import { fetchCidadeNomeById } from '../api/client';

const MOCK_POSTS = [
  {
    id: 1,
    autor: 'Carlos Silva',
    tempo: 'há 2 horas',
    tipo: 'Sugestão',
    categoria: 'Iluminação Pública',
    titulo: 'Melhorar iluminação na Rua das Flores',
    descricao: 'A rua está muito escura à noite, causando insegurança para pedestres. Seria importante instalar mais postes de luz... Ver mais',
    local: 'Rua das Flores, Centro',
    imagem: 'https://images.unsplash.com/photo-1478033394151-c931b92aef70?q=80&w=1080&auto=format&fit=crop',
    apoios: 24,
    comentarios: 8,
    compartilhamentos: 3,
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
  },
  {
    id: 2,
    autor: 'Ana Costa',
    tempo: 'há 5 horas',
    tipo: 'Reclamação',
    categoria: 'Infraestrutura',
    titulo: 'Buraco gigante na Av. Paulista',
    descricao: 'Há semanas existe um buraco enorme que está causando acidentes. Já vi vários carros com pneus furados... Ver mais',
    local: 'Av. Paulista, 1500',
    imagem: 'https://images.unsplash.com/photo-1532974297617-c0dc1d77bc0a?q=80&w=1080&auto=format&fit=crop',
    apoios: 67,
    comentarios: 15,
    compartilhamentos: 12,
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
];

export default function FeedScreen({ user }) {
  const [cityName, setCityName] = React.useState('Sua Cidade');

  React.useEffect(() => {
    let mounted = true;
    async function loadCityName() {
      if (user?.id_cidade) {
        const nome = await fetchCidadeNomeById(user.id_cidade);
        if (mounted) setCityName(nome || 'Sua Cidade');
      }
    }
    loadCityName();
    return () => { mounted = false; };
  }, [user]);
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn}><MaterialIcons name="filter-list" size={22} color="#0a4b9e" /></TouchableOpacity>
        <Text style={styles.topTitle}>{`Feed ${cityName}`}</Text>
        <TouchableOpacity style={styles.iconBtn}><MaterialIcons name="add" size={22} color="#0a4b9e" /></TouchableOpacity>
      </View>
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={MOCK_POSTS}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <PostCard post={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f6fb' },
  topBar: { height: 56, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e6eaf0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
  topTitle: { fontSize: 16, fontWeight: '700', color: '#0a4b9e' },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, borderWidth: 1, borderColor: '#e6eaf0', backgroundColor: '#fff' },
});