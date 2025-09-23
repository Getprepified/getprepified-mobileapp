import { useEffect } from "react";
import { router } from "expo-router";
import { useAuth } from "../lib/auth";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function Index() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is logged in, redirect to main app
        router.replace("/(tabs)");
      } else {
        // User is not logged in, redirect to onboarding
        router.replace("/onboarding");
      }
    }
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
