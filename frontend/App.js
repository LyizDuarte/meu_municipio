import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import FeedScreen from "./src/screens/FeedScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import CreatePostScreen from "./src/screens/CreatePostScreen";
import { getToken, clearToken } from "./src/storage/token";
import { setAuthToken } from "./src/api/client";
import { me } from "./src/api/auth";

export default function App() {
  const [screen, setScreen] = React.useState("login");
  const [user, setUser] = React.useState(null);
  const [focusPostId, setFocusPostId] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    async function bootstrapUser() {
      try {
        const token = await getToken();
        if (!token) {
          setUser(null);
          setScreen("login");
          return;
        }
        setAuthToken(token);
        const u = await me();
        if (mounted && u) {
          setUser(u);
          setScreen("feed");
        }
      } catch (e) {
        // Token inválido ou erro; volta para login
        setUser(null);
        setAuthToken(null);
        setScreen("login");
      }
    }
    bootstrapUser();
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        {screen === "login" && (
          <LoginScreen
            onGoToRegister={() => setScreen("register")}
            onLoggedIn={(u) => {
              setUser(u);
              setScreen("feed");
            }}
          />
        )}
        {screen === "register" && (
          <RegisterScreen onGoToLogin={() => setScreen("login")} />
        )}
        {screen === "feed" && (
          <FeedScreen
            user={user}
            onCreate={() => setScreen("create")}
            onProfile={() => setScreen("profile")}
            focusPostId={focusPostId}
          />
        )}
        {screen === "create" && (
          <CreatePostScreen
            user={user}
            onClose={() => setScreen("feed")}
            onPublished={() => {
              // Em uma próxima etapa podemos acionar reload do Feed via contexto/prop
              setScreen("feed");
            }}
          />
        )}
        {screen === "profile" && (
          <ProfileScreen
            user={user}
            onBack={() => setScreen("feed")}
            onUpdated={(u) => {
              setUser(u);
            }}
            onOpenPost={(id) => {
              setFocusPostId(id);
              setScreen("feed");
            }}
            onLogout={async () => {
              try {
                await clearToken();
              } catch (_) {}
              setAuthToken(null);
              setUser(null);
              setScreen("login");
            }}
          />
        )}
        <StatusBar style="dark" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f6fb" },
});
