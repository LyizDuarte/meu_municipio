import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { api } from '../api/client';

export default function PostCard({ post, onSupport, onComment, onShare }) {
  const handleSupport = onSupport || (() => {});
  const handleComment = onComment || (() => {});
  const handleShare = onShare || (() => {});
  const tipoLabel = post.tipo || (post.tipo_post === 'sugestao' ? 'Sugestão' : (post.tipo_post === 'reclamacao' ? 'Reclamação' : ''));
  const categoriaLabel = post.categoria || post.nome_categoria || '';
  const localText = post.local || post.nome_cidade || '';
  const avatarUrl = post.avatar || post.media_url || 'https://randomuser.me/api/portraits/men/75.jpg';
  const mediaBase = api?.defaults?.baseURL ? api.defaults.baseURL.replace(/\/api$/, '') : '';
  const midias = Array.isArray(post.midias) ? post.midias : [];
  const mediaUrls = midias
    .map((m) => m.url || m.midia_url)
    .filter(Boolean)
    .map((u) => (u.startsWith('http') ? u : `${mediaBase}${u}`));
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.author}>{post.autor || post.autor_nome || 'Usuário'}</Text>
          <Text style={styles.time}>{post.tempo || ''}</Text>
        </View>
        <View style={styles.tag}><Text style={styles.tagText}>{tipoLabel}</Text></View>
      </View>

      {!!categoriaLabel && (
        <View style={styles.categoryPill}><Text style={styles.categoryText}>{categoriaLabel}</Text></View>
      )}
      <Text style={styles.title}>{post.titulo}</Text>
      <Text style={styles.description}>{post.descricao}</Text>

      <View style={styles.locationRow}>
        <MaterialIcons name="location-on" size={16} color="#0a4b9e" />
        <Text style={styles.locationText}>{localText}</Text>
      </View>

      {mediaUrls.length > 0 ? (
        <View style={{ marginTop: 8 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mediaUrls.map((u, idx) => (
              <Image key={idx} source={{ uri: u }} style={styles.photoInline} />
            ))}
          </ScrollView>
        </View>
      ) : (post.imagem ? (
        <Image source={{ uri: post.imagem }} style={styles.photo} />
      ) : null)}

      <View style={styles.footerStats}>
        <Text style={styles.stat}>{post.apoios} apoios</Text>
        <Text style={styles.stat}>{post.comentarios} comentários</Text>
        <Text style={styles.stat}>{post.compartilhamentos} compartilhamentos</Text>
      </View>

      <View style={styles.footerActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleSupport}><MaterialIcons name="thumb-up" size={18} color="#0a4b9e" /><Text style={styles.actionText}>Apoiar</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleComment}><MaterialIcons name="chat-bubble" size={18} color="#0a4b9e" /><Text style={styles.actionText}>Comentar</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleShare}><MaterialIcons name="share" size={18} color="#0a4b9e" /><Text style={styles.actionText}>Compartilhar</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e6eaf0' },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8 },
  author: { fontWeight: '600', fontSize: 14 },
  time: { color: '#6b7280', fontSize: 12 },
  tag: { backgroundColor: '#e9f1ff', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  tagText: { color: '#0a4b9e', fontSize: 12, fontWeight: '600' },
  categoryPill: { alignSelf: 'flex-start', backgroundColor: '#eaf8ef', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  categoryText: { color: '#1f7a47', fontSize: 12, fontWeight: '600' },
  title: { fontSize: 16, fontWeight: '700', marginTop: 8 },
  description: { color: '#374151', marginTop: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  locationText: { marginLeft: 4, color: '#0a4b9e' },
  photo: { height: 180, borderRadius: 8, marginTop: 8 },
  photoInline: { width: 220, height: 140, borderRadius: 8, marginRight: 8 },
  footerStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  stat: { color: '#6b7280' },
  footerActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#eef2f7' },
  actionBtn: { flexDirection: 'row', alignItems: 'center' },
  actionText: { marginLeft: 6, color: '#0a4b9e', fontWeight: '600' },
});