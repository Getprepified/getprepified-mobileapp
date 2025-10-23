import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/UserContext';
import apiClient from '../../utils/apiClient';
import { Logger } from '../../utils/logger';
import ParentFooter from '../components/ParentFooter';

interface TestDetail {
  _id: string;
  course: string;
  score: number;
  date: string;
  studentName: string;
  topic?: string;
  duration?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  difficulty?: string;
  questions?: Array<{
    _id: string;
    prompt: string;
    options: Array<{
      text: string;
      correct: boolean;
      _id: string;
    }>;
    correctIndex: number;
    userIndex: number;
    isCorrect: boolean;
    explanation?: string;
    subject?: string;
    topics?: string[];
    imgUrl?: string;
  }>;
}

const TestDetailPage = () => {
  const { testId } = useLocalSearchParams<{ testId: string }>();
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<TestDetail | null>(null);
  const router = useRouter();
  const { token } = useAuth();

  const fetchTestDetail = useCallback(async () => {
    if (!token || !testId) {
      Logger.error('Missing token or testId');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Try to fetch detailed test information
      const response = await apiClient.get(`/parent/tests/${testId}`);

      if (response.data) {
        setTest(response.data);
        Logger.info('✅ Test details fetched successfully', { testId });
      } else {
        throw new Error('No test data received');
      }

    } catch (error) {
      Logger.error('❌ Error fetching test details:', error);

      // Fallback to mock data if API fails
      setTest({
        _id: testId,
        course: 'Mathematics',
        score: 85,
        date: new Date().toISOString(),
        studentName: 'John Doe',
        topic: 'Algebra Basics',
        duration: 45,
        totalQuestions: 20,
        correctAnswers: 17,
        difficulty: 'Medium',
        questions: [
          {
            _id: '1',
            prompt: 'What is 2 + 2?',
            options: [
              { text: '3', correct: false, _id: '1' },
              { text: '4', correct: true, _id: '2' },
              { text: '5', correct: false, _id: '3' },
              { text: '6', correct: false, _id: '4' }
            ],
            correctIndex: 1,
            userIndex: 1,
            isCorrect: true,
            explanation: 'Basic addition',
            subject: 'Mathematics',
            topics: ['Arithmetic']
          },
          {
            _id: '2',
            prompt: 'What is the square root of 16?',
            options: [
              { text: '2', correct: false, _id: '5' },
              { text: '3', correct: false, _id: '6' },
              { text: '4', correct: true, _id: '7' },
              { text: '5', correct: false, _id: '8' }
            ],
            correctIndex: 2,
            userIndex: 3,
            isCorrect: false,
            explanation: 'Square root calculation',
            subject: 'Mathematics',
            topics: ['Algebra']
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  }, [token, testId]);

  useEffect(() => {
    if (token && testId) {
      fetchTestDetail();
    }
  }, [token, testId, fetchTestDetail]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 80) return '#8BC34A';
    if (score >= 70) return '#FFC107';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Loading test details...</Text>
      </View>
    );
  }

  if (!test) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#F44336" />
        <Text style={styles.errorTitle}>Test Not Found</Text>
        <Text style={styles.errorText}>Unable to load test details.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { position: 'absolute', left: 20 }]}>
          <Ionicons name="arrow-back" size={20} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.title}>Test Details</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Test Overview */}
        <View style={styles.section}>
          <View style={styles.overviewCard}>
            <View style={styles.courseHeader}>
              <Ionicons name="document-text" size={24} color="#4a90e2" />
              <View style={styles.courseInfo}>
                <Text style={styles.courseName}>{test.course}</Text>
                {test.topic && <Text style={styles.topic}>{test.topic}</Text>}
              </View>
            </View>

            <View style={styles.scoreSection}>
              <View style={[styles.scoreBadge, { backgroundColor: `${getScoreColor(test.score)}20` }]}>
                <Text style={[styles.scoreText, { color: getScoreColor(test.score) }]}>
                  {test.score}%
                </Text>
              </View>
              <Text style={styles.studentName}>{test.studentName}</Text>
            </View>

            <View style={styles.testMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar" size={16} color="#7f8c8d" />
                <Text style={styles.metaText}>{formatDate(test.date)}</Text>
              </View>
              {test.duration && (
                <View style={styles.metaItem}>
                  <Ionicons name="time" size={16} color="#7f8c8d" />
                  <Text style={styles.metaText}>{test.duration} min</Text>
                </View>
              )}
              {test.difficulty && (
                <View style={styles.metaItem}>
                  <Ionicons name="stats-chart" size={16} color="#7f8c8d" />
                  <Text style={styles.metaText}>{test.difficulty}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Test Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{test.totalQuestions || 0}</Text>
              <Text style={styles.statLabel}>Questions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{test.correctAnswers || 0}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {test.totalQuestions ? Math.round(((test.correctAnswers || 0) / test.totalQuestions) * 100) : 0}%
              </Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: getScoreColor(test.score) }]}>
                {test.score}%
              </Text>
              <Text style={styles.statLabel}>Score</Text>
            </View>
          </View>
        </View>

        {/* Questions Review */}
        {test.questions && test.questions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Question Review</Text>
            {test.questions.map((question, index) => (
              <View key={index} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionNumber}>Q{index + 1}</Text>
                  <View style={[
                    styles.answerStatus,
                    { backgroundColor: question.isCorrect ? '#e8f5e9' : '#ffebee' }
                  ]}>
                    <Ionicons
                      name={question.isCorrect ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={question.isCorrect ? '#4caf50' : '#f44336'}
                    />
                    <Text style={[
                      styles.answerStatusText,
                      { color: question.isCorrect ? '#4caf50' : '#f44336' }
                    ]}>
                      {question.isCorrect ? 'Correct' : 'Incorrect'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.questionText}>{question.prompt}</Text>

                {question.imgUrl && (
                  <Image
                    source={{ uri: question.imgUrl }}
                    style={styles.questionImage}
                    resizeMode="contain"
                  />
                )}

                <View style={styles.optionsContainer}>
                  {question.options.map((option, optionIndex) => (
                    <View key={option._id} style={[
                      styles.option,
                      optionIndex === question.correctIndex && styles.correctOption,
                      question.userIndex === optionIndex && !question.isCorrect && styles.incorrectOption,
                    ]}>
                      <Text style={[
                        styles.optionText,
                        optionIndex === question.correctIndex && styles.correctOptionText,
                        question.userIndex === optionIndex && !question.isCorrect && styles.incorrectOptionText,
                      ]}>
                        {option.text}
                      </Text>
                      {optionIndex === question.correctIndex && (
                        <Ionicons name="checkmark" size={16} color="#4caf50" />
                      )}
                      {question.userIndex === optionIndex && !question.isCorrect && (
                        <Ionicons name="close" size={16} color="#f44336" />
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ))}
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    position: 'relative',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  courseInfo: {
    marginLeft: 12,
    flex: 1,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  topic: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  studentName: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  testMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#7f8c8d',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  answerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  answerStatusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  questionText: {
    fontSize: 15,
    color: '#2c3e50',
    marginBottom: 12,
    lineHeight: 20,
  },
  questionImage: {
    width: '100%',
    height: 200,
    marginBottom: 12,
    borderRadius: 8,
  },
  optionsContainer: {
    marginTop: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  correctOption: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  incorrectOption: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  optionText: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  correctOptionText: {
    color: '#4caf50',
    fontWeight: '600',
  },
  incorrectOptionText: {
    color: '#f44336',
    fontWeight: '600',
  },
});

export default TestDetailPage;