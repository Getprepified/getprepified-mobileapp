import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import apiClient from './utils/apiClient';
import FooterNavigation from './components/FooterNavigation';
import { useAuth } from './contexts/UserContext';
import { Logger } from './utils/logger';

const API_URL = 'http://localhost:4000';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface WeakArea {
  subject: string;
  topic: string;
  incorrectCount: number;
}

interface WeeklyPlanItem {
  day: string;
  items: Array<{
    subject: string;
    topic: string;
    focus: string;
  }>;
}

const DashboardPage = () => {
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [coursesOfWeek, setCoursesOfWeek] = useState<any[]>([]);
  const router = useRouter();
  const { user, token, fetchUserData, logout } = useAuth();

  useEffect(() => {
    if (user && token) {
      fetchDashboardData();
    } else if (!token) {
      // No token, redirect to login
      Logger.warn('⚠️ No authentication token found, redirecting to login');
      router.replace('/login');
    }
  }, [user, token]);

  const fetchDashboardData = async () => {
    if (!token) {
      Logger.warn('⚠️ No token available for fetching dashboard data');
      setLoading(false);
      return;
    }

    try {
      Logger.info('🔄 Fetching dashboard data for user', { userId: user?._id });
      
      // Fetch weak areas, weekly plan and courses of the week in parallel
      const [weakAreasRes, weeklyPlanRes, coursesWeekRes] = await Promise.all([
        apiClient.get('/api/tests/weak-areas', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch((error) => {
          Logger.logError('GET', '/api/tests/weak-areas', error);
          return { data: [] }; // Fallback to empty array if API fails
        }),
        
        apiClient.get('/api/tests/me/weekly-plan', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch((error) => {
          Logger.logError('GET', '/api/tests/me/weekly-plan', error);
          return { data: { plan: [], suggestionsCount: 0 } };
        }),

        apiClient.get(`/api/courses/of-the-week`, {
          headers: { Authorization: `Bearer ${token}` }
        , params: user?._id ? { userId: user?._id } : undefined }).catch((error) => {
          Logger.logError('GET', '/api/courses/of-the-week', error);
          return { data: { courses: [] } };
        })
      ]);

      setWeakAreas(weakAreasRes.data || []);
      setWeeklyPlan(weeklyPlanRes.data.plan || []);
      setCoursesOfWeek(coursesWeekRes.data.courses || []);
      
      Logger.info('✅ Dashboard data fetched successfully', {
        weakAreasCount: weakAreasRes.data?.length || 0,
        weeklyPlanCount: weeklyPlanRes.data.plan?.length || 0
      });
    } catch (error) {
      Logger.error('💥 Error fetching dashboard data', error);
      
      // Set mock data for development/fallback
      setWeakAreas([
        { subject: 'Mathematics', topic: 'Algebra', incorrectCount: 8 },
        { subject: 'English', topic: 'Grammar', incorrectCount: 5 },
        { subject: 'Physics', topic: 'Mechanics', incorrectCount: 6 }
      ]);
      setWeeklyPlan([
        { day: 'Mon', items: [{ subject: 'Mathematics', topic: 'Algebra', focus: 'revise + 5 practice questions' }] },
        { day: 'Tue', items: [{ subject: 'English', topic: 'Grammar', focus: 'revise + 5 practice questions' }] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectImage = (subject: string) => {
    // Return placeholder images based on subject
    const subjectImages = {
      'Mathematics': require('../assets/images/icon.png'),
      'English': require('../assets/images/react-logo.png'),
      'Physics': require('../assets/images/splash-icon.png'),
      'Chemistry': require('../assets/images/react-logo.png'),
      'Biology': require('../assets/images/react-logo.png'),
    };
    return subjectImages[subject as keyof typeof subjectImages] || require('../assets/images/icon.png');
  };

  const getFeaturedCourse = () => {
    if (weakAreas.length > 0) {
      const topWeakArea = weakAreas[0];
      return {
        title: `${topWeakArea.subject} Mastery Course`,
        instructor: 'Expert Instructor',
        subject: topWeakArea.subject,
        image: getSubjectImage(topWeakArea.subject)
      };
    }
    return {
      title: '3D Illustration Course',
      instructor: 'Leo Nikuma',
      subject: 'Design',
      image: require('../assets/images/react-logo.png')
    };
  };

  const getCourseOfTheWeek = () => {
    if (coursesOfWeek.length > 0) {
      const first = coursesOfWeek[0];
      return {
        title: first.title,
        duration: first.totalDuration || '—',
        rating: 4,
        subject: first.subject,
        image: getSubjectImage(first.subject),
        courseId: first._id,
        hasContent: true
      };
    }
    if (weakAreas.length > 0) {
      const topWeakArea = weakAreas[0];
      return {
        title: `${topWeakArea.subject} Study Session`,
        duration: '1hr 20min',
        rating: 4,
        subject: topWeakArea.subject,
        image: getSubjectImage(topWeakArea.subject),
        courseId: `course-${topWeakArea.subject.toLowerCase()}`,
        hasContent: topWeakArea.incorrectCount > 0
      };
    }
    return {
      title: 'Mathematics Study Session',
      duration: '1hr 20min',
      rating: 4,
      subject: 'Mathematics',
      image: require('../assets/images/icon.png'),
      courseId: 'course-mathematics',
      hasContent: false
    };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const featuredCourse = getFeaturedCourse();
  const courseOfTheWeek = getCourseOfTheWeek();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>Hello, Welcome 👋</Text>
            <Text style={styles.userName}>{user?.fullName || 'Student'}</Text>
          </View>
          <View style={styles.profileContainer}>
            <View style={styles.profileImage}>
              <Text style={styles.profileInitial}>
                {(user?.fullName || 'S').charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Main CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Get Your</Text>
          <Text style={styles.ctaSubtitle}>Best Course Today!</Text>
        </View>

        {/* Featured Course Card */}
        <TouchableOpacity style={styles.featuredCard}>
          <View style={styles.featuredCardContent}>
            <Image source={featuredCourse.image} style={styles.featuredCourseImage} />
            <View style={styles.playButton}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
          </View>
          <View style={styles.featuredCardOverlay}>
            <Text style={styles.featuredCourseTitle}>{featuredCourse.title}</Text>
            <Text style={styles.featuredCourseInstructor}>By {featuredCourse.instructor}</Text>
          </View>
          <TouchableOpacity style={styles.bookmarkButton}>
            <Ionicons name="bookmark-outline" size={16} color="#ffffff" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Course of The Week Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Course of The Week</Text>
        </View>

        {weakAreas.length > 0 || weeklyPlan.length > 0 ? (
          <TouchableOpacity 
            style={styles.courseCard}
            onPress={() => router.push({
              pathname: '/course-detail',
              params: {
                courseId: courseOfTheWeek.courseId,
                subject: courseOfTheWeek.subject
              }
            })}
          >
            <Image source={courseOfTheWeek.image} style={styles.courseThumbnail} />
            <View style={styles.courseInfo}>
              <Text style={styles.courseTitle}>{courseOfTheWeek.title}</Text>
              <Text style={styles.courseDuration}>Duration: {courseOfTheWeek.duration}</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Text key={star} style={[
                    styles.star,
                    star <= courseOfTheWeek.rating ? styles.starFilled : styles.starEmpty
                  ]}>
                    ⭐
                  </Text>
                ))}
              </View>
            </View>
            <TouchableOpacity style={styles.arrowButton}>
              <Ionicons name="chevron-forward" size={16} color="#6B7280" />
            </TouchableOpacity>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="library-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No Courses Available</Text>
            <Text style={styles.emptyStateSubtitle}>
              Complete some practice tests to see personalized course recommendations.
            </Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => router.push('/courses')}
            >
              <Text style={styles.exploreButtonText}>Explore All Courses</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom spacing for footer */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
      
      {/* Footer Navigation */}
      <FooterNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontSize: 18,
    color: '#666666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  profileContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EC4899',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  ctaSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  featuredCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    height: 200,
    borderRadius: 16,
    backgroundColor: '#1E1B4B',
    position: 'relative',
    overflow: 'hidden',
  },
  featuredCardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  featuredCourseImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 20,
    color: '#1E1B4B',
    marginLeft: 3,
  },
  featuredCardOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  featuredCourseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  featuredCourseInstructor: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  courseThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  courseDuration: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 16,
    marginRight: 2,
  },
  starFilled: {
    color: '#FCD34D',
  },
  starEmpty: {
    color: '#D1D5DB',
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpacing: {
    height: 80, // Space for footer
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DashboardPage;