import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import apiClient from './utils/apiClient';
import { useAuth } from './contexts/UserContext';

interface ResultItem { questionId: string; prompt: string; options: { text: string }[]; userIndex: number; correctIndex: number; correct: boolean; explanation: string; subject?: string; topics?: string[] }

const TestResultPage = () => {
  const { testId, resultId } = useLocalSearchParams();
  const { token } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<ResultItem[]>([]);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const res = await apiClient.get(`/api/tests/${testId}/results/${resultId}`, { headers: { Authorization: `Bearer ${token}` } });
      setItems(res.data?.items || []);
      setScore(res.data?.score || 0);
      setTotal(res.data?.total || (res.data?.items?.length || 0));
    })();
  }, [testId, resultId, token]);

  const bySubject = useMemo(() => {
    const map = new Map<string, { correct: number; total: number }>();
    for (const it of items) {
      const key = it.subject || 'General';
      const agg = map.get(key) || { correct: 0, total: 0 };
      agg.total += 1;
      if (it.correct) agg.correct += 1;
      map.set(key, agg);
    }
    return Array.from(map.entries());
  }, [items]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/dashboard')}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exam Result</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.scoreText}>{score}%</Text>
          <Text style={styles.subtitleText}>Score</Text>
          <Text style={styles.smallText}>{total} Questions</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>By Subject</Text>
          {bySubject.map(([subject, s]) => (
            <View key={subject} style={styles.row}>
              <Text style={styles.rowLabel}>{subject}</Text>
              <Text style={styles.rowValue}>{s.correct}/{s.total}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Review Answers</Text>
          {items.map((it, i) => (
            <View key={i} style={styles.qaBlock}>
              <Text style={styles.qPrompt}>{i + 1}. {it.prompt}</Text>
              {it.options.map((op, j) => (
                <View key={j} style={[styles.optionRow, j === it.correctIndex ? styles.optionCorrect : (j === it.userIndex ? styles.optionSelected : styles.optionDefault)]}>
                  <Text style={styles.optionText}>{op.text}</Text>
                  {j === it.correctIndex ? <Text style={styles.badge}>Correct</Text> : (j === it.userIndex ? <Text style={styles.badgeAlt}>Your Choice</Text> : null)}
                </View>
              ))}
              {it.explanation ? (
                <View style={styles.explainBox}><Text style={styles.explainTitle}>Explanation</Text><Text style={styles.explainText}>{it.explanation}</Text></View>
              ) : null}
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
  content: { flex: 1, backgroundColor: '#F9FAFB', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 },
  summaryCard: { backgroundColor: '#111827', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16 },
  scoreText: { color: '#22C55E', fontSize: 40, fontWeight: '800' },
  subtitleText: { color: '#D1D5DB', marginTop: 6 },
  smallText: { color: '#9CA3AF', marginTop: 4 },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rowLabel: { color: '#111827', fontWeight: '600' },
  rowValue: { color: '#111827' },
  qaBlock: { marginBottom: 16 },
  qPrompt: { color: '#111827', fontWeight: '600', marginBottom: 8 },
  optionRow: { padding: 10, borderRadius: 10, marginBottom: 6 },
  optionDefault: { backgroundColor: '#F3F4F6' },
  optionSelected: { backgroundColor: '#FCE7F3' },
  optionCorrect: { backgroundColor: '#DCFCE7' },
  optionText: { color: '#111827' },
  badge: { color: '#166534', fontWeight: '700' },
  badgeAlt: { color: '#9D174D', fontWeight: '700' },
  explainBox: { backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE', padding: 12, borderRadius: 12, marginTop: 6 },
  explainTitle: { color: '#3730A3', fontWeight: '700', marginBottom: 4 },
  explainText: { color: '#1E3A8A' },
});

export default TestResultPage;