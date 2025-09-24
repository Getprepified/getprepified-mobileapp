import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import apiClient from './utils/apiClient';
import { useAuth } from './contexts/UserContext';

interface StreakItem { _id: string; fromUserId: string; toUserId: string; testId: string; resultId: string; createdAt: string }

const DMPage = () => {
  const { friendId, friendName } = useLocalSearchParams();
  const { token } = useAuth();
  const router = useRouter();
  const [streaks, setStreaks] = useState<StreakItem[]>([]);
  const [sending, setSending] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sendable, setSendable] = useState<any[]>([]);

  const load = async () => {
    if (!token) return;
    const res = await apiClient.get(`/api/streaks/with/${friendId}`, { headers: { Authorization: `Bearer ${token}` } });
    setStreaks(res.data || []);
  };

  useEffect(() => { load(); }, [token, friendId]);

  const openPicker = async () => {
    if (!token) return;
    const res = await apiClient.get(`/api/streaks/sendable/${friendId}`, { headers: { Authorization: `Bearer ${token}` } });
    setSendable(res.data || []);
    setPickerOpen(true);
  };

  const sendStreak = async (resultId?: string) => {
    try {
      setSending(true);
      await apiClient.post('/api/streaks/send', { toUserId: friendId, resultId }, { headers: { Authorization: `Bearer ${token}` } });
      await load();
      setPickerOpen(false);
    } finally { setSending(false); }
  };

  const renderItem = ({ item }: { item: StreakItem }) => (
    <TouchableOpacity style={styles.msgItem} onPress={() => router.push({ pathname: '/test-result', params: { testId: item.testId, resultId: item.resultId } })}>
      <Text style={styles.msgText}>Streak: Test {String(item.testId).slice(-6)} • {new Date(item.createdAt).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>{friendName || 'Direct Message'}</Text><Text style={styles.subtitle}>Share streaks from your recent tests</Text></View>
      <FlatList data={streaks} renderItem={renderItem} keyExtractor={(i) => i._id} contentContainerStyle={{ padding: 16, paddingBottom: 120 }} />
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.streakBtn, sending && { opacity: 0.6 }]} onPress={openPicker} disabled={sending}>
          <Text style={styles.streakText}>{sending ? 'Sending...' : 'Streak'}</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={pickerOpen} animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select a result to send</Text>
            <FlatList data={sendable} keyExtractor={(i) => i.id} renderItem={({ item }) => (
              <TouchableOpacity style={styles.resultRow} onPress={() => sendStreak(item.id)}>
                <Text style={styles.resultText}>Score: {item.score}% • Test {String(item.testId).slice(-6)}</Text>
                <Text style={styles.resultSub}>{new Date(item.createdAt).toLocaleString()}</Text>
              </TouchableOpacity>
            )} ListEmptyComponent={<Text style={styles.emptyText}>No results available to send</Text>} />
            <TouchableOpacity style={[styles.streakBtn,{ marginTop: 10 }]} onPress={() => setPickerOpen(false)}><Text style={styles.streakText}>Close</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderColor: '#E5E7EB' },
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  subtitle: { color: '#6B7280', marginTop: 4 },
  msgItem: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, marginBottom: 10 },
  msgText: { color: '#111827' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: '#ffffff', borderTopWidth: 1, borderColor: '#E5E7EB' },
  streakBtn: { backgroundColor: '#8B5CF6', borderRadius: 12, alignItems: 'center', paddingVertical: 12 },
  streakText: { color: '#ffffff', fontWeight: '800' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '90%', maxHeight: '70%', backgroundColor: '#ffffff', borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  resultRow: { paddingVertical: 10, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  resultText: { color: '#111827', fontWeight: '600' },
  resultSub: { color: '#6B7280', fontSize: 12 },
  emptyText: { color: '#6B7280', textAlign: 'center', marginTop: 20 },
});

export default DMPage;