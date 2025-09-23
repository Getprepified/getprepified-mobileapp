import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../lib/auth";

const rowStyles = StyleSheet.create({
  pressable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E4FF",
    marginBottom: 12,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleText: {
    marginLeft: 12,
    color: "#0C0A1C",
    fontFamily: "Urbanist",
    fontSize: 16,
  },
});

function Row({
  title,
  href,
  icon,
}: {
  title: string;
  href: string;
  icon: any;
}) {
  return (
    <Link href={href} asChild>
      <Pressable style={rowStyles.pressable}>
        <View style={rowStyles.leftContainer}>
          <Ionicons name={icon} size={20} color="#6D57FC" />
          <Text style={rowStyles.titleText}>{title}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#B0A4FD" />
      </Pressable>
    </Link>
  );
}

export default function Settings() {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your preferences.</Text>
        {user && (
          <Text style={styles.loggedInText}>
            Logged in as {user.fullName} ({user.role})
          </Text>
        )}
      </View>

      <View style={styles.contentContainer}>
        <Row title="Profile" href="/settings/profile" icon="person-outline" />
        <Row
          title="Link Account"
          href="/settings/link-account"
          icon="link-outline"
        />
        <Row
          title="Notifications"
          href="/settings/notifications"
          icon="notifications-outline"
        />
        <Row title="Privacy" href="/settings/privacy" icon="shield-outline" />
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <View style={styles.logoutButtonContent}>
            <View style={styles.logoutIconContainer}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>
            <Text style={styles.logoutText}>Logout</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#0C0A1C" />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "white",
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    backgroundColor: "#E8E4FF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: "Urbanist",
    fontWeight: "bold",
    color: "#0C0A1C",
  },
  headerSubtitle: {
    color: "#261E58",
    marginTop: 8,
  },
  loggedInText: {
    fontSize: 14,
    fontFamily: "Inter",
    color: "rgba(38,30,88,0.7)",
    marginTop: 8,
  },
  contentContainer: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E4FF",
  },
  logoutButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutIconContainer: {
    height: 40,
    width: 40,
    borderRadius: 9999,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  logoutText: {
    fontSize: 18,
    fontFamily: "Inter",
    color: "#EF4444",
  },
});
