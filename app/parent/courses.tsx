import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/UserContext';
import apiClient from '../utils/apiClient';
import { Logger } from '../utils/logger';
import ParentFooter from './components/ParentFooter';

interface Course {
  _id: string;
  name: string;
  subjects?: string[];
  code?: string;
  description?: string;
  totalTests: number;
  averageScore?: number;
  lastTestDate?: string;
  studentCount: number;
}

const CourseCard: React.FC<{ course: Course; onPress: () => void }> = ({ course, onPress }) => {
  const getRandomGradient = () => {
    const gradients = [
      ['#4a90e2', '#5d9cec'],
      ['#37bc9b', '#48cfad'],
      ['#f6bb42', '#ffce54'],
      ['#e9573f', '#fc6e51'],
      ['#8cc152', '#a0d468'],
      ['#3bafda', '#4fc1e9'],
      ['#967adc', '#ac92ec'],
      ['#d770ad', '#ec87c0'],
    ] as const;
    return gradients[course.name.length % gradients.length];
  };

  const getCourseDisplayName = () => {
    if (course.subjects && course.subjects.length > 0) {
      return course.subjects.join(' + ');
    }
    return course.name;
  };

  const getCourseIconText = () => {
    if (course.subjects && course.subjects.length > 0) {
      return course.subjects[0].charAt(0).toUpperCase();
    }
    return course.name.charAt(0).toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No tests yet';

    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const [gradientColors] = useState(getRandomGradient());

  return (
    <TouchableOpacity style={styles.courseCard} onPress={onPress}>
      <LinearGradient
        colors={gradientColors}
        style={styles.courseIcon}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.courseIconText}>{getCourseIconText()}</Text>
      </LinearGradient>

      <View style={styles.courseInfo}>
        <Text style={styles.courseName} numberOfLines={1}>
          {getCourseDisplayName()}
        </Text>
        {course.code && (
          <Text style={styles.courseCode} numberOfLines={1}>
            {course.code}
          </Text>
        )}

        <View style={styles.courseStats}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={14} color="#7f8c8d" />
            <Text style={styles.statText}>{course.studentCount}</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="document-text" size={14} color="#7f8c8d" />
            <Text style={styles.statText}>{course.totalTests} tests</Text>
          </View>

          {course.averageScore !== undefined && (
            <View style={styles.statItem}>
              <Ionicons name="stats-chart" size={14} color="#7f8c8d" />
              <Text style={styles.statText}>{course.averageScore}% avg</Text>
            </View>
          )}
        </View>

        {course.lastTestDate && (
          <Text style={styles.lastTestDate}>
            Last test: {formatDate(course.lastTestDate)}
          </Text>
        )}
      </View>

      <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
    </TouchableOpacity>
  );
};

const ParentCourses = () => {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchCourses();
    }
  }, [token]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = courses.filter(
        (course) => {
          // Search in course name
          const nameMatch = course.name.toLowerCase().includes(query);

          // Search in subjects array
          const subjectsMatch = course.subjects?.some(subject =>
            subject.toLowerCase().includes(query)
          ) || false;

          // Search in course code
          const codeMatch = course.code?.toLowerCase().includes(query) || false;

          return nameMatch || subjectsMatch || codeMatch;
        }
      );
      setFilteredCourses(filtered);
    }
  }, [searchQuery, courses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/parent/courses');

      setCourses(response.data);
      setFilteredCourses(response.data);
      setLoading(false);

    } catch (error) {
      Logger.error('Error fetching courses:', error);
      setLoading(false);
      // For now, fall back to mock data if API fails
      setTimeout(() => {
        const mockCourses: Course[] = [
          {
            _id: '1',
            name: 'Mathematics',
            code: 'MATH101',
            description: 'Introduction to advanced mathematics',
            totalTests: 24,
            averageScore: 78,
            lastTestDate: '2023-10-05T14:30:00Z',
            studentCount: 2,
          },
          {
            _id: '2',
            name: 'Science',
            code: 'SCI201',
            description: 'Fundamentals of physics, chemistry, and biology',
            totalTests: 18,
            averageScore: 82,
            lastTestDate: '2023-10-03T10:15:00Z',
            studentCount: 2,
          },
          {
            _id: '3',
            name: 'English Literature',
            code: 'ENG301',
            description: 'Classic and contemporary literature analysis',
            totalTests: 15,
            averageScore: 85,
            lastTestDate: '2023-09-28T11:20:00Z',
            studentCount: 1,
          },
          {
            _id: '4',
            name: 'Computer Science',
            code: 'CS401',
            description: 'Introduction to programming and algorithms',
            totalTests: 20,
            averageScore: 88,
            lastTestDate: '2023-10-01T09:45:00Z',
            studentCount: 1,
          },
          {
            _id: '5',
            name: 'History',
            code: 'HIST202',
            description: 'World history from ancient to modern times',
            totalTests: 12,
            averageScore: 75,
            lastTestDate: '2023-09-25T13:10:00Z',
            studentCount: 1,
          },
        ];

        setCourses(mockCourses);
        setFilteredCourses(mockCourses);
        setLoading(false);
      }, 800);
    }
  };

  const handleCoursePress = (course: Course) => {
    console.log('Courses - navigating to course:', course.name);
    router.push(`/parent/courses/${encodeURIComponent(course.name)}`);
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
        <Text style={styles.title}>Courses</Text>
        <Text style={styles.subtitle}>View your children's courses and performance</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#95a5a6" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#95a5a6"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
            <Ionicons name="close-circle" size={20} color="#95a5a6" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {filteredCourses.length > 0 ? (
          <View style={styles.coursesList}>
            {filteredCourses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onPress={() => handleCoursePress(course)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="book" size={48} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>No courses found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? 'No courses match your search. Try a different term.'
                : 'No courses are available at the moment.'}
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
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
    shadowColor: '#000',
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
    color: '#2c3e50',
    fontSize: 15,
  },
  clearSearchButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  coursesList: {
    paddingBottom: 16,
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  courseIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  courseIconText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  courseInfo: {
    flex: 1,
    marginRight: 12,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  courseCode: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  courseStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  statText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 4,
  },
  lastTestDate: {
    fontSize: 11,
    color: '#bdc3c7',
    marginTop: 4,
  },
  emptyState: {
    marginTop: 48,
    alignItems: 'center',
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ParentCourses;