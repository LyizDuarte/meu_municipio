import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import PostCard from "../components/PostCard";
import { fetchCidadeNomeById, fetchCategorias } from "../api/client";
import {
  listPosts,
  getPost,
  supportPost,
  removeSupport,
  sharePost,
} from "../api/posts";
import { TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Share } from "react-native";
import CommentsSheet from "../components/CommentsSheet";

const MOCK_POSTS = [
  {
    id: 1,
    autor: "Carlos Silva",
    tempo: "há 2 horas",
    tipo: "Sugestão",
    categoria: "Iluminação Pública",
    titulo: "Melhorar iluminação na Rua das Flores",
    descricao:
      "A rua está muito escura à noite, causando insegurança para pedestres. Seria importante instalar mais postes de luz... Ver mais",
    local: "Rua das Flores, Centro",
    imagem:
      "https://images.unsplash.com/photo-1478033394151-c931b92aef70?q=80&w=1080&auto=format&fit=crop",
    apoios: 24,
    comentarios: 8,
    compartilhamentos: 3,
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
  },
  {
    id: 2,
    autor: "Ana Costa",
    tempo: "há 5 horas",
    tipo: "Reclamação",
    categoria: "Infraestrutura",
    titulo: "Buraco gigante na Av. Paulista",
    descricao:
      "Há semanas existe um buraco enorme que está causando acidentes. Já vi vários carros com pneus furados... Ver mais",
    local: "Av. Paulista, 1500",
    imagem:
      "https://images.unsplash.com/photo-1532974297617-c0dc1d77bc0a?q=80&w=1080&auto=format&fit=crop",
    apoios: 67,
    comentarios: 15,
    compartilhamentos: 12,
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
  },
];

