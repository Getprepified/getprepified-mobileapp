import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import apiClient from "./utils/apiClient";
import { useAuth } from "./contexts/UserContext";

interface StreakItem {
  _id: string;
  fromUserId: string;
  toUserId: string;
  testId: string;
  resultId: string;
  createdAt: string;
}

const DMPage = () => {
  const { friendId, friendName } = useLocalSearchParams();
  const { token } = useAuth();
  const router = useRouter();
  const [streaks, setStreaks] = useState<StreakItem[]>([]);
  const [sending, setSending] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sendable, setSendable] = useState<any[]>([]);
  const [resultMeta, setResultMeta] = useState<
    Record<string, { score: number }>
  >({});

  const load = async () => {
    if (!token) return;
    const res = await apiClient.get(`/api/streaks/with/${friendId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setStreaks(res.data || []);
  };

  useEffect(() => {
    load();
  }, [token, friendId]);

  // Fetch lightweight result meta (score) for display
  useEffect(() => {
    (async () => {
      try {
        if (!token || !streaks || streaks.length === 0) return;
        const metas: Record<string, { score: number }> = {};
        // Fetch up to first 10 for performance
        const picks = streaks.slice(0, 10);
        await Promise.all(
          picks.map(async (s) => {
            try {
              const res = await apiClient.get(
                `/api/tests/${s.testId}/results/${s.resultId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              metas[s.resultId] = { score: Number(res.data?.score || 0) };
            } catch {}
          })
        );
        setResultMeta(metas);
      } catch {}
    })();
  }, [streaks, token]);

  const openPicker = async () => {
    if (!token) return;
    const res = await apiClient.get(`/api/streaks/sendable/${friendId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSendable(res.data || []);
    setPickerOpen(true);
  };

  const sendStreak = async (resultId?: string) => {
    try {
      setSending(true);
      await apiClient.post(
        "/api/streaks/send",
        { toUserId: friendId, resultId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await load();
      setPickerOpen(false);
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }: { item: StreakItem }) => {
    const meta = resultMeta[item.resultId];
    const isReceived = String(item.fromUserId) !== String(friendId); // if friend sent to me
    const badgeColor = isReceived ? "#DBEAFE" : "#ECFDF5";
    const badgeTextColor = isReceived ? "#1D4ED8" : "#065F46";
    const score = meta?.score;
    const scoreColor =
      score !== undefined
        ? score >= 70
          ? "#22C55E"
          : score >= 40
            ? "#F59E0B"
            : "#EF4444"
        : "#9CA3AF";
    return (
      <TouchableOpacity
        style={styles.msgItem}
        onPress={() =>
          router.push({
            pathname: "/test-result",
            params: {
              testId: item.testId,
              resultId: item.resultId,
              viewMode: isReceived ? "summary" : "full",
            },
          })
        }
      >
        <View style={styles.msgHeader}>
          <Text
            style={[
              styles.msgBadge,
              { backgroundColor: badgeColor, color: badgeTextColor },
            ]}
          >
            {isReceived ? "Received" : "Sent"}
          </Text>
          <Text style={styles.msgTime}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.msgText}>
            Test • {String(item.testId).slice(-6)}
          </Text>
          <View style={[styles.miniCircle, { backgroundColor: scoreColor }]}>
            <Text style={styles.miniCircleText}>
              {score !== undefined ? `${score}%` : "--"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{friendName || "Direct Message"}</Text>
        <Text style={styles.subtitle}>
          Share streaks from your recent tests
        </Text>
      </View>
      <FlatList
        data={streaks}
        renderItem={renderItem}
        keyExtractor={(i) => i._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      />
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.streakBtn, sending && { opacity: 0.6 }]}
          onPress={openPicker}
          disabled={sending}
        >
          <Text style={styles.streakText}>
            {sending ? "Sending..." : "Streak"}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent
        visible={pickerOpen}
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select a result to send</Text>
            <FlatList
              data={sendable}
              keyExtractor={(i) => i.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultCard}
                  onPress={() => sendStreak(item.id)}
                >
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultBadge}>Result</Text>
                    <Text style={styles.resultTime}>
                      {new Date(item.createdAt).toLocaleString()}
                    </Text>
                  </View>
                  <Text style={styles.resultText}>Score: {item.score}%</Text>
                  <Text style={styles.resultSub}>
                    Test ID • {String(item.testId).slice(-6)}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No results available to send
                </Text>
              }
            />
            <TouchableOpacity
              style={[styles.streakBtn, { marginTop: 10 }]}
              onPress={() => setPickerOpen(false)}
            >
              <Text style={styles.streakText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  title: { fontSize: 18, fontWeight: "800", color: "#111827" },
  subtitle: { color: "#6B7280", marginTop: 4 },
  msgItem: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  msgHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  msgBadge: {
    backgroundColor: "#EEF2FF",
    color: "#4F46E5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    fontWeight: "700",
  },
  msgTime: { color: "#6B7280", fontSize: 12 },
  msgText: { color: "#111827", fontWeight: "600" },
  miniCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  miniCircleText: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },
  streakBtn: {
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
  },
  streakText: { color: "#ffffff", fontWeight: "800" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "90%",
    maxHeight: "70%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  resultCard: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  resultBadge: {
    backgroundColor: "#ECFDF5",
    color: "#065F46",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    fontWeight: "700",
  },
  resultTime: { color: "#6B7280", fontSize: 12 },
  resultText: { color: "#111827", fontWeight: "700" },
  resultSub: { color: "#6B7280", fontSize: 12 },
  emptyText: { color: "#6B7280", textAlign: "center", marginTop: 20 },
});

export default DMPage;
