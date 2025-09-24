import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import apiClient from './utils/apiClient';
import { useAuth } from './contexts/UserContext';
import { Logger } from './utils/logger';

interface Option { text: string; correct?: boolean }
interface Question { _id: string; prompt: string; options: Option[]; explanation?: string }

const TakeExamPage = () => {
  const { testId, duration } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(Number(duration || 100) * 60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await apiClient.get(`/api/tests/${testId}`, { headers: { Authorization: `Bearer ${token}` } });
        setQuestions(res.data?.questions || []);
      } catch (e) {
        Logger.error('💥 Failed to load test', e);
      }
    })();
  }, [testId, token]);

  useEffect(() => {
    timerRef.current = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      submit();
    }
  }, [secondsLeft]);

  const total = questions.length || 100;
  const allAnswered = useMemo(() => Object.keys(answers).length >= total, [answers, total]);

  const selectOption = (qId: string, optIndex: number) => {
    setAnswers((prev) => {
      const next = { ...prev, [qId]: optIndex };
      // live score update
      const q = questions.find((x) => x._id === qId);
      const correctIndex = (q?.options || []).findIndex((o) => o.correct === true);
      const isCorrect = Number(optIndex) === Number(correctIndex);
      setScore((s) => {
        const was = prev[qId];
        const wasCorrect = was !== undefined && Number(was) === Number(correctIndex);
        if (was === undefined) return s + (isCorrect ? 1 : 0);
        if (wasCorrect && !isCorrect) return s - 1;
        if (!wasCorrect && isCorrect) return s + 1;
        return s;
      });
      return next;
    });
  };

  const next = () => setIndex((i) => Math.min(i + 1, total - 1));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));

  const submit = async () => {
    if (!token) return;
    try {
      const payload = {
        answers: questions.map((q) => ({ questionId: q._id, selectedIndex: answers[q._id] ?? -1 })),
      };
      const res = await apiClient.post(`/api/tests/${testId}/submit`, payload, { headers: { Authorization: `Bearer ${token}` } });
      const result = res.data;
      router.replace({ pathname: '/test-result', params: { testId: String(testId), resultId: String(result?.id) } });
    } catch (e) {
      Logger.error('💥 Submit failed', e);
      router.replace('/dashboard');
    }
  };

  const q = questions[index];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exam</Text>
        <View style={styles.timer}><Ionicons name="time-outline" size={16} color="#FCD34D" /><Text style={styles.timerText}>{Math.max(0, Math.floor(secondsLeft / 60)).toString().padStart(2,'0')}:{Math.max(0, secondsLeft % 60).toString().padStart(2,'0')}</Text></View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.progressBarOuter}><View style={[styles.progressBarInner,{ width: `${Math.min(100, ((index+1)/total)*100)}%` }]} /></View>
        <Text style={styles.counter}>Question {index + 1} of {total}</Text>
        <Text style={styles.prompt}>{q?.prompt || 'Loading question...'}</Text>
        {q?.options?.map((opt, i) => (
          <TouchableOpacity key={i} style={[styles.option, answers[q._id] === i && styles.optionSelected]} onPress={() => selectOption(q._id, i)}>
            <Text style={[styles.optionText, answers[q._id] === i && styles.optionTextSelected]}>{opt.text}</Text>
          </TouchableOpacity>
        ))}
        {answers[q?._id || ''] !== undefined && q?.explanation ? (
          <View style={styles.explainer}> 
            <Text style={styles.explainerTitle}>Explanation</Text>
            <Text style={styles.explainerText}>{q.explanation}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.navBtn} onPress={prev} disabled={index === 0}><Text style={styles.navBtnText}>Previous</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.navBtn, styles.navBtnAlt]} onPress={next} disabled={index >= total - 1}><Text style={[styles.navBtnText, styles.navBtnAltText]}>Skip/Next</Text></TouchableOpacity>
      </View>

      <View style={styles.submitBar}>
        <Text style={styles.submitInfo}>{Object.keys(answers).length}/{total} answered</Text>
        <TouchableOpacity style={[styles.submitBtn, !allAnswered && styles.submitBtnDisabled]} onPress={submit} disabled={!allAnswered}><Text style={styles.submitBtnText}>Submit</Text></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0F172A', paddingTop: 10, paddingBottom: 12, paddingHorizontal: 20 },
  backButton: { padding: 8 },
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timerText: { color: '#FCD34D', fontWeight: '700', marginLeft: 6 },
  content: { flex: 1, backgroundColor: '#F9FAFB', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 },
  progressBarOuter: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 9999, overflow: 'hidden', marginBottom: 12 },
  progressBarInner: { height: 6, backgroundColor: '#8B5CF6' },
  counter: { color: '#6B7280', fontSize: 13, marginBottom: 8 },
  prompt: { fontSize: 16, color: '#111827', marginBottom: 12 },
  option: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, marginBottom: 10 },
  optionSelected: { borderColor: '#8B5CF6', backgroundColor: '#F5F3FF' },
  optionText: { color: '#111827' },
  optionTextSelected: { color: '#4C1D95', fontWeight: '700' },
  explainer: { marginTop: 12, backgroundColor: '#ECFEFF', borderColor: '#67E8F9', borderWidth: 1, borderRadius: 12, padding: 12 },
  explainerTitle: { color: '#0369A1', fontWeight: '700', marginBottom: 6 },
  explainerText: { color: '#0C4A6E' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#F9FAFB' },
  navBtn: { backgroundColor: '#E5E7EB', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  navBtnAlt: { backgroundColor: '#8B5CF6' },
  navBtnText: { color: '#111827', fontWeight: '600' },
  navBtnAltText: { color: '#ffffff' },
  submitBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#ffffff', borderTopWidth: 1, borderColor: '#E5E7EB' },
  submitInfo: { color: '#6B7280' },
  submitBtn: { backgroundColor: '#10B981', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  submitBtnDisabled: { backgroundColor: '#A7F3D0' },
  submitBtnText: { color: '#ffffff', fontWeight: '700' },
});

export default TakeExamPage;