import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import PostCard from "../components/PostCard";
import CommentsSheet from "../components/CommentsSheet";
import {
  listPostsByUser,
  listLikedPostsByUser,
  listCommentsByUser,
  getPost,
} from "../api/posts";
import { updateMe, uploadAvatar } from "../api/auth";
import { api } from "../api/client";
import * as ImagePicker from "expo-image-picker";
import { fetchCidadeNomeById } from "../api/client";

export default function ProfileScreen({ user, onBack, onUpdated, onOpenPost }) {
  const [editing, setEditing] = React.useState(false);
  const [nome, setNome] = React.useState(user?.nome || "");
  const [descricao, setDescricao] = React.useState(user?.descricao || "");
  const [mediaUrl, setMediaUrl] = React.useState(user?.media_url || "");
  const [posts, setPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [commentTarget, setCommentTarget] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState("publicacoes"); // 'publicacoes' | 'respostas' | 'curtidas'
  const [postTitles, setPostTitles] = React.useState({});
  const [cityName, setCityName] = React.useState("");

  const loadForTab = React.useCallback(
    async (tab) => {
      setLoading(true);
      try {
        let res;
        if (tab === "publicacoes") {
          res = await listPostsByUser(user?.id_usuario);
        } else if (tab === "respostas") {
          res = await listCommentsByUser(user?.id_usuario);
        } else if (tab === "curtidas") {
          res = await listLikedPostsByUser(user?.id_usuario);
        }
        const isRespostas = tab === "respostas";
        const items = isRespostas
          ? Array.isArray(res?.comentarios)
            ? res.comentarios
            : []
          : Array.isArray(res)
          ? res
          : Array.isArray(res?.posts)
          ? res.posts
          : [];
        if (!isRespostas) {
          const hydrated = await Promise.all(
            items.map(async (p) => {
              const id = p.id || p.id_post;
              try {
                const d = await getPost(id);
                const full = d?.post || d;
                const metrics = d?.metrics || {};
                const apoiosCount = metrics?.apoios?.curtir || 0;
                const comentariosCount = metrics?.comentarios || 0;
                const compartilhamentosCount = metrics?.compartilhamentos || 0;
                return full
                  ? {
                      ...p,
                      ...full,
                      apoios: apoiosCount,
                      comentarios: comentariosCount,
                      compartilhamentos: compartilhamentosCount,
                      metrics,
                      apoio_atual: d?.apoio_atual ?? p.apoio_atual ?? null,
                    }
                  : p;
              } catch (_) {
                return p;
              }
            })
          );
          setPosts(hydrated);
        } else {
          setPosts(items);
        }
      } catch (_) {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (mounted) await loadForTab(activeTab);
    })();
    return () => {
      mounted = false;
    };
  }, [user, activeTab, loadForTab]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (user?.id_cidade) {
        const nome = await fetchCidadeNomeById(user.id_cidade);
        if (mounted) setCityName(nome || "");
      } else {
        if (mounted) setCityName("");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id_cidade]);

  React.useEffect(() => {
    if (activeTab !== "respostas") return;
    const items = Array.isArray(posts) ? posts : [];
    (async () => {
      const next = { ...postTitles };
      for (const c of items) {
        const pid = c.id_post;
        if (!pid || next[pid]) continue;
        try {
          const d = await getPost(pid);
          const full = d?.post || d;
          const titulo = full?.titulo || null;
          if (titulo) next[pid] = titulo;
        } catch (_) {}
      }
      setPostTitles(next);
    })();
  }, [activeTab, posts]);

  const saveProfile = async () => {
    try {
      const payload = {};
      if (nome !== user?.nome) payload.nome = nome;
      if (descricao !== user?.descricao) payload.descricao = descricao;
      if (mediaUrl !== user?.media_url) payload.media_url = mediaUrl;
      const updated = await updateMe(payload);
      setEditing(false);
      onUpdated?.(updated);
    } catch (e) {
      // manter edição aberta para usuário corrigir
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={22} color="#0a4b9e" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Perfil</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setEditing((v) => !v)}
        >
          <MaterialIcons name="edit" size={22} color="#0a4b9e" />
        </TouchableOpacity>
      </View>

      <FlatList
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.row}>
              {user?.media_url ? (
                (() => {
                  const base = api?.defaults?.baseURL
                    ? api.defaults.baseURL.replace(/\/api$/, "")
                    : "";
                  const src = String(user.media_url).startsWith("http")
                    ? user.media_url
                    : `${base}${user.media_url}`;
                  return <Image source={{ uri: src }} style={styles.avatar} />;
                })()
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <MaterialIcons name="person" size={28} color="#7f8ea3" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                {editing ? (
                  <TextInput
                    value={nome}
                    onChangeText={setNome}
                    style={styles.inputTitle}
                    placeholder="Seu nome"
                  />
                ) : (
                  <Text style={styles.name}>{user?.nome}</Text>
                )}
                {editing ? (
                  <TextInput
                    value={descricao}
                    onChangeText={setDescricao}
                    style={styles.inputSubtitle}
                    placeholder="Descrição"
                    multiline
                  />
                ) : (
                  <Text style={styles.desc}>
                    {user?.descricao || "Sem descrição"}
                  </Text>
                )}
                {!!cityName && <Text style={styles.city}>{cityName}</Text>}
              </View>
            </View>
            {editing && (
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={saveProfile}
                >
                  <Text style={styles.primaryText}>Salvar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => {
                    setEditing(false);
                    setNome(user?.nome || "");
                    setDescricao(user?.descricao || "");
                    setMediaUrl(user?.media_url || "");
                  }}
                >
                  <Text style={styles.secondaryText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.secondaryBtn, { marginLeft: 8 }]}
                  onPress={async () => {
                    try {
                      const { status } =
                        await ImagePicker.requestMediaLibraryPermissionsAsync();
                      if (status !== "granted") return;
                      const result = await ImagePicker.launchImageLibraryAsync({
                        allowsEditing: true,
                        quality: 0.7,
                      });
                      if (!result.canceled && result.assets?.length) {
                        const asset = result.assets[0];
                        const updated = await uploadAvatar({
                          uri: asset.uri,
                          name: asset.fileName || "avatar.jpg",
                          type: asset.mimeType || "image/jpeg",
                        });
                        setMediaUrl(updated?.media_url || "");
                        onUpdated?.(updated);
                      }
                    } catch (_) {}
                  }}
                >
                  <Text style={styles.secondaryText}>Foto de perfil</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.tabs}>
              <TouchableOpacity onPress={() => setActiveTab("publicacoes")}>
                <Text
                  style={[
                    styles.tabItem,
                    activeTab === "publicacoes" ? styles.tabActive : null,
                  ]}
                >
                  Publicações
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveTab("respostas")}>
                <Text
                  style={[
                    styles.tabItem,
                    activeTab === "respostas" ? styles.tabActive : null,
                  ]}
                >
                  Respostas
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveTab("curtidas")}>
                <Text
                  style={[
                    styles.tabItem,
                    activeTab === "curtidas" ? styles.tabActive : null,
                  ]}
                >
                  Curtidas
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        contentContainerStyle={{ padding: 16 }}
        data={posts}
        keyExtractor={(item, index) => {
          if (activeTab === "respostas") {
            const key = `${item.id_comentario ?? index}-${
              item.id_post ?? "nopost"
            }`;
            return `resposta-${key}`;
          }
          const id = item.id || item.id_post || index;
          if (activeTab === "curtidas") {
            return `liked-${id}-${index}`;
          }
          if (activeTab === "publicacoes") {
            return `pub-${id}-${index}`;
          }
          return `post-${id}-${index}`;
        }}
        refreshing={loading}
        renderItem={({ item }) =>
          activeTab === "respostas" ? (
            <View style={styles.commentCard}>
              <Text style={[styles.commentMeta, { marginBottom: 4 }]}>
                Post: {postTitles[item.id_post] || "Carregando..."}
              </Text>
              <Text style={styles.commentContent}>{item.conteudo}</Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 6,
                }}
              >
                <Text style={styles.commentMeta}>
                  Comentado em {new Date(item.data_comentario).toLocaleString()}
                </Text>
                <TouchableOpacity
                  style={styles.viewPostBtn}
                  onPress={() => {
                    if (typeof onOpenPost === "function")
                      onOpenPost(item.id_post);
                  }}
                >
                  <Text style={styles.viewPostText}>Ver post</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <PostCard
              post={item}
              onComment={() => setCommentTarget(item)}
              onSupport={() => {}}
              onShare={() => {}}
            />
          )
        }
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
                  ? { ...p, comentarios: (p.comentarios || 0) + 1 }
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
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e6eaf0",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e6eaf0",
  },
  avatarFallback: { alignItems: "center", justifyContent: "center" },
  name: { fontSize: 18, fontWeight: "700", color: "#0a4b9e" },
  desc: { fontSize: 14, color: "#4b5d7a", marginTop: 4 },
  city: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  inputTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0a4b9e",
    borderWidth: 1,
    borderColor: "#e6eaf0",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  inputSubtitle: {
    fontSize: 14,
    color: "#4b5d7a",
    borderWidth: 1,
    borderColor: "#e6eaf0",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginTop: 6,
  },
  editActions: { flexDirection: "row", gap: 12, marginTop: 12 },
  primaryBtn: {
    backgroundColor: "#0a4b9e",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryText: { color: "#fff", fontWeight: "700" },
  secondaryBtn: {
    backgroundColor: "#eef3fb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  secondaryText: { color: "#0a4b9e", fontWeight: "700" },
  tabs: { flexDirection: "row", gap: 16, paddingTop: 12 },
  tabItem: { color: "#0a4b9e", opacity: 0.6, fontWeight: "700" },
  tabActive: { opacity: 1 },
  commentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e6eaf0",
  },
  commentContent: { color: "#374151" },
  commentMeta: { color: "#6b7280", fontSize: 12 },
  viewPostBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#eef3fb",
  },
  viewPostText: { color: "#0a4b9e", fontWeight: "700" },
});
