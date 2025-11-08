import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import FeedScreen from './src/screens/FeedScreen';
import { getToken } from './src/storage/token';
import { setAuthToken } from './src/api/client';
import { me } from './src/api/auth';

export default function App() {
  const [screen, setScreen] = React.useState('login');
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    async function bootstrapUser() {
      try {
        const token = await getToken();
        if (!token) { setUser(null); setScreen('login'); return; }
        setAuthToken(token);
        const u = await me();
        if (mounted && u) { setUser(u); setScreen('feed'); }
      } catch (e) {
        // Token inválido ou erro; volta para login
        setUser(null);
        setAuthToken(null);
        setScreen('login');
      }
    }
    bootstrapUser();
    return () => { mounted = false; };
  }, []);
  return (
    <View style={styles.container}>
      {screen === 'login' && (
        <LoginScreen onGoToRegister={() => setScreen('register')} onLoggedIn={(u) => { setUser(u); setScreen('feed'); }} />
      )}
      {screen === 'register' && (
        <RegisterScreen onGoToLogin={() => setScreen('login')} />
      )}
      {screen === 'feed' && <FeedScreen user={user} />}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});
