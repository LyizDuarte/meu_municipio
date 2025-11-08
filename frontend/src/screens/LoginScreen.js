import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { login } from '../api/auth';
import { setToken } from '../storage/token';

export default function LoginScreen({ onGoToRegister, onLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    try {
      if (!email || !password) {
        Alert.alert('Campos obrigatórios', 'Informe e-mail e senha.');
        return;
      }
      const res = await login({ email, senha: password });
      if (res?.token) {
        await setToken(res.token);
        Alert.alert('Sucesso', 'Login realizado! Token armazenado.');
        onLoggedIn?.(res.user);
      } else {
        Alert.alert('Erro', res?.message || 'Falha ao realizar login');
      }
    } catch (e) {
      Alert.alert('Erro', e?.response?.data?.message || e.message || 'Erro inesperado');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../assets/meuMunicipioLogo.jpg')} style={styles.logo} />
        <Text style={styles.headerTitle}>Meu Município</Text>
        <Text style={styles.headerSubtitle}>Acesse sua conta para continuar</Text>
      </View>
      <Text style={styles.title}>Login</Text>

      <Text style={styles.label}>E-mail</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="seu@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Senha</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Digite sua senha"
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onGoToRegister}>
        <Text style={styles.link}>Não tem uma conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  header: { alignItems: 'center', backgroundColor: '#0a4b9e', paddingVertical: 32, marginHorizontal: -24, marginTop: -24, marginBottom: 24 },
  logo: { width: 72, height: 72, borderRadius: 36, marginBottom: 8 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerSubtitle: { color: '#e3ecfa', fontSize: 12, marginTop: 4 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  label: { fontSize: 14, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16 },
  button: { backgroundColor: '#0a4b9e', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
  link: { color: '#0a4b9e', textAlign: 'center', marginTop: 16 },
});