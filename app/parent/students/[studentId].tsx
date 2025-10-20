import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../contexts/UserContext";
import apiClient from "../../utils/apiClient";
import { Logger } from "../../utils/logger";

interface Student {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
  grade?: string;
  school?: string;
  overallRating?: number;
  totalTests?: number;
  averageScore?: number;
  weakAreas?: Array<{
    subject: string;
    score: number;
  }>;
  recentTests?: Array<{
    _id: string;
    course: string;
    subjects?: string[];
    score: number;
    date: string;
    topic: string;
  }>;
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: string;
  color: string;
}> = ({ title, value, icon, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon as any} size={20} color={color} />
    </View>
    <View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  </View>
);

const TestItem: React.FC<{
  test: {
    _id: string;
    course: string;
    subjects?: string[];
    score: number;
    date: string;
    topic: string;
  };
  onPress: (id: string) => void;
}> = ({ test, onPress }) => {
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

  return (
    <TouchableOpacity style={styles.testItem} onPress={() => onPress(test._id)}>
      <View style={styles.testIcon}>
        <Ionicons name="document-text" size={20} color="#4a90e2" />
      </View>
      <View style={styles.testInfo}>
        <Text style={styles.testCourse}>{test.course}</Text>
        <Text style={styles.testTopic} numberOfLines={1}>
          {test.topic}
        </Text>
        <Text style={styles.testDate}>{formatDate(test.date)}</Text>
      </View>
      <View
        style={[
          styles.testScore,
          { backgroundColor: `${getScoreColor(test.score)}15` },
        ]}
      >
        <Text
          style={[styles.testScoreText, { color: getScoreColor(test.score) }]}
        >
          {test.score}%
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const StudentDetail = () => {
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const router = useRouter();
  const { token } = useAuth();

  const fetchStudentDetails = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch real student data from API
      const response = await apiClient.get(`/parent/students/${studentId}`);

      if (response.data) {
        setStudent(response.data);
        Logger.info("✅ Student details fetched successfully", { studentId });
      } else {
        Logger.warn("No student data received");
        setStudent(null);
      }
    } catch (error) {
      Logger.error("❌ Error fetching student details:", error);
      setStudent(null);
    } finally {
      setLoading(false);
    }
  }, [studentId]);
  useEffect(() => {
    if (token && studentId) {
      fetchStudentDetails();
    }
  }, [token, studentId, fetchStudentDetails]);

  const handleTestPress = useCallback(
    (testId: string) => {
      // Handle test press action
      console.log("Test pressed:", testId);
      router.push(`/parent/test/${testId}` as any);
    },
    [router]
  );

  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading || !student) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={["#4a90e2", "#5d9cec"]}
                style={styles.avatarGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.avatarText}>
                  {getInitials(student.fullName)}
                </Text>
              </LinearGradient>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>
                {student.fullName.charAt(0).toUpperCase() +
                  student.fullName.slice(1)}
              </Text>
              <Text style={styles.email}>{student.email}</Text>
              <View style={styles.metaContainer}>
                {student.grade && (
                  <View style={styles.metaItem}>
                    <Ionicons name="school" size={14} color="#7f8c8d" />
                    <Text style={styles.metaText}>{student.overallRating}</Text>
                  </View>
                )}
                {student.school && (
                  <View style={styles.metaItem}>
                    <Ionicons name="business" size={14} color="#7f8c8d" />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {student.school}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            title="Overall Rating"
            value={`${student.overallRating}%`}
            icon="star"
            color="#FFC107"
          />
          <StatCard
            title="Tests Taken"
            value={student.totalTests || 0}
            icon="document-text"
            color="#4CAF50"
          />
          <StatCard
            title="Avg. Score"
            value={`${student.averageScore || 0}%`}
            icon="speedometer"
            color="#2196F3"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Areas of Improvement</Text>
          </View>
          {student.weakAreas && student.weakAreas.length > 0 ? (
            <View style={styles.weakAreasContainer}>
              {student.weakAreas.map((area, index) => (
                <View key={index} style={styles.weakAreaItem}>
                  <Text style={styles.weakAreaSubject} numberOfLines={1}>
                    {area.subject}
                  </Text>
                  <View style={styles.progressContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${area.score}%`,
                          backgroundColor:
                            area.score >= 70
                              ? "#4CAF50"
                              : area.score >= 50
                              ? "#FFC107"
                              : "#F44336",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.weakAreaScore}>{area.score}%</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={32} color="#d1d5db" />
              <Text style={styles.emptyStateText}>
                No weak areas identified yet. Keep up the good work!
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Tests</Text>
            {/* <TouchableOpacity onPress={() => router.push(`/parent/students/${studentId}/tests` as any)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity> */}
          </View>
          {student.recentTests && student.recentTests.length > 0 ? (
            <View style={styles.testsList}>
              {student.recentTests.map((test) => (
                <TestItem
                  key={test._id}
                  test={test}
                  onPress={handleTestPress}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text" size={32} color="#d1d5db" />
              <Text style={styles.emptyStateText}>
                No test history available yet.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 8,
  },
  metaContainer: {
    marginTop: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: "#7f8c8d",
    marginLeft: 6,
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderLeftWidth: 4,
  },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
    color: "#7f8c8d",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
  seeAllText: {
    color: "#4a90e2",
    fontSize: 13,
    fontWeight: "500",
  },
  weakAreasContainer: {
    marginTop: 8,
  },
  weakAreaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  weakAreaSubject: {
    width: 100,
    fontSize: 13,
    color: "#2c3e50",
    marginRight: 12,
  },
  progressContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "#e9ecef",
    borderRadius: 4,
    marginRight: 12,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  weakAreaScore: {
    width: 40,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "600",
    color: "#7f8c8d",
  },
  testsList: {
    marginTop: 8,
  },
  testItem: {
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
  testTopic: {
    fontSize: 12,
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
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    marginTop: 8,
    color: "#95a5a6",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
  },
});

export default StudentDetail;
