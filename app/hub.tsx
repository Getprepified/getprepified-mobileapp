import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import FooterNavigation from './components/FooterNavigation';
import apiClient from './utils/apiClient';
import { useAuth } from './contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const HubPage = () => {
  const { token } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        if (!token) return;
        const res = await apiClient.get('/api/users/students', { headers: { Authorization: `Bearer ${token}` } });
        setStudents(res.data || []);
        const fr = await apiClient.get('/api/friendships', { headers: { Authorization: `Bearer ${token}` } });
        const ids = new Set((fr.data || []).map((f: any) => String(f.id)));
        setFriendIds(ids);
      } catch {}
    })();
  }, [token]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => (s.nickname || '').toLowerCase().includes(q) || (s.name || '').toLowerCase().includes(q));
  }, [students, search]);

  const renderItem = ({ item }: { item: any }) => {
    const isFriend = friendIds.has(String(item.id));
    return (
    <TouchableOpacity style={styles.cardItem} onPress={() => router.push({ pathname: '/dm', params: { friendId: item.id, friendName: item.name } })}>
      <View style={styles.avatarCircle}><Text style={styles.avatarText}>{(item.name || 'ST').split(' ').map((w: string) => w[0]).join('').slice(0,2).toUpperCase()}</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.nick}>@{item.nickname || 'student'}</Text>
        <View style={styles.row}><Ionicons name="star" size={14} color="#F59E0B" /><Text style={styles.rating}>{item.rating}% • {item.attempts} tests</Text></View>
      </View>
      {isFriend ? (
        <View style={styles.friendTag}><Text style={styles.friendTagText}>Friend</Text></View>
      ) : (
        <TouchableOpacity style={styles.addBtn} onPress={async () => {
          try { await apiClient.post('/api/friendships', { friendId: item.id }, { headers: { Authorization: `Bearer ${token}` } }); setFriendIds(new Set([...Array.from(friendIds), String(item.id)])); } catch {}
        }}>
          <Text style={styles.addText}>Add</Text></TouchableOpacity>
      )}
    </TouchableOpacity>
  ); };

  return (
    <View style={styles.container}>
      <View style={styles.header}> 
        <Text style={styles.title}>Discover Students</Text>
        <Text style={styles.subtitle}>Find classmates, compare progress, and connect</Text>
        <TextInput value={search} onChangeText={setSearch} placeholder="Search by nickname or name" placeholderTextColor="#9CA3AF" style={styles.search} />
        <View style={styles.pillsRow}>
          <View style={[styles.pill,{ backgroundColor: '#EEF2FF' }]}><Ionicons name="people" size={14} color="#4F46E5" /><Text style={styles.pillText}>Friends {friendIds.size}</Text></View>
          <View style={[styles.pill,{ backgroundColor: '#ECFDF5' }]}><Ionicons name="trophy" size={14} color="#10B981" /><Text style={[styles.pillText,{ color: '#065F46' }]}>Top Rated</Text></View>
        </View>
      </View>
      <FlatList data={filtered} renderItem={renderItem} keyExtractor={(it) => it.id} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} />
      <FooterNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: { padding: 16, backgroundColor: '#ffffff' },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  subtitle: { color: '#6B7280', marginTop: 4, marginBottom: 12 },
  search: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#F9FAFB' },
  pillsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9999 },
  pillText: { color: '#3730A3', fontWeight: '700' },
  cardItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111827', borderRadius: 16, padding: 14, marginBottom: 12 },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#4F46E5', fontWeight: '800' },
  name: { color: '#FFFFFF', fontWeight: '700' },
  nick: { color: '#C7D2FE', fontSize: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  rating: { color: '#E5E7EB' },
  addBtn: { backgroundColor: '#10B981', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  addText: { color: '#ffffff', fontWeight: '700' },
  friendTag: { backgroundColor: '#22C55E', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  friendTagText: { color: '#FFFFFF', fontWeight: '700' },
});

export default HubPage;