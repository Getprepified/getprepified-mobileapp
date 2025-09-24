import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import apiClient from "./utils/apiClient";
import { Logger } from "./utils/logger";
import { useAuth } from "./contexts/UserContext";

const PreExamPage = () => {
  const { subject, combined, subjects } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuth();
  const [creating, setCreating] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const questionCount = 100;
  const timeLimitMinutes = 100; // 1 min per question default
  const subjectList = subjects
    ? String(subjects)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [String(subject || "Mathematics")];

  const startExam = async () => {
    if (!token) return;
    try {
      setCreating(true);
      const headers = { Authorization: `Bearer ${token}` };
      const res =
        subjectList.length > 1
          ? await apiClient.post(
              "/api/tests/generate",
              {
                subjects: subjectList,
                perSubject: Math.floor(questionCount / subjectList.length),
                examType: "JAMB",
              },
              { headers }
            )
          : await apiClient.post(
              "/api/tests/generate-single",
              {
                subject: subjectList[0],
                count: questionCount,
                examType: "JAMB",
              },
              { headers }
            );
      const testId = res.data?._id || res.data?.id || res.data?.testId;
      Logger.info("🧪 Test generated", { testId });
      setCountdown(10);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev !== null && prev <= 1) {
            clearInterval(timer);
            router.replace({
              pathname: "/take-exam",
              params: { testId, duration: String(timeLimitMinutes) },
            });
            return null;
          }
          return (prev || 10) - 1;
        });
      }, 1000);
    } catch (e) {
      Logger.error("💥 Failed to start exam", e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pre-Exam Brief</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Stay Calm. You got this.</Text>
            <Text style={styles.heroSubtitle}>
              Answer confidently, manage your time, and do your best.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Exam Overview</Text>
            <Text style={styles.item}>
              <Text style={styles.itemLabel}>Subjects:</Text>{" "}
              {subjectList.join(", ")}
            </Text>
            <Text style={styles.item}>
              <Text style={styles.itemLabel}>Questions:</Text> {questionCount}
            </Text>
            <Text style={styles.item}>
              <Text style={styles.itemLabel}>Time Limit:</Text>{" "}
              {timeLimitMinutes} minutes
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Rules & Guidelines</Text>
            <Text style={styles.bullet}>
              • Attempt all questions. You can skip and return later.
            </Text>
            <Text style={styles.bullet}>
              • Use the timer at the top to pace yourself.
            </Text>
            <Text style={styles.bullet}>
              • Avoid distractions; focus one question at a time.
            </Text>
            <Text style={styles.bullet}>
              • When time ends, your answers are auto-submitted.
            </Text>
            <Text style={styles.bullet}>
              • Explanations are provided for learning after submission.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Tips to Succeed</Text>
            <Text style={styles.tip}>
              - Start with easier questions to build momentum.
            </Text>
            <Text style={styles.tip}>
              - If stuck, skip and come back—don’t burn time.
            </Text>
            <Text style={styles.tip}>
              - Double-check flagged questions if time permits.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.startBtn}
            onPress={startExam}
            disabled={creating}
          >
            <Text style={styles.startBtnText}>
              {creating ? "Preparing..." : "Start Exam"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>

      <Modal transparent visible={countdown !== null} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Get Ready</Text>
            <Text style={styles.modalCountdown}>{countdown ?? 0}</Text>
            <Text style={styles.modalSubtitle}>
              Your exam will start automatically
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111827" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#111827",
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  backButton: { padding: 8 },
  headerTitle: { color: "#ffffff", fontSize: 18, fontWeight: "bold" },
  content: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  hero: {
    backgroundColor: "#1E1B4B",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  heroSubtitle: { color: "#E5E7EB", fontSize: 13 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  title: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 8 },
  item: { fontSize: 14, color: "#374151", marginTop: 6 },
  itemLabel: { fontWeight: "700", color: "#111827" },
  bullet: { fontSize: 14, color: "#374151", marginTop: 6 },
  tip: { fontSize: 13, color: "#6B7280", marginTop: 6, lineHeight: 18 },
  startBtn: {
    marginTop: 16,
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  startBtnText: { color: "#ffffff", fontWeight: "700", fontSize: 16 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "80%",
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { color: "#E5E7EB", fontSize: 16, marginBottom: 8 },
  modalCountdown: { color: "#ffffff", fontSize: 48, fontWeight: "800" },
  modalSubtitle: { color: "#9CA3AF", marginTop: 8 },
});

export default PreExamPage;
