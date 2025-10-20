import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/UserContext";
import apiClient from "../utils/apiClient";
import { Logger } from "../utils/logger";

import ParentFooter from "./components/ParentFooter";

interface Test {
  _id: string;
  course: string;
  score: number;
  date: string;
  studentName: string;
  topic?: string;
}

const TestsPage = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tests, setTests] = useState<Test[]>([]);
  const router = useRouter();
  const { token } = useAuth();

  const fetchAllTests = useCallback(async () => {
    if (!token) {
      Logger.error("No authentication token found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch all recent tests for the parent
      const response = await apiClient.get("/parent/recent-tests");

      if (response.data && Array.isArray(response.data)) {
        setTests(response.data);
        Logger.info("✅ All tests fetched successfully", {
          count: response.data.length,
        });
      } else {
        Logger.warn("No tests data received or invalid format");
        setTests([]);
      }
    } catch (error) {
      Logger.error("❌ Error fetching all tests:", error);

      // Fallback to mock data if API fails
      setTests([
        {
          _id: "1",
          course: "Mathematics",
          score: 85,
          date: new Date().toISOString(),
          studentName: "John Doe",
          topic: "Algebra Basics",
        },
        {
          _id: "2",
          course: "Science",
          score: 72,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          studentName: "Jane Smith",
          topic: "Chemical Reactions",
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchAllTests();
    }
  }, [token, fetchAllTests]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllTests();
  }, [fetchAllTests]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#4CAF50";
    if (score >= 60) return "#FFC107";
    return "#F44336";
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.title}>All Tests</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {tests.length > 0 ? (
          tests.map((test) => (
            <TouchableOpacity
              key={test._id}
              style={styles.testItem}
              onPress={() => router.push(`/parent/test/${test._id}` as any)}
            >
              <View style={styles.testIcon}>
                <Ionicons name="document-text" size={20} color="#4a90e2" />
              </View>
              <View style={styles.testInfo}>
                <Text style={styles.testCourse}>{test.course}</Text>
                <Text style={styles.testStudent}>{test.studentName}</Text>
                <Text style={styles.testDate}>{formatDate(test.date)}</Text>
              </View>
              <View
                style={[
                  styles.testScore,
                  { backgroundColor: `${getScoreColor(test.score)}15` },
                ]}
              >
                <Text
                  style={[
                    styles.testScoreText,
                    { color: getScoreColor(test.score) },
                  ]}
                >
                  {test.score}%
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text" size={48} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>No tests found</Text>
            <Text style={styles.emptyStateText}>
              No test history available yet.
            </Text>
          </View>
        )}

        {/* Spacer for footer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      <ParentFooter />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  testItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  testIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#e8f0fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  testInfo: {
    flex: 1,
    marginRight: 12,
  },
  testCourse: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 2,
  },
  testStudent: {
    fontSize: 13,
    color: "#7f8c8d",
    marginBottom: 2,
  },
  testDate: {
    fontSize: 11,
    color: "#bdc3c7",
  },
  testScore: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  testScoreText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  emptyState: {
    marginTop: 48,
    alignItems: "center",
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#95a5a6",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default TestsPage;
