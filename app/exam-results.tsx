import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type ResultItem = {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  correctAnswer: string;
  prompt: string;
  options: { text: string; correct: boolean }[];
  examType: string;
  year: string;
  imageUrl?: string;
};

const ExamResults = () => {
  const router = useRouter();
  const {
    score = '0',
    correct,
    total = '0',
    percentage = '0',
    results = '[]',
    testId,
    examtype,
    testName,
    subjects,
    duration = '0', // Actual duration in minutes from take-exam
    createdAt,
    testData // New param for dashboard data
  } = useLocalSearchParams();

  // Parse the results string back to an array or use testData
  let parsedResults: ResultItem[] = [];
  let scoreValue = parseFloat(score as string);
  let totalValue = parseFloat(total as string);
  let percentageValue = parseFloat(percentage as string);
  let durationValue = parseFloat(duration as string);
  let correctValue = parseFloat(correct as string);
  let incorrectValue = 0;

  if (testData) {
    // Use data from dashboard
    const test = JSON.parse(testData as string);
    scoreValue = test.score || 0;
    totalValue = test.total || 0;
    percentageValue = totalValue > 0 ? Math.round((test.correct / totalValue) * 100) : 0;
    durationValue = test.duration || 0;
    correctValue = test.correct || 0; // Actual correct count
    incorrectValue = totalValue - correctValue; // Actual incorrect count

    // Map to ResultItem format
    parsedResults = test.questions.map((q: any) => {
      const answer = test.answers.find((a: any) => a.questionId === q._id);
      const selectedAnswer = answer?.selectedAnswer || '';
      const isCorrect = q.options.some((opt: any) => opt.text === selectedAnswer && opt.correct);
      const correctAnswer = q.options.find((opt: any) => opt.correct)?.text || '';

      return {
        questionId: q._id,
        selectedAnswer,
        isCorrect,
        correctAnswer,
        prompt: q.prompt,
        options: q.options,
        examType: q.examtype || q.examType || 'Unknown',
        year: q.year || 'Unknown', // Not in data, can add if available
        imageUrl: q.imageUrl // Add imageUrl if available
      };
    });
  } else {
    // Use data from take-exam
    parsedResults = JSON.parse(results as string);
    correctValue = parsedResults.filter(r => r.isCorrect).length; // Calculate from results
    incorrectValue = totalValue - correctValue;
  }

  const getPerformanceMessage = () => {
    if (percentageValue >= 80) return 'Excellent Work!';
    if (percentageValue >= 60) return 'Good Job!';
    if (percentageValue >= 40) return 'Keep Practicing!';
    return 'You can do better!';
  };

  const getPerformanceColor = () => {
    if (percentageValue >= 80) return '#10B981'; // Green
    if (percentageValue >= 60) return '#3B82F6'; // Blue
    if (percentageValue >= 40) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push('/courses')}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Results</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Test Information Card */}
        {testName && (
          <View style={styles.testInfoCard}>
            <Text style={styles.testName}>{testName}</Text>
            {subjects && <Text style={styles.testSubjects}>{subjects}</Text>}
            {createdAt && <Text style={styles.testDate}>{formatDate(createdAt as string)}</Text>}
          </View>
        )}

        {/* Score Card */}
        <View style={styles.scoreCard}>
          <Text style={styles.performanceText}>{getPerformanceMessage()}</Text>

          <View style={styles.scoreCircle}>
            <Text style={styles.percentageText}>{Math.round(percentageValue)}%</Text>
            <Text style={styles.scoreText}>{correctValue} / {total}</Text>
          </View>

          {/* <View style={styles.summaryCard}>
            <Text style={styles.scoreText}>{score}%</Text>
            <Text style={styles.subtitleText}>Score</Text>
            <Text style={styles.smallText}>{total} Questions</Text>
            {examtype && (
              <Text style={[styles.smallText, { marginTop: 8 }]}>{examtype} Exam</Text>
            )}
          </View> */}

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{correctValue}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalValue - correctValue}</Text>
              <Text style={styles.statLabel}>Incorrect</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalValue}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>

        {/* Results Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: '#10B98120' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
            <Text style={styles.summaryText}>
              <Text style={{ color: '#10B981', fontWeight: '600' }}>{correctValue} questions</Text> answered correctly
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: '#EF444420' }]}>
              <Ionicons name="close-circle" size={20} color="#EF4444" />
            </View>
            <Text style={styles.summaryText}>
              <Text style={{ color: '#EF4444', fontWeight: '600' }}>{totalValue - correctValue} questions</Text> answered incorrectly
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: '#3B82F620' }]}>
              <Ionicons name="time-outline" size={18} color="#3B82F6" />
            </View>
            <Text style={styles.summaryText}>
              Completed in <Text style={{ fontWeight: '600' }}>{durationValue} minutes</Text>
            </Text>
          </View>
        </View>

        {/* Questions Review */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questions Review</Text>
          {parsedResults.map((result, index) => (
            <View key={result.questionId} style={styles.questionCard}>
              <Text style={styles.questionPrompt}>
                {index + 1}. {result.prompt}
              </Text>

              {result.imageUrl && (
                <Image
                  source={{ uri: result.imageUrl }}
                  style={styles.questionImage}
                  resizeMode="contain"
                  onError={() => console.log('Failed to load image for question')}
                />
              )}

              <View style={styles.questionMeta}>
                <Text style={styles.questionMetaText}>
                  {result.examType || 'Unknown'} • {result.year || 'Unknown'}
                </Text>
              </View>

              <View style={styles.optionsContainer}>
                {result.options.map((option, optIndex) => {
                  const isCorrect = option.correct;
                  const isSelected = option.text === result.selectedAnswer;
                  let optionStyle = styles.option;

                  if (isCorrect) {
                    optionStyle = { ...optionStyle, ...styles.correctOption };
                  }
                  if (isSelected && !isCorrect) {
                    optionStyle = { ...optionStyle, ...styles.incorrectOption };
                  }
                  if (isSelected && isCorrect) {
                    optionStyle = { ...optionStyle, ...styles.selectedCorrectOption };
                  }

                  return (
                    <View key={optIndex} style={optionStyle}>
                      <Text style={styles.optionText}>{option.text}</Text>
                      {isCorrect && <Ionicons name="checkmark-circle" size={16} color="#10B981" style={styles.icon} />}
                      {isSelected && !isCorrect && <Ionicons name="close-circle" size={16} color="#EF4444" style={styles.icon} />}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#6366F1' }]}
            onPress={() => router.push('/courses')}
          >
            <Ionicons name="home-outline" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={[styles.buttonText, { color: '#fff' }]}>Back to Home</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={[styles.button, { backgroundColor: '#F3F4F6' }]}
            onPress={() => router.back()}
          >
            <Ionicons name="refresh" size={20} color="#4B5563" style={styles.buttonIcon} />
            <Text style={[styles.buttonText, { color: '#4B5563' }]}>Try Again</Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    zIndex: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    paddingTop: 50,
    paddingBottom: 16,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  testInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  testName: {
    fontSize: 22,
    fontFamily: 'Inter_600SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  testSubjects: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  testDate: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  performanceText: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 8,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
  },
  percentageText: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: '#1F2937',
  },
  scoreText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
    summaryCard: { 
    backgroundColor: '#111827', 
    borderRadius: 16, 
    padding: 20, 
    alignItems: 'center', 
    marginBottom: 16 
  },
  subtitleText: { 
    color: '#D1D5DB', 
    marginTop: 6 
  },
  smallText: { 
    color: '#9CA3AF', 
    marginTop: 4 
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryText: {
  flex: 1,
  fontSize: 15,
  color: '#4B5563',
  lineHeight: 22,
},
  questionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  questionPrompt: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 22,
  },
  questionImage: {
    width: '100%',
    height: 200,
    marginBottom: 12,
    borderRadius: 8,
  },
  questionMeta: {
    marginBottom: 12,
    alignItems: 'center',
  },
  questionMetaText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter_400Regular',
  },
  optionsContainer: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    fontFamily: 'Inter_400Regular',
  },
  icon: {
    marginLeft: 8,
  },
  correctOption: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  incorrectOption: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  selectedCorrectOption: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  buttonsContainer: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});

export default ExamResults;