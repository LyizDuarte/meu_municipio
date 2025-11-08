import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

export default function App() {
  const [screen, setScreen] = React.useState('login');
  return (
    <View style={styles.container}>
      {screen === 'login' ? (
        <LoginScreen onGoToRegister={() => setScreen('register')} />
      ) : (
        <RegisterScreen onGoToLogin={() => setScreen('login')} />
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});
