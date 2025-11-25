import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { createPost } from '../api/posts';

// Mapeamento simples de categorias para IDs
const CATEGORY_ID_MAP = {
  'Iluminação Pública': 1,
  'Infraestrutura': 2,
  'Saúde': 3,
  'Educação': 4,
  'Segurança': 5,
  'Transporte': 6,
};

const CATEGORIES = [
  'Iluminação Pública',
  'Infraestrutura',
  'Saúde',
  'Educação',
  'Segurança',
  'Transporte',
];

export default function CreatePostScreen({ user, onClose, onPublished }) {
  const [tipo, setTipo] = React.useState('Sugestão');
  const [categoria, setCategoria] = React.useState('');
  const [titulo, setTitulo] = React.useState('');
  const [descricao, setDescricao] = React.useState('');
  const [fotos, setFotos] = React.useState([]); // array de { uri }
  const [coords, setCoords] = React.useState(null); // { latitude, longitude }
  const [submitting, setSubmitting] = React.useState(false);

  async function handleUseLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    } catch (e) {}
  }

  async function handleOpenCamera() {
    if (fotos.length >= 3) return;
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') return;
      const result = await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true });
      if (!result.canceled && result.assets?.length) {
        setFotos((prev) => [...prev, { uri: result.assets[0].uri }].slice(0, 3));
      }
    } catch (e) {}
  }

  const canPublish = titulo.trim().length > 0 && descricao.trim().length > 0 && categoria;

  async function handlePublish() {
    if (!canPublish || submitting) return;
    setSubmitting(true);
    try {
      const tipo_post = tipo === 'Sugestão' ? 'sugestao' : 'reclamacao';
      const id_categoria = CATEGORY_ID_MAP[categoria] || 1;
      const payload = {
        id_categoria,
        id_cidade: user?.id_cidade || null,
        tipo_post,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        local_latitude: coords?.latitude || null,
        local_longitude: coords?.longitude || null,
        fotos,
      };
      await createPost(payload);
      Alert.alert('Publicado', 'Seu post foi publicado com sucesso.');
      onPublished?.();
      onClose?.();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Falha ao publicar.';
      Alert.alert('Erro ao publicar', msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top','bottom']}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={onClose}><MaterialIcons name="close" size={22} color="#0a4b9e" /></TouchableOpacity>
        <Text style={styles.topTitle}>Nova Publicação</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.userCard}>
          <Image source={{ uri: user?.avatar || 'https://randomuser.me/api/portraits/women/75.jpg' }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user?.nome || 'Você'}</Text>
            <Text style={styles.userCity}>São Paulo, SP</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Tipo de Publicação</Text>
        <View style={styles.segmentRow}>
          <TouchableOpacity style={[styles.segmentBtn, tipo === 'Sugestão' && styles.segmentActive]} onPress={() => setTipo('Sugestão')}>
            <MaterialIcons name="lightbulb" size={18} color="#0a4b9e" /><Text style={styles.segmentText}>Sugestão</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.segmentBtn, tipo === 'Reclamação' && styles.segmentActive]} onPress={() => setTipo('Reclamação')}>
            <MaterialIcons name="warning" size={18} color="#0a4b9e" /><Text style={styles.segmentText}>Reclamação</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Categoria</Text>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={categoria} onValueChange={(v) => setCategoria(v)}>
            <Picker.Item label="Selecione uma categoria" value="" />
            {CATEGORIES.map((c) => (<Picker.Item key={c} label={c} value={c} />))}
          </Picker>
        </View>

        <Text style={styles.sectionLabel}>Título *</Text>
        <TextInput
          style={styles.input}
          placeholder="Título da sua sugestão/reclamação"
          value={titulo}
          onChangeText={setTitulo}
          maxLength={80}
        />

        <Text style={styles.sectionLabel}>Descrição *</Text>
        <TextInput
          style={[styles.input, { height: 120 }]} multiline
          placeholder="Descreva sua sugestão ou reclamação em detalhes..."
          value={descricao}
          onChangeText={setDescricao}
          maxLength={500}
        />

        <Text style={styles.sectionLabel}>Anexar Fotos (Opcional)</Text>
        <TouchableOpacity style={styles.photoBox} onPress={handleOpenCamera}>
          <MaterialIcons name="photo-camera" size={24} color="#6b7280" />
          <Text style={{ color: '#6b7280', marginTop: 6 }}>Toque para adicionar fotos</Text>
          <Text style={{ color: '#6b7280', marginTop: 2 }}>Máximo de 3 fotos</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          {fotos.map((f, idx) => (
            <Image key={idx} source={{ uri: f.uri }} style={{ width: 72, height: 72, borderRadius: 8, marginRight: 8 }} />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Localização (Recomendado)</Text>
        <TouchableOpacity style={styles.locationRow} onPress={handleUseLocation}>
          <MaterialIcons name="location-on" size={18} color="#0a4b9e" />
          <Text style={styles.locationText}>{coords ? `Lat ${coords.latitude.toFixed(5)}, Lng ${coords.longitude.toFixed(5)}` : 'Usar Localização Atual'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.publishBtn, (!canPublish || submitting) && { opacity: 0.6 }]} disabled={!canPublish || submitting} onPress={handlePublish}>
          {submitting ? (
            <ActivityIndicator size="small" color="#0a4b9e" />
          ) : (
            <Text style={styles.publishText}>Publicar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: { height: 56, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e6eaf0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
  topTitle: { fontSize: 16, fontWeight: '700', color: '#0a4b9e' },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, borderWidth: 1, borderColor: '#e6eaf0', backgroundColor: '#fff' },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fbff', borderWidth: 1, borderColor: '#e6eaf0', borderRadius: 12, padding: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  userName: { fontWeight: '600' },
  userCity: { color: '#6b7280', fontSize: 12 },
  sectionLabel: { marginTop: 16, marginBottom: 6, fontWeight: '600', color: '#374151' },
  segmentRow: { flexDirection: 'row', marginBottom: 8 },
  segmentBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#e6eaf0', borderRadius: 8, marginRight: 8, backgroundColor: '#fff' },
  segmentActive: { backgroundColor: '#e9f1ff' },
  segmentText: { marginLeft: 6, color: '#0a4b9e', fontWeight: '600' },
  pickerWrapper: { borderWidth: 1, borderColor: '#e6eaf0', borderRadius: 8, backgroundColor: '#fff' },
  input: { borderWidth: 1, borderColor: '#e6eaf0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' },
  photoBox: { borderWidth: 1, borderColor: '#e6eaf0', borderStyle: 'dashed', borderRadius: 8, padding: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  locationRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e6eaf0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: '#fff' },
  locationText: { marginLeft: 6, color: '#0a4b9e' },
  publishBtn: { marginTop: 20, backgroundColor: '#e6eaf0', borderRadius: 12, alignItems: 'center', paddingVertical: 12 },
  publishText: { color: '#0a4b9e', fontWeight: '700' },
});