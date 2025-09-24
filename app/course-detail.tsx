import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import FooterNavigation from './components/FooterNavigation';
import apiClient from './utils/apiClient';
import { Logger } from './utils/logger';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  isLocked: boolean;
  isCompleted: boolean;
  thumbnail: string;
}

interface ExampleItem {
  question: string;
  solution: string;
}

interface TopicItem {
  title: string;
  explanation: string;
  examples: ExampleItem[];
}

interface Course {
  id: string;
  title: string;
  instructor: string;
  description: string;
  totalLessons: number;
  totalDuration: string;
  lessons: Lesson[];
  subject: string;
  topics?: TopicItem[];
}

const CourseDetailPage = () => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const router = useRouter();
  const { courseId, subject } = useLocalSearchParams();

  useEffect(() => {
    fetchCourseDetail();
  }, [courseId]);

  const fetchCourseDetail = async () => {
    try {
      Logger.info('🔄 Fetching course detail', { courseId, subject });
      // Try API first
      if (courseId && typeof courseId === 'string' && courseId.startsWith('course-') === false) {
        const res = await apiClient.get(`/api/courses/${courseId}`);
        const c = res.data?.course;
        if (c) {
          const normalized: Course = {
            id: c._id,
            title: c.title,
            instructor: c.instructor || 'Expert Instructor',
            description: c.description || '',
            totalLessons: c.totalLessons || (c.lessons?.length || 0),
            totalDuration: c.totalDuration || '—',
            subject: c.subject,
            lessons: (c.lessons || []).map((l: any, idx: number) => ({
              id: String(l._id || idx + 1),
              title: l.title,
              duration: l.duration || '',
              isLocked: Boolean(l.isLocked),
              isCompleted: Boolean(l.isCompleted),
              thumbnail: l.thumbnail || 'intro',
            })),
            topics: c.topics || [],
          };
          setCourse(normalized);
          Logger.info('✅ Course detail fetched from API');
          return;
        }
      }

      // Fallback mock data
      const mockCourse: Course = {
        id: courseId as string || '1',
        title: `${subject} Mastery Course`,
        instructor: 'Expert Instructor',
        description: `This course will teach you the fundamentals of ${subject} from beginning to finish. Master all the essential concepts and techniques.`,
        totalLessons: 12,
        totalDuration: '1hr 20min',
        subject: subject as string || 'Mathematics',
        lessons: [
          { id: '1', title: '00 - Introduction', duration: '1:10min', isLocked: false, isCompleted: true, thumbnail: 'intro' },
          { id: '2', title: '01 - Basic Concepts', duration: '15:10min', isLocked: false, isCompleted: false, thumbnail: 'basics' },
          { id: '3', title: '02 - Advanced Topics', duration: '22:56min', isLocked: true, isCompleted: false, thumbnail: 'advanced' },
          { id: '4', title: '03 - Practice Problems', duration: '22:45min', isLocked: true, isCompleted: false, thumbnail: 'practice' },
          { id: '5', title: '04 - Real-world Applications', duration: '18:30min', isLocked: true, isCompleted: false, thumbnail: 'applications' },
          { id: '6', title: '05 - Final Review', duration: '25:15min', isLocked: true, isCompleted: false, thumbnail: 'review' },
        ],
        topics: [
          { title: 'Foundations', explanation: 'Core concepts overview.', examples: [{ question: 'What is X?', solution: 'X is ...' }] },
          { title: 'Techniques', explanation: 'Key methods explained.', examples: [{ question: 'How to do Y?', solution: 'Follow steps ...' }] },
          { title: 'Applications', explanation: 'Real-world uses.', examples: [{ question: 'When to use Z?', solution: 'Use when ...' }] },
          { title: 'Common Pitfalls', explanation: 'Mistakes to avoid.', examples: [{ question: 'Common mistake?', solution: 'Avoid by ...' }] },
          { title: 'Exam Strategy', explanation: 'Tips and timing.', examples: [{ question: 'Timing tip?', solution: 'Allocate ...' }] },
        ],
      };

      setCourse(mockCourse);
      Logger.info('✅ Course detail fetched successfully');
    } catch (error) {
      Logger.error('💥 Error fetching course detail', error);
    } finally {
      setLoading(false);
    }
  };

  const getThumbnailImage = (thumbnail: string) => {
    // Return placeholder images based on thumbnail type
    const thumbnails = {
      'intro': require('../assets/images/react-logo.png'),
      'basics': require('../assets/images/icon.png'),
      'advanced': require('../assets/images/splash-icon.png'),
      'practice': require('../assets/images/react-logo.png'),
      'applications': require('../assets/images/react-logo.png'),
      'review': require('../assets/images/icon.png'),
    };
    return thumbnails[thumbnail as keyof typeof thumbnails] || require('../assets/images/icon.png');
  };

  const handleLessonPress = (lesson: Lesson, index: number) => {
    if (lesson.isLocked) {
      Logger.info('🔒 Lesson is locked', { lessonId: lesson.id });
      return;
    }
    
    Logger.info('🎬 Starting lesson', { lessonId: lesson.id, title: lesson.title, topicIndex: index });
    router.push({
      pathname: '/study-topic',
      params: {
        courseId: course?.id || (course as any)?._id,
        topicIndex: String(index),
      }
    });
  };

  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
    Logger.info('🔖 Bookmark toggled', { courseId, bookmarked: !bookmarked });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Course</Text>
          <TouchableOpacity style={styles.bookmarkButton} onPress={toggleBookmark}>
            <Ionicons name="bookmark-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <Text style={styles.loadingText}>Loading course...</Text>
        </View>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Course</Text>
          <TouchableOpacity style={styles.bookmarkButton} onPress={toggleBookmark}>
            <Ionicons name="bookmark-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <Text style={styles.loadingText}>Course not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Course</Text>
        <TouchableOpacity style={styles.bookmarkButton} onPress={toggleBookmark}>
          <Ionicons 
            name={bookmarked ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color="#ffffff" 
          />
        </TouchableOpacity>
      </View>

      {/* Course Illustration Background */}
      <View style={styles.illustrationBackground}>
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.instructorName}>by {course.instructor}</Text>
        </View>
      </View>

      {/* Main Content Card */}
      <ScrollView style={styles.contentCard} showsVerticalScrollIndicator={false}>
        {/* Course Summary */}
        <View style={styles.courseSummary}>
          <Text style={styles.lessonCount}>{course.lessons?.length || course.totalLessons} Lessons</Text>
          <View style={styles.durationContainer}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.duration}>{course.totalDuration}</Text>
          </View>
        </View>

        {/* Course Description */}
        <Text style={styles.description}>{course.description}</Text>

        {/* Lessons List */}
        <View style={styles.lessonsContainer}>
          {course.lessons.map((lesson, index) => (
            <TouchableOpacity
              key={lesson.id}
              style={styles.lessonItem}
                onPress={() => handleLessonPress(lesson, index)}
            >
              <View style={styles.lessonThumbnail}>
                <Image 
                  source={getThumbnailImage(lesson.thumbnail)} 
                  style={styles.thumbnailImage}
                />
                <View style={styles.playButton}>
                  <Ionicons 
                    name={lesson.isLocked ? "lock-closed" : "play"} 
                    size={16} 
                    color="#ffffff" 
                  />
                </View>
              </View>
              
              <View style={styles.lessonInfo}>
                <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                <Text style={[
                  styles.lessonTitle,
                  lesson.isLocked && styles.lockedLessonTitle
                ]}>
                  {lesson.title}
                </Text>
                {lesson.isCompleted && (
                  <View style={styles.progressBar}>
                    <View style={styles.progressFill} />
                  </View>
                )}
              </View>

              {lesson.isLocked && (
                <View style={styles.lockIcon}>
                  <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom spacing for footer */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <FooterNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B4B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1B4B',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  bookmarkButton: {
    padding: 8,
  },
  illustrationBackground: {
    height: 140,
    backgroundColor: '#1E1B4B',
    paddingHorizontal: 20,
    paddingBottom: 12,
    justifyContent: 'flex-end',
  },
  courseInfo: {
    alignItems: 'flex-start',
  },
  courseTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 34,
  },
  instructorName: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -8,
    paddingTop: 24,
  },
  courseSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  lessonCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  lessonsContainer: {
    paddingHorizontal: 20,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  lessonThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  thumbnailImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  playButton: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonDuration: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  lockedLessonTitle: {
    color: '#9CA3AF',
  },
  progressBar: {
    height: 2,
    backgroundColor: '#E5E7EB',
    borderRadius: 1,
    marginTop: 4,
  },
  progressFill: {
    height: 2,
    backgroundColor: '#10B981',
    borderRadius: 1,
    width: '100%',
  },
  lockIcon: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  bottomSpacing: {
    height: 80,
  },
});

export default CourseDetailPage;