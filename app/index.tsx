import { Redirect } from "expo-router";
import { useAuth } from "./contexts/UserContext";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { user, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If no user is authenticated, redirect to login
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // If user is authenticated, redirect based on their role
  if (user.role === "parent") {
    return <Redirect href="/parent/dashboard" />;
  } else if (user.role === "student") {
    return <Redirect href="/dashboard" />;
  } else {
    // Default fallback for other roles
    return <Redirect href="/dashboard" />;
  }
}
