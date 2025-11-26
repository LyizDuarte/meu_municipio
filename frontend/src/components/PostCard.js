import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { api } from "../api/client";

export default function PostCard({
  post,
  onSupport,
  onComment,
  onShare,
  supporting = false,
  sharedByMe = false,
}) {
  const handleSupport = onSupport || (() => {});
  const handleComment = onComment || (() => {});
  const handleShare = onShare || (() => {});
  const tipoLabel =
    post.tipo ||
    (post.tipo_post === "sugestao"
      ? "Sugestão"
      : post.tipo_post === "reclamacao"
      ? "Reclamação"
      : "");
  const isSugestao = tipoLabel === "Sugestão";
  const categoriaLabel = post.categoria || post.nome_categoria || "";
  const localText = post.local || post.nome_cidade || "";
  const mediaBase = api?.defaults?.baseURL
    ? api.defaults.baseURL.replace(/\/api$/, "")
    : "";
  const avatarCandidate =
    post.avatar || post.autor_media_url || post.media_url || null;
  const avatarUrl = avatarCandidate
    ? String(avatarCandidate).startsWith("http")
      ? avatarCandidate
      : `${mediaBase}${avatarCandidate}`
    : null;
  const midias = Array.isArray(post.midias) ? post.midias : [];
  const mediaUrls = midias
    .map((m) => m.url || m.midia_url)
    .filter(Boolean)
    .map((u) => (u.startsWith("http") ? u : `${mediaBase}${u}`));
  const timeText = post.data_criacao
    ? new Date(post.data_criacao).toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      })
    : "";
  const comentariosCount =
    typeof post.comentarios === "number"
      ? post.comentarios
      : post.metrics?.comentarios || 0;
  const compartilhamentosCount =
    typeof post.compartilhamentos === "number"
      ? post.compartilhamentos
      : post.metrics?.compartilhamentos || 0;
  const apoiosCount =
    typeof post.apoios === "number"
      ? post.apoios
      : post.metrics?.apoios?.curtir || 0;
  const supported = post.apoio_atual === "curtir";
  const isShared = sharedByMe || post.shared_by_me === true;
  return (
    <View
      style={[
        styles.card,
        isSugestao ? styles.cardSugestao : styles.cardReclamacao,
      ]}
    >
      <View style={styles.headerRow}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={24} color="#7f8ea3" />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.author}>
            {post.autor || post.autor_nome || "Usuário"}
          </Text>
          <Text style={styles.time}>{timeText}</Text>
        </View>
        <View
          style={[
            styles.tag,
            isSugestao ? styles.tagSugestao : styles.tagReclamacao,
          ]}
        >
          <Text
            style={[
              styles.tagText,
              isSugestao ? styles.tagTextSugestao : styles.tagTextReclamacao,
            ]}
          >
            {tipoLabel}
          </Text>
        </View>
      </View>
      {sharedByMe && (
        <View style={styles.sharedBanner}>
          <MaterialIcons name="repeat" size={16} color="#0a4b9e" />
          <Text style={styles.sharedText}>Compartilhado por você</Text>
        </View>
      )}

      {!!categoriaLabel && (
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>{categoriaLabel}</Text>
        </View>
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
      ) : post.imagem ? (
        <Image source={{ uri: post.imagem }} style={styles.photo} />
      ) : null}

      <View style={styles.footerStats}>
        <Text style={styles.stat}>{apoiosCount} apoios</Text>
        <Text style={styles.stat} onPress={handleComment}>
          {comentariosCount} comentários
        </Text>
        <Text style={styles.stat}>
          {compartilhamentosCount} compartilhamentos
        </Text>
      </View>

      <View style={styles.footerActions}>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            supporting ? styles.actionBtnDisabled : null,
          ]}
          onPress={handleSupport}
          disabled={supporting}
        >
          <MaterialIcons
            name="thumb-up"
            size={18}
            color={supporting ? "#94a3b8" : "#0a4b9e"}
          />
          <Text
            style={[
              styles.actionText,
              supporting ? styles.actionTextDisabled : null,
            ]}
          >
            {supported
              ? "Remover apoio"
              : supporting
              ? "Apoiando..."
              : "Apoiar"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleComment}>
          <MaterialIcons name="chat-bubble" size={18} color="#0a4b9e" />
          <Text style={styles.actionText}>Comentar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
          <MaterialIcons name="share" size={18} color="#0a4b9e" />
          <Text style={styles.actionText}>
            {isShared ? "Descompartilhar" : "Compartilhar"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e6eaf0",
  },
  cardSugestao: { borderColor: "#d1fae5" },
  cardReclamacao: { borderColor: "#fecaca" },
  headerRow: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8 },
  author: { fontWeight: "600", fontSize: 14 },
  time: { color: "#6b7280", fontSize: 12 },
  tag: {
    backgroundColor: "#e9f1ff",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagSugestao: { backgroundColor: "#e7f5ef" },
  tagReclamacao: { backgroundColor: "#fee2e2" },
  tagText: { color: "#0a4b9e", fontSize: 12, fontWeight: "600" },
  tagTextSugestao: { color: "#1f7a47" },
  tagTextReclamacao: { color: "#b91c1c" },
  sharedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  sharedText: { color: "#0a4b9e", fontWeight: "600" },
  categoryPill: {
    alignSelf: "flex-start",
    backgroundColor: "#eaf8ef",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  categoryText: { color: "#1f7a47", fontSize: 12, fontWeight: "600" },
  title: { fontSize: 18, fontWeight: "800", marginTop: 8, color: "#0a4b9e" },
  description: { color: "#374151", marginTop: 4 },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  locationText: { marginLeft: 4, color: "#0a4b9e" },
  photo: { height: 180, borderRadius: 8, marginTop: 8 },
  photoInline: { width: 220, height: 140, borderRadius: 8, marginRight: 8 },
  footerStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  stat: { color: "#6b7280" },
  footerActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eef2f7",
  },
  actionBtn: { flexDirection: "row", alignItems: "center" },
  actionBtnDisabled: { opacity: 0.6 },
  actionText: { marginLeft: 6, color: "#0a4b9e", fontWeight: "600" },
  actionTextDisabled: { color: "#94a3b8" },
});