export default function FeedScreen({ user, onCreate, onProfile, focusPostId }) {
  const [cityName, setCityName] = React.useState("Sua Cidade");
  const [posts, setPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [commentTarget, setCommentTarget] = React.useState(null);
  const [supportingIds, setSupportingIds] = React.useState(new Set());
  const [sharedIds, setSharedIds] = React.useState(new Set());
  const listRef = React.useRef(null);
  const [categorias, setCategorias] = React.useState([]);
  const [categoriaId, setCategoriaId] = React.useState(null);
  const [tipoPost, setTipoPost] = React.useState("todos");
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    let mounted = true;
    async function loadCityName() {
      if (user?.id_cidade) {
        const nome = await fetchCidadeNomeById(user.id_cidade);
        if (mounted) setCityName(nome || "Sua Cidade");
      }
    }
    loadCityName();
    return () => {
      mounted = false;
    };
  }, [user]);

  React.useEffect(() => {
    (async () => {
      try {
        const list = await fetchCategorias();
        setCategorias(Array.isArray(list) ? list : []);
      } catch (_) {
        setCategorias([]);
      }
    })();
  }, []);

  React.useEffect(() => {
    if (!focusPostId || !Array.isArray(posts) || posts.length === 0) return;
    const idx = posts.findIndex((p) => (p.id || p.id_post) === focusPostId);
    if (idx >= 0 && listRef.current) {
      try {
        listRef.current.scrollToIndex({ index: idx, animated: true });
      } catch (_) {
        // fallback: scrollToOffset
        listRef.current.scrollToOffset({
          offset: Math.max(0, idx * 300),
          animated: true,
        });
      }
    }
  }, [focusPostId, posts]);

  React.useEffect(() => {
    let mounted = true;
    async function loadPosts() {
      setLoading(true);
      try {
        const params = { id_cidade: user?.id_cidade };
        if (categoriaId) params.id_categoria = categoriaId;
        if (tipoPost && tipoPost !== "todos") params.tipo_post = tipoPost;
        if (searchTerm && searchTerm.trim().length > 0)
          params.titulo = searchTerm.trim();
        const res = await listPosts(params);
        const items = Array.isArray(res)
          ? res
          : Array.isArray(res?.posts)
          ? res.posts
          : [];
        let baseItems = items.length > 0 ? items : MOCK_POSTS;
        // Se houver posts reais do backend, buscar detalhes para anexar mídias
        if (Array.isArray(items) && items.length > 0) {
          const detailed = await Promise.all(
            items.map(async (p) => {
              const id = p.id || p.id_post;
              if (!id) return p;
              try {
                const d = await getPost(id);
                const full = d?.post || d;
                const metrics = d?.metrics || {};
                const apoiosCount = metrics?.apoios?.curtir || 0; // contamos 'curtir'
                const comentariosCount = metrics?.comentarios || 0;
                const compartilhamentosCount = metrics?.compartilhamentos || 0;
                return full
                  ? {
                      ...p,
                      ...full,
                      apoios: apoiosCount,
                      comentarios: comentariosCount,
                      compartilhamentos: compartilhamentosCount,
                      metrics: metrics,
                      apoio_atual: d?.apoio_atual ?? p.apoio_atual ?? null,
                    }
                  : p;
              } catch (_) {
                return p;
              }
            })
          );
          baseItems = detailed;
        }
        if (mounted) setPosts(baseItems);
      } catch (e) {
        if (mounted) setPosts(MOCK_POSTS);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadPosts();
    return () => {
      mounted = false;
    };
  }, [user, categoriaId, tipoPost, searchTerm]);

  const handleSupport = async (item) => {
    const id = item.id || item.id_post;
    if (!id) return;
    // Evita cliques duplicados enquanto processa
    if (supportingIds.has(id)) return;
    try {
      setSupportingIds((prev) => new Set(prev).add(id));
      if (item.apoio_atual === "curtir") {
        const res = await removeSupport(id);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === id || p.id_post === id
              ? {
                  ...p,
                  apoio_atual: null,
                  apoios:
                    res?.contagem?.curtir ?? Math.max((p.apoios || 0) - 1, 0),
                }
              : p
          )
        );
      } else {
        const res = await supportPost(id, "curtir");
        setPosts((prev) =>
          prev.map((p) =>
            p.id === id || p.id_post === id
              ? {
                  ...p,
                  apoio_atual: res?.apoio_atual || "curtir",
                  apoios: res?.contagem?.curtir ?? (p.apoios || 0) + 1,
                }
              : p
          )
        );
      }
    } catch (_) {
    } finally {
      setSupportingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleShare = async (item) => {
    const id = item.id || item.id_post;
    if (!id) return;
    try {
      const res = await sharePost(id);
      const url = res?.share_url;
      if (url) {
        try {
          await Share.share({ message: url });
        } catch (_) {}
      }
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id || p.id_post === id
            ? {
                ...p,
                compartilhamentos:
                  res?.total_compartilhamentos ??
                  (p.compartilhamentos || 0) + 1,
              }
            : p
        )
      );
      setSharedIds((prev) => new Set(prev).add(id));
    } catch (_) {}
  };

  const handleComment = (item) => {
    setCommentTarget(item);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={onProfile}>
          <MaterialIcons name="person" size={22} color="#0a4b9e" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>{`Feed ${cityName}`}</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={onCreate}>
          <MaterialIcons name="add" size={22} color="#0a4b9e" />
        </TouchableOpacity>
      </View>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <View style={{ backgroundColor: "#fff", borderRadius: 8 }}>
          <Picker
            selectedValue={categoriaId}
            onValueChange={(v) => setCategoriaId(v || null)}
          >
            <Picker.Item label="Todas as categorias" value={null} />
            {categorias.map((c) => (
              <Picker.Item
                key={c.id_categoria}
                label={c.nome_categoria}
                value={c.id_categoria}
              />
            ))}
          </Picker>
        </View>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          <TouchableOpacity
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: tipoPost === "todos" ? "#0a4b9e" : "#eef3fb",
            }}
            onPress={() => setTipoPost("todos")}
          >
            <Text
              style={{
                color: tipoPost === "todos" ? "#fff" : "#0a4b9e",
                fontWeight: "700",
              }}
            >
              Todos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: tipoPost === "sugestao" ? "#0a4b9e" : "#eef3fb",
            }}
            onPress={() => setTipoPost("sugestao")}
          >
            <Text
              style={{
                color: tipoPost === "sugestao" ? "#fff" : "#0a4b9e",
                fontWeight: "700",
              }}
            >
              Sugestões
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor:
                tipoPost === "reclamacao" ? "#0a4b9e" : "#eef3fb",
            }}
            onPress={() => setTipoPost("reclamacao")}
          >
            <Text
              style={{
                color: tipoPost === "reclamacao" ? "#fff" : "#0a4b9e",
                fontWeight: "700",
              }}
            >
              Reclamações
            </Text>
          </TouchableOpacity>
        </View>
        <TextInput
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Buscar por título"
          style={{
            backgroundColor: "#fff",
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginTop: 8,
          }}
        />
      </View>

      <FlatList
        contentContainerStyle={{ padding: 16 }}
        ref={listRef}
        data={posts}
        keyExtractor={(item) => String(item.id || item.id_post)}
        refreshing={loading}
        getItemLayout={(data, index) => ({
          length: 280,
          offset: 280 * index,
          index,
        })}
        onRefresh={() => {
          // força recarga
          const u = user;
          (async () => {
            try {
              const res = await listPosts({ id_cidade: u?.id_cidade });
              const items = Array.isArray(res)
                ? res
                : Array.isArray(res?.posts)
                ? res.posts
                : [];
              let baseItems = items.length > 0 ? items : MOCK_POSTS;
              if (Array.isArray(items) && items.length > 0) {
                const detailed = await Promise.all(
                  items.map(async (p) => {
                    const id = p.id || p.id_post;
                    if (!id) return p;
                    try {
                      const d = await getPost(id);
                      const full = d?.post || d;
                      const metrics = d?.metrics || {};
                      const apoiosCount = metrics?.apoios?.curtir || 0;
                      const comentariosCount = metrics?.comentarios || 0;
                      const compartilhamentosCount =
                        metrics?.compartilhamentos || 0;
                      return full
                        ? {
                            ...p,
                            ...full,
                            apoios: apoiosCount,
                            comentarios: comentariosCount,
                            compartilhamentos: compartilhamentosCount,
                            metrics: metrics, // manter também para consumo no PostCard
                            apoio_atual:
                              d?.apoio_atual ?? p.apoio_atual ?? null,
                          }
                        : p;
                    } catch (_) {
                      return p;
                    }
                  })
                );
                baseItems = detailed;
              }
              setPosts(baseItems);
            } catch (e) {
              setPosts(MOCK_POSTS);
            }
          })();
        }}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            supporting={supportingIds.has(item.id || item.id_post)}
            sharedByMe={sharedIds.has(item.id || item.id_post)}
            onSupport={() => handleSupport(item)}
            onComment={() => handleComment(item)}
            onShare={() => handleShare(item)}
          />
        )}
      />
      {commentTarget && (
        <CommentsSheet
          post={commentTarget}
          onClose={() => setCommentTarget(null)}
          onSubmitted={() => {
            const id = commentTarget.id || commentTarget.id_post;
            setPosts((prev) =>
              prev.map((p) =>
                p.id === id || p.id_post === id
                  ? {
                      ...p,
                      comentarios: (p.comentarios || 0) + 1,
                    }
                  : p
              )
            );
            setCommentTarget(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f6fb" },
  topBar: {
    height: 56,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e6eaf0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  topTitle: { fontSize: 16, fontWeight: "700", color: "#0a4b9e" },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e6eaf0",
    backgroundColor: "#fff",
  },
  // Comentários agora são geridos pelo CommentsSheet
});
