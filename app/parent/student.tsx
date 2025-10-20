import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/UserContext";
import apiClient from "../utils/apiClient";
import { Logger } from "../utils/logger";
import ParentFooter from "./components/ParentFooter";

interface Student {
  _id: string;
  fullName: string;
  email: string;
  overallRating?: number;
  totalTests?: number;
  lastTestDate?: string;
}

const StudentCard: React.FC<{ student: Student; onPress: () => void }> = ({
  student,
  onPress,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <TouchableOpacity style={styles.studentCard} onPress={onPress}>
      <View style={styles.avatarContainer}>
        <LinearGradient
          colors={["#4a90e2", "#5d9cec"]}
          style={styles.avatarGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.avatarText}>{getInitials(student.fullName)}</Text>
        </LinearGradient>
      </View>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName} numberOfLines={1} ellipsizeMode="tail">
          {student.fullName.charAt(0).toUpperCase() + student.fullName.slice(1)}
        </Text>
        <Text
          style={styles.studentEmail}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {student.email}
        </Text>
      </View>
      <View style={styles.studentStats}>
        {student.overallRating !== undefined && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#f1c40f" />
            <Text style={styles.ratingText}>{student.overallRating}%</Text>
          </View>
        )}
        <View style={styles.testCountContainer}>
          <Ionicons name="document-text" size={14} color="#7f8c8d" />
          <Text style={styles.testCountText}>
            {student.totalTests || 0} tests
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
    </TouchableOpacity>
  );
};

const ParentStudents = () => {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchStudents();
    }
  }, [token]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = students.filter(
        (student) =>
          student.fullName.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query)
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/parent/children");

      // Validate response structure
      const studentsData = Array.isArray(response.data) ? response.data : [];

      // Ensure each student has required fields and sort by lastTestDate descending
      const validatedStudents = studentsData
        .filter(
          (student) =>
            student && student._id && student.fullName && student.email
        )
        .sort((a, b) => {
          const aDate = a.lastTestDate ? new Date(a.lastTestDate).getTime() : 0;
          const bDate = b.lastTestDate ? new Date(b.lastTestDate).getTime() : 0;
          return bDate - aDate; // Descending order (recent first)
        });

      setStudents(validatedStudents);
      setFilteredStudents(validatedStudents);

      Logger.info("✅ Students fetched successfully", {
        count: validatedStudents.length,
      });

      if (validatedStudents.length === 0) {
        Logger.warn("No students found for this parent");
      }
    } catch (error) {
      Logger.error("❌ Error fetching students:", error);
      setStudents([]);
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentPress = (studentId: string) => {
    router.push(`/parent/students/${studentId}`);
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
        <Text style={styles.title}>Students</Text>
        <Text style={styles.subtitle}>Students linked to your account</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#95a5a6"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search students..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#95a5a6"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={styles.clearSearchButton}
          >
            <Ionicons name="close-circle" size={20} color="#95a5a6" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <StudentCard
              key={student._id}
              student={student}
              onPress={() => handleStudentPress(student._id)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people" size={48} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>No students found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? "Try a different search term"
                : "No students are linked to your account yet"}
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
    padding: 20,
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
    fontSize: 14,
    color: "#7f8c8d",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: "#2c3e50",
    fontSize: 15,
  },
  clearSearchButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  studentCard: {
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
  avatarContainer: {
    marginRight: 12,
  },
  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  studentInfo: {
    flex: 1,
    marginRight: 12,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 13,
    color: "#7f8c8d",
  },
  studentStats: {
    alignItems: "flex-end",
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginLeft: 4,
  },
  testCountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  testCountText: {
    fontSize: 12,
    color: "#7f8c8d",
    marginLeft: 4,
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

export default ParentStudents;
