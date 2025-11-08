import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import FeedScreen from './src/screens/FeedScreen';

export default function App() {
  const [screen, setScreen] = React.useState('login');
  const [user, setUser] = React.useState(null);
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
