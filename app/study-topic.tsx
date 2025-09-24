import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import apiClient from './utils/apiClient';
import { Logger } from './utils/logger';

interface ExampleItem { question: string; solution: string }
interface TopicItem { title: string; explanation: string; examples: ExampleItem[] }

const StudyTopicPage = () => {
  const { courseId, topicIndex } = useLocalSearchParams();
  const router = useRouter();
  const [topic, setTopic] = useState<TopicItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        Logger.info('🔄 Fetching course for study-topic', { courseId, topicIndex });
        const res = await apiClient.get(`/api/courses/${courseId}`);
        const c = res.data?.course;
        const idx = Number(topicIndex || 0);
        const t = (c?.topics || [])[idx] || null;
        setTopic(t);
      } catch (e) {
        Logger.error('💥 Error loading study-topic', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, topicIndex]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading topic...</Text>
      </View>
    );
  }

  if (!topic) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Topic not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="#ffffff" />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{topic.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Explanation</Text>
          <Text style={styles.paragraph}>{topic.explanation}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Examples</Text>
          {topic.examples?.map((ex, i) => (
            <View key={i} style={styles.exampleBlock}>
              <View style={styles.exampleHeader}>
                <View style={styles.exampleBadge}><Text style={styles.exampleBadgeText}>Example {i + 1}</Text></View>
              </View>
              <Text style={styles.exampleQuestion}>{ex.question}</Text>
              <View style={styles.solutionBox}>
                <Text style={styles.solutionTitle}>Solution</Text>
                <Text style={styles.solutionText}>{ex.solution}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0F172A', paddingTop: 10, paddingBottom: 12, paddingHorizontal: 20 },
  backButton: { padding: 8 },
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, backgroundColor: '#F8FAFC', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  paragraph: { fontSize: 14, color: '#374151', lineHeight: 20 },
  exampleBlock: { marginBottom: 16 },
  exampleHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  exampleBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999 },
  exampleBadgeText: { color: '#4F46E5', fontWeight: '600' },
  exampleQuestion: { fontSize: 14, color: '#111827', marginBottom: 8 },
  solutionBox: { backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 12 },
  solutionTitle: { fontSize: 12, fontWeight: '700', color: '#6B7280', marginBottom: 4 },
  solutionText: { fontSize: 14, color: '#111827', lineHeight: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', padding: 24 },
  loadingText: { fontSize: 16, color: '#6B7280', marginTop: 8 },
  backBtn: { marginTop: 12, backgroundColor: '#4F46E5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  backBtnText: { color: '#ffffff', marginLeft: 6, fontWeight: '600' },
});

export default StudyTopicPage;