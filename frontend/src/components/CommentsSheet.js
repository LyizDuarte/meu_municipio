import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { addComment, getComments } from '../api/posts';

export default function CommentsSheet({ post, onClose, onSubmitted }) {
  const [comments, setComments] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [draft, setDraft] = React.useState('');

  const id = post?.id || post?.id_post;

  React.useEffect(() => {
    let mounted = true;
    async function loadInitial() {
      if (!id) return;
      try {
        setLoading(true);
        const { comentarios, pagination } = await getComments(id, { page: 1, limit: 10 });
        if (!mounted) return;
        setComments(Array.isArray(comentarios) ? comentarios : []);
        setTotal(pagination?.total || 0);
        setPage(1);
      } catch (_) {
        if (mounted) {
          setComments([]);
          setTotal(0);
          setPage(1);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (post) {
      setDraft('');
      loadInitial();
    } else {
      setComments([]);
      setDraft('');
      setTotal(0);
      setPage(1);
    }
    return () => { mounted = false; };
  }, [id]);

  if (!post) return null;

  async function loadMore() {
    if (!id) return;
    if (comments.length >= total) return;
    const next = page + 1;
    try {
      setLoading(true);
      const { comentarios, pagination } = await getComments(id, { page: next, limit: 10 });
      const more = Array.isArray(comentarios) ? comentarios : [];
      setComments((prev) => [...prev, ...more]);
      setPage(next);
      setTotal(pagination?.total || total);
    } catch (_) {} finally {
      setLoading(false);
    }
  }

  async function submit() {
    if (!id || !draft.trim()) return;
    try {
      await addComment(id, draft.trim());
      setDraft('');
      // Refresca contagem externa
      if (typeof onSubmitted === 'function') onSubmitted();
      // Opcional: poderia inserir item na lista local, mas requer dados do backend
    } catch (_) {}
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comentários</Text>
      <View style={{ maxHeight: 220 }}>
        {loading && comments.length === 0 ? (
          <Text style={{ color: '#6b7280' }}>Carregando comentários...</Text>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(c) => String(c.id_comentario || Math.random())}
            renderItem={({ item: c }) => (
              <View style={{ paddingVertical: 6 }}>
                <Text style={{ fontWeight: '600', color: '#0a4b9e' }}>{c.autor_nome || 'Usuário'}</Text>
                <Text style={{ color: '#374151' }}>{c.conteudo}</Text>
              </View>
            )}
            ListFooterComponent={(
              comments.length < total ? (
                <TouchableOpacity style={[styles.iconBtn, { alignSelf: 'center', marginTop: 8 }]} onPress={loadMore} disabled={loading}>
                  <Text style={{ color: '#0a4b9e', fontWeight: '600' }}>{loading ? 'Carregando...' : 'Carregar mais'}</Text>
                </TouchableOpacity>
              ) : null
            )}
          />
        )}
      </View>
      <Text style={[styles.title, { marginTop: 8 }]}>Novo comentário</Text>
      <TextInput
        style={styles.input}
        placeholder="Escreva seu comentário"
        value={draft}
        onChangeText={setDraft}
        maxLength={300}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
        <TouchableOpacity style={[styles.iconBtn, { marginRight: 8 }]} onPress={onClose}>
          <MaterialIcons name="close" size={18} color="#0a4b9e" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={submit}>
          <MaterialIcons name="send" size={18} color="#0a4b9e" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', left: 16, right: 16, bottom: 16, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e6eaf0', padding: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8 },
  title: { fontWeight: '700', color: '#0a4b9e', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#e6eaf0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, borderWidth: 1, borderColor: '#e6eaf0', backgroundColor: '#fff' },
});

