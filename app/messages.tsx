import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import FooterNavigation from "./components/FooterNavigation";
import apiClient from "./utils/apiClient";
import { useAuth } from "./contexts/UserContext";
import { useRouter } from "expo-router";

const MessagesPage = () => {
  const { token } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const router = useRouter();
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        if (!token) return;
        const res = await apiClient.get("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const me = res.data;
        const list = (me?.friends || []).map((f: any) => ({
          id: f._id || f.id || f,
          name: f.fullName || "",
          nickname: f.nickname || "",
        }));
        setFriends(list);
      } catch {}
    })();
  }, [token]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter(
      (f) =>
        (f.nickname || "").toLowerCase().includes(q) ||
        (f.name || "").toLowerCase().includes(q)
    );
  }, [friends, search]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.cardItem}
      onPress={() =>
        router.push({
          pathname: "/dm",
          params: { friendId: item.id, friendName: item.name },
        })
      }
    >
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>
          {(item.name || "ST")
            .split(" ")
            .map((w: string) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.nick}>@{item.nickname || "student"}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>
          Chat via streaks and compare results
        </Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search friends"
          placeholderTextColor="#9CA3AF"
          style={styles.search}
        />
        <View style={styles.filtersRow}>
          <View style={[styles.filterChip, { backgroundColor: "#EEF2FF" }]}>
            <Text style={[styles.filterChipText, { color: "#4F46E5" }]}>
              All
            </Text>
          </View>
          <View style={[styles.filterChip, { backgroundColor: "#ECFDF5" }]}>
            <Text style={[styles.filterChipText, { color: "#047857" }]}>
              Recent
            </Text>
          </View>
          <View style={[styles.filterChip, { backgroundColor: "#FFF7ED" }]}>
            <Text style={[styles.filterChipText, { color: "#9A3412" }]}>
              Unread
            </Text>
          </View>
        </View>
      </View>
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      />
      <FooterNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: { padding: 16, backgroundColor: "#ffffff" },
  title: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtitle: { color: "#6B7280", marginTop: 4, marginBottom: 12 },
  search: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
  },
  filtersRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999 },
  filterChipText: { fontWeight: "700" },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: "#4F46E5", fontWeight: "800" },
  name: { color: "#FFFFFF", fontWeight: "700" },
  nick: { color: "#C7D2FE", fontSize: 12 },
});

export default MessagesPage;
