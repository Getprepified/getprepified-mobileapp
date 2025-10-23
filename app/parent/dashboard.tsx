import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/UserContext";
import apiClient from "../utils/apiClient";
import { Logger } from "../utils/logger";
import ParentFooter from "./components/ParentFooter";

// Define types for better type safety
type IconName = keyof typeof Ionicons.glyphMap;

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: IconName;
  colors: readonly [string, string, ...string[]];
}

interface RecentTest {
  _id: string;
  course: string;
  subjects?: string[];
  score: number;
  date: string;
  studentName: string;
  topic?: string;
  difficulty?: string;
}

interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  averageScore: number;
  testsThisMonth: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  colors,
}) => (
  <View style={styles.statsCard}>
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.statsGradient}
    >
      <Ionicons name={icon} size={24} color="white" />
    </LinearGradient>
    <View style={styles.statsTextContainer}>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsLabel}>{title}</Text>
    </View>
  </View>
);

const ParentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalCourses: 0,
    averageScore: 0,
    testsThisMonth: 0,
  });
  const [recentTests, setRecentTests] = useState<RecentTest[]>([]);
  const router = useRouter();
  const { user, token } = useAuth();

  const fetchDashboardData = useCallback(async () => {
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const [statsRes, testsRes] = await Promise.all([
        apiClient.get("/parent/dashboard/stats"),
        apiClient.get("/parent/recent-tests"),
      ]);

      setStats(statsRes.data);
      setRecentTests(testsRes.data.slice(0, 4)); // Show only 4 most recent tests
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch dashboard data";
      Logger.error("Error fetching dashboard data:", errorMessage);
      setError(errorMessage);

      // For now, fall back to mock data if API fails
      setStats({
        totalStudents: 2,
        totalCourses: 5,
        averageScore: 78,
        testsThisMonth: 12,
      });

      setRecentTests([
        {
          _id: "1",
          course: "Mathematics",
          score: 85,
          date: new Date().toISOString(),
          studentName: "John Doe",
        },
        {
          _id: "2",
          course: "Science",
          score: 72,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          studentName: "Jane Smith",
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Parent Dashboard</Text>
          <Text style={styles.subtitle}>
            Welcome back, {user?.fullName?.split(" ")[0] || "Parent"}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <StatsCard
            title="Students"
            value={stats.totalStudents}
            icon="people"
            colors={["#4a90e2", "#5d9cec"]}
          />
          <StatsCard
            title="Courses"
            value={stats.totalCourses}
            icon="book"
            colors={["#37bc9b", "#48cfad"]}
          />
          <StatsCard
            title="Avg. Score"
            value={`${stats.averageScore}%`}
            icon="speedometer"
            colors={["#f6bb42", "#ffce54"]}
          />
          <StatsCard
            title="Tests This Month"
            value={stats.testsThisMonth}
            icon="calendar"
            colors={["#ed5565", "#fc6e51"]}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Tests</Text>
            <TouchableOpacity
              onPress={() => router.push("/parent/tests" as any)}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentTests.length > 0 ? (
            recentTests.map((test) => (
              <TouchableOpacity
                key={test._id}
                style={styles.testCard}
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
                    {
                      backgroundColor: test.score >= 70 ? "#e8f5e9" : "#ffebee",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.testScoreText,
                      { color: test.score >= 70 ? "#4caf50" : "#f44336" },
                    ]}
                  >
                    {test.score}%
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text" size={40} color="#d1d5db" />
              <Text style={styles.emptyStateText}>No recent tests found</Text>
            </View>
          )}
        </View>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    marginTop: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  statsCard: {
    flex: 1,
    minWidth: 140,
    margin: 4,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  statsGradient: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statsTextContainer: {
    flex: 1,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 2,
  },
  statsLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  section: {
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  seeAllText: {
    color: "#4a90e2",
    fontSize: 14,
    fontWeight: "500",
  },
  testCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  testIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#e8f0fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  testInfo: {
    flex: 1,
  },
  testCourse: {
    fontSize: 15,
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
    fontSize: 12,
    color: "#95a5a6",
  },
  testScore: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  testScoreText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    marginTop: 8,
    color: "#95a5a6",
    textAlign: "center",
  },
});

export default ParentDashboard;
