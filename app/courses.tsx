import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import FooterNavigation from './components/FooterNavigation';
import apiClient from './utils/apiClient';
import { Logger } from './utils/logger';
import { useAuth } from './contexts/UserContext';

interface Subject {
  name: string;
  courseCount: number;
}

interface CourseCategory {
  id: string;
  name: string;
  courseCount: number;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const CoursesPage = () => {
  const [activeTab, setActiveTab] = useState<'All' | 'Combined' | 'History'>('All');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [combinedSets, setCombinedSets] = useState<{ id: string; subjects: string[]; name?: string }[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const router = useRouter();

  // Subject colors and icons mapping
  const subjectConfig: Record<string, { color: string; icon: keyof typeof Ionicons.glyphMap }> = {
    'Mathematics': { color: '#F59E0B', icon: 'calculator' },
    'English': { color: '#3B82F6', icon: 'book' },
    'Physics': { color: '#8B5CF6', icon: 'flash' },
    'Chemistry': { color: '#EF4444', icon: 'flask' },
    'Biology': { color: '#10B981', icon: 'leaf' },
    'Economics': { color: '#F97316', icon: 'trending-up' },
    'Government': { color: '#6366F1', icon: 'business' },
    'Literature': { color: '#EC4899', icon: 'library' },
    'Geography': { color: '#06B6D4', icon: 'earth' },
    'Commerce': { color: '#84CC16', icon: 'storefront' },
    'Accounting': { color: '#14B8A6', icon: 'receipt' },
    'CRS': { color: '#A855F7', icon: 'book' },
    'History': { color: '#DC2626', icon: 'time' },
    'Civic Education': { color: '#059669', icon: 'people' },
    'Computer Studies': { color: '#7C3AED', icon: 'laptop' },
  };

  useEffect(() => {
    fetchSubjects();
    fetchCombinedSets();
  }, []);

  useEffect(() => {
    if (activeTab === 'History') {
      (async () => {
        try {
          if (!token) return;
          const res = await apiClient.get('/api/tests/me/results', { headers: { Authorization: `Bearer ${token}` } });
          setResults(res.data || []);
        } catch (e) {
          setResults([]);
        }
      })();
    }
  }, [activeTab, token]);

  const getOverall = () => {
    if (!results || results.length === 0) return { count: 0, avg: 0 };
    const count = results.length;
    const sum = results.reduce((acc, r) => acc + (Number(r.score) || 0), 0);
    return { count, avg: Math.round(sum / count) };
  };

  const fetchSubjects = async () => {
    try {
      Logger.info('🔄 Fetching subjects from API');
      const response = await apiClient.get('/api/questions/subjects');
      Logger.info('✅ Subjects fetched successfully', { count: response.data.length });
      setSubjects(response.data);
    } catch (error) {
      Logger.error('💥 Error fetching subjects', error);
      // Fallback data for development
      setSubjects([
        { name: 'Mathematics', courseCount: 15 },
        { name: 'English', courseCount: 12 },
        { name: 'Physics', courseCount: 18 },
        { name: 'Chemistry', courseCount: 14 },
        { name: 'Biology', courseCount: 16 },
        { name: 'Economics', courseCount: 10 },
        { name: 'Government', courseCount: 8 },
        { name: 'Literature', courseCount: 9 },
        { name: 'Geography', courseCount: 11 },
        { name: 'Commerce', courseCount: 7 },
        { name: 'Accounting', courseCount: 13 },
        { name: 'CRS', courseCount: 6 },
        { name: 'History', courseCount: 10 },
        { name: 'Civic Education', courseCount: 5 },
        { name: 'Computer Studies', courseCount: 8 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCombinedSets = async () => {
    try {
      const res = await apiClient.get('/api/combined-sets', token ? { headers: { Authorization: `Bearer ${token}` } } : undefined as any);
      const list = (res.data || []).map((x: any) => ({ id: String(x._id), subjects: x.subjects, name: x.name }));
      setCombinedSets(list);
    } catch (e) {
      // ignore silently
    }
  };

  const getCourseCategories = (): CourseCategory[] => {
    if (activeTab === 'Combined') {
      return combinedSets.map((set) => ({ id: set.id, name: set.name || set.subjects.join(' + '), courseCount: set.subjects.length, color: '#8B5CF6', icon: 'school' }));
    }
    if (activeTab === 'History') {
      return [];
    }

    return subjects.map(subject => ({
      id: subject.name,
      name: subject.name,
      courseCount: subject.courseCount,
      color: subjectConfig[subject.name]?.color || '#6B7280',
      icon: subjectConfig[subject.name]?.icon || 'book'
    }));
  };

  const renderCourseCard = ({ item }: { item: CourseCategory }) => (
    <TouchableOpacity 
      style={[styles.courseCard, { backgroundColor: item.color }]}
      onPress={() => {
        if (activeTab === 'Combined') {
          const set = combinedSets.find((s) => s.id === item.id);
          if (set) router.push({ pathname: '/pre-exam', params: { subjects: set.subjects.join(','), combined: 'true' } });
        } else {
          router.push({ pathname: '/pre-exam', params: { subject: item.name, combined: 'false' } });
        }
      }}
    >
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.icon} size={32} color="#ffffff" />
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.courseTitle}>{item.name}</Text>
          <Text style={styles.courseCount}>{item.courseCount} Course{item.courseCount !== 1 ? 's' : ''}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Category</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.loadingText}>Loading courses...</Text>
        </View>
        <FooterNavigation />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Main Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>{activeTab === 'History' ? 'Your Exam History' : 'Ready To Learn?'}</Text>
          <Text style={styles.subtitle}>{activeTab === 'History' ? 'Review your scores and progress' : 'Choose your subject.'}</Text>
          {activeTab !== 'History' && (
            <View style={styles.kpisRow}>
              <View style={[styles.kpiCard,{ backgroundColor: '#111827' }]}>
                <Text style={styles.kpiLabel}>Subjects</Text>
                <Text style={styles.kpiValue}>{subjects.length}</Text>
              </View>
              <View style={[styles.kpiCard,{ backgroundColor: '#0EA5E9' }]}>
                <Text style={[styles.kpiLabel,{ color: '#E0F2FE' }]}>Combined Sets</Text>
                <Text style={[styles.kpiValue,{ color: '#FFFFFF' }]}>{combinedSets.length}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'All' && styles.activeTab]}
            onPress={() => setActiveTab('All')}
          >
            <Text style={[styles.tabText, activeTab === 'All' && styles.activeTabText]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Combined' && styles.activeTab]}
            onPress={() => setActiveTab('Combined')}
          >
            <Text style={[styles.tabText, activeTab === 'Combined' && styles.activeTabText]}>
              Combined Courses
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'History' && styles.activeTab]}
            onPress={() => setActiveTab('History')}
          >
            <Text style={[styles.tabText, activeTab === 'History' && styles.activeTabText]}>
              History
            </Text>
          </TouchableOpacity>
        </View>

        {/* Course Grid */}
        <View style={styles.courseGrid}>
          {activeTab === 'History' ? (
            <View style={styles.gridContent}>
              {/* Summary */}
              <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Total Tests</Text>
                  <Text style={styles.summaryValue}>{getOverall().count}</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Overall Rating</Text>
                  <View style={[styles.ratingCircle, { backgroundColor: getOverall().avg >= 70 ? '#22C55E' : getOverall().avg >= 40 ? '#F59E0B' : '#EF4444' }]}> 
                    <Text style={styles.ratingCircleText}>{getOverall().avg}%</Text>
                  </View>
                </View>
              </View>

              {results.length === 0 ? (
                <View style={{ alignItems: 'center', padding: 30 }}>
                  <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
                  <Text style={{ marginTop: 10, color: '#6B7280' }}>No tests taken yet</Text>
                </View>
              ) : (
                results.map(r => (
                  <View key={r.id} style={styles.historyCard}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyTitle}>{r.name || 'Exam'}</Text>
                      <View style={[styles.miniCircle, { backgroundColor: (r.score || 0) >= 70 ? '#22C55E' : (r.score || 0) >= 40 ? '#F59E0B' : '#EF4444' }]}>
                        <Text style={styles.miniCircleText}>{r.score}%</Text>
                      </View>
                    </View>
                    <View style={styles.chipsRow}>
                      {(r.subjects || []).map((s: string) => (
                        <View key={s} style={styles.chip}><Text style={styles.chipText}>{s}</Text></View>
                      ))}
                    </View>
                    <Text style={styles.historyMeta}>{new Date(r.createdAt).toLocaleString()}</Text>
                  </View>
                ))
              )}
            </View>
          ) : activeTab === 'Combined' && getCourseCategories().length === 0 ? (
            <View style={{ alignItems: 'center', padding: 30 }}>
              <Ionicons name="library-outline" size={48} color="#D1D5DB" />
              <Text style={{ marginTop: 10, color: '#6B7280' }}>No combined sets yet</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Tap the + button to create one</Text>
            </View>
          ) : (
            <FlatList
              data={getCourseCategories()}
              renderItem={renderCourseCard}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.gridContent}
            />
          )}
        </View>

        {/* Bottom spacing for footer */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {activeTab === 'Combined' && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
          <Text style={styles.fabIcon}>＋</Text>
        </TouchableOpacity>
      )}

      <Modal transparent visible={showAddModal} animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create Combined Subjects</Text>
            <TextInput value={search} onChangeText={setSearch} placeholder="Search subjects" style={styles.search} />
            <ScrollView style={{ maxHeight: 300 }}>
              {subjects
                .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
                .map((s) => (
                  <TouchableOpacity key={s.name} style={styles.subjectRow} onPress={() => setSelected((prev) => ({ ...prev, [s.name]: !prev[s.name] }))}>
                    <Text style={styles.subjectName}>{s.name}</Text>
                    <Ionicons name={selected[s.name] ? 'checkmark-circle' : 'add-circle-outline'} size={22} color={selected[s.name] ? '#10B981' : '#6B7280'} />
                  </TouchableOpacity>
                ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.submitBtn, (Object.keys(selected).filter((k) => selected[k]).length < 2 || Object.keys(selected).filter((k) => selected[k]).length > 4) && styles.submitBtnDisabled]}
              disabled={Object.keys(selected).filter((k) => selected[k]).length < 2 || Object.keys(selected).filter((k) => selected[k]).length > 4}
              onPress={async () => {
                const subjectsChosen = Object.keys(selected).filter((k) => selected[k]);
                await apiClient.post('/api/combined-sets', { subjects: subjectsChosen }, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
                setShowAddModal(false);
                setSelected({});
                fetchCombinedSets();
              }}
            >
              <Text style={styles.submitBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FooterNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: '#8B5CF6',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  kpisRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  kpiCard: { flex: 1, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14 },
  kpiLabel: { color: '#C7D2FE', fontSize: 12 },
  kpiValue: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  activeTab: {
    backgroundColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#ffffff',
  },
  courseGrid: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  gridContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryCard: { flex: 1, backgroundColor: '#111827', borderRadius: 12, padding: 12, marginRight: 8 },
  summaryLabel: { color: '#C7D2FE', fontSize: 12 },
  summaryValue: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  ratingCircle: { marginTop: 6, width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  ratingCircleText: { color: '#FFFFFF', fontWeight: '800' },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  courseCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#111827',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  iconContainer: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTextContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    lineHeight: 20,
  },
  courseCount: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
  },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  miniCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  miniCircleText: { color: '#FFFFFF', fontWeight: '700' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, gap: 6 },
  chip: { backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
  chipText: { color: '#4F46E5', fontWeight: '600', fontSize: 12 },
  historyCard: { backgroundColor: '#ffffff', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12 },
  historyTitle: { color: '#111827', fontWeight: '700' },
  historyMeta: { color: '#6B7280', marginTop: 6, fontSize: 12 },
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
  fab: { position: 'absolute', right: 20, bottom: 100, backgroundColor: '#8B5CF6', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  fabIcon: { color: '#ffffff', fontSize: 28, lineHeight: 28 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '90%', backgroundColor: '#ffffff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 8 },
  search: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
  subjectRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  subjectName: { color: '#111827' },
  submitBtn: { marginTop: 12, backgroundColor: '#10B981', alignItems: 'center', paddingVertical: 12, borderRadius: 12 },
  submitBtnDisabled: { backgroundColor: '#A7F3D0' },
  submitBtnText: { color: '#ffffff', fontWeight: '700' },
});

export default CoursesPage;