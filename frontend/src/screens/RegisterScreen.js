import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { fetchEstados, fetchCidadesByEstado } from '../api/client';
import { register } from '../api/auth';
import { setToken } from '../storage/token';

export default function RegisterScreen({ onGoToLogin }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [idEstado, setIdEstado] = useState();
  const [idCidade, setIdCidade] = useState();

  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [loadingEstados, setLoadingEstados] = useState(false);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadEstados() {
      try {
        setLoadingEstados(true);
        const lista = await fetchEstados();
        setEstados(lista);
      } catch (e) {
        setError('Falha ao carregar estados.');
      } finally {
        setLoadingEstados(false);
      }
    }
    loadEstados();
  }, []);

  useEffect(() => {
    async function loadCidades() {
      if (!idEstado) { setCidades([]); setIdCidade(undefined); return; }
      try {
        setLoadingCidades(true);
        const lista = await fetchCidadesByEstado(idEstado);
        setCidades(lista);
      } catch (e) {
        setError('Falha ao carregar cidades.');
      } finally {
        setLoadingCidades(false);
      }
    }
    loadCidades();
  }, [idEstado]);

  async function handleRegister() {
    setError('');
    if (!nome || !email || !senha || !confirmarSenha || !idCidade) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (senha.length < 8 || !/[A-Z]/.test(senha) || !/[a-z]/.test(senha) || !/[0-9]/.test(senha)) {
      setError('Senha não atende aos requisitos.');
      return;
    }
    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }
    try {
      const res = await register({ nome, email, senha, id_cidade: idCidade });
      if (res?.token) {
        await setToken(res.token);
        Alert.alert('Cadastro concluído', 'Sua conta foi criada.');
        onGoToLogin?.();
      } else {
        setError(res?.message || 'Falha ao cadastrar');
      }
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Erro inesperado');
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top','bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <View style={styles.header}>
          <Image source={require('../../assets/meuMunicipioLogo.jpg')} style={styles.logo} />
          <Text style={styles.headerTitle}>Meu Município</Text>
          <Text style={styles.headerSubtitle}>Campos marcados com (*) são obrigatórios</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Cadastro</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.label}>Nome Completo *</Text>
          <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Digite seu nome" />

          <Text style={styles.label}>E-mail *</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.label}>Estado *</Text>
          {loadingEstados ? (
            <ActivityIndicator />
          ) : (
            <View style={styles.pickerWrapper}>
              <Picker selectedValue={idEstado} onValueChange={(v) => setIdEstado(v)}>
                <Picker.Item label="Selecione um estado" value={undefined} />
                {estados.map((e) => (
                  <Picker.Item key={e.id_estado} label={e.nome_estado} value={e.id_estado} />
                ))}
              </Picker>
            </View>
          )}

          <Text style={styles.label}>Cidade *</Text>
          {loadingCidades ? (
            <ActivityIndicator />
          ) : (
            <View style={styles.pickerWrapper}>
              <Picker selectedValue={idCidade} enabled={!!idEstado} onValueChange={(v) => setIdCidade(v)}>
                <Picker.Item label={idEstado ? 'Selecione uma cidade' : 'Selecione um estado primeiro'} value={undefined} />
                {cidades.map((c) => (
                  <Picker.Item key={c.id_cidade} label={c.nome_cidade} value={c.id_cidade} />
                ))}
              </Picker>
            </View>
          )}

          <Text style={styles.label}>Senha *</Text>
          <TextInput style={styles.input} value={senha} onChangeText={setSenha} placeholder="Crie sua senha" secureTextEntry />
          <View style={styles.passwordRules}>
            <Text style={styles.rule}>• Mínimo 8 caracteres</Text>
            <Text style={styles.rule}>• Pelo menos uma letra maiúscula</Text>
            <Text style={styles.rule}>• Pelo menos uma letra minúscula</Text>
            <Text style={styles.rule}>• Pelo menos um número</Text>
          </View>

          <Text style={styles.label}>Confirmar Senha *</Text>
          <TextInput style={styles.input} value={confirmarSenha} onChangeText={setConfirmarSenha} placeholder="Confirme sua senha" secureTextEntry />

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Cadastrar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onGoToLogin}>
            <Text style={styles.link}>Já tem uma conta? Faça login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f6fb' },
  content: { paddingHorizontal: 24, paddingBottom: 24 },
  header: { alignItems: 'center', backgroundColor: '#0a4b9e', paddingVertical: 32, marginBottom: 24 },
  logo: { width: 72, height: 72, borderRadius: 36, marginBottom: 8 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerSubtitle: { color: '#e3ecfa', fontSize: 12, marginTop: 4 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  error: { color: '#c00', marginBottom: 8, textAlign: 'center' },
  label: { fontSize: 14, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16 },
  pickerWrapper: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 16 },
  passwordRules: { backgroundColor: '#f5f7fb', padding: 12, borderRadius: 8, marginBottom: 12 },
  rule: { fontSize: 12, color: '#333' },
  button: { backgroundColor: '#0a4b9e', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
  link: { color: '#0a4b9e', textAlign: 'center', marginTop: 16 },
});