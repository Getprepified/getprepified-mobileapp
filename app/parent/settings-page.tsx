import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/UserContext';
import { Logger } from '../utils/logger';
import apiClient from '../utils/apiClient';

const ParentSettings = () => {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [loading, setLoading] = useState(false);

  console.log('ParentSettings component rendered');
  console.log('User:', user ? 'logged in' : 'not logged in');
  console.log('User object:', JSON.stringify(user, null, 2));
  console.log('Logout function available:', typeof logout);

  // Fetch parent-linked schools
  useEffect(() => {
    const fetchSchools = async () => {
      if (!token) return;

      setLoading(true);
      try {
        const response = await apiClient.get('/api/users/parent/schools', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSchools(response.data.schools || []);
      } catch (error) {
        console.error('Error fetching schools:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, [token]);

  // Fetch user profile if parentCode is missing
  useEffect(() => {
    if (user && !user.parentCode) {
      console.log('Fetching user profile for parentCode');
      // Assuming there's a way to refetch user profile in useAuth
      // For now, this is a placeholder - you may need to implement profile fetching in UserContext
    }
  }, [user]);

  const handleSchoolPress = (school: any) => {
    setSelectedSchool(school);
    setShowSchoolModal(true);
  };

  const handleLogout = () => {
    console.log('handleLogout function called');
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    setIsLoggingOut(true);

    try {
      console.log('Starting logout process');
      await logout();
      console.log('Logout successful');

      setTimeout(() => {
        console.log('Navigating to login');
        router.replace('/(auth)/login');
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const cancelLogout = () => {
    console.log('Logout cancelled');
    setShowLogoutConfirm(false);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>

          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'P'}
                </Text>
              </View>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.fullName || 'Parent'}</Text>
              <Text style={styles.profileEmail}>{user?.email || ''}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'PARENT'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Parent Code Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parent Code</Text>
          <View style={styles.codeCard}>
            <Ionicons name="key" size={20} color="#8B5CF6" style={styles.codeIcon} />
            <View style={styles.codeInfo}>
              <Text style={styles.codeLabel}>Your unique parent code</Text>
              <Text style={styles.codeValue}>{user?.parentCode || 'No code assigned'}</Text>
              <Text style={styles.codeDescription}>
                Share this code with your children's school to link their accounts
              </Text>
            </View>
          </View>
        </View>

        {/* Linked Schools Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Linked Schools</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading schools...</Text>
            </View>
          ) : schools.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="school-outline" size={24} color="#6B7280" />
              <Text style={styles.emptyStateText}>No schools linked yet</Text>
            </View>
          ) : (
            <View>
              {schools.map((school) => (
                <TouchableOpacity
                  key={school.id}
                  style={styles.schoolCard}
                  onPress={() => handleSchoolPress(school)}
                >
                  <View style={styles.schoolInfo}>
                    <Ionicons name="school" size={20} color="#8B5CF6" style={styles.schoolIcon} />
                    <View style={styles.schoolDetails}>
                      <Text style={styles.schoolName}>{school.name}</Text>
                      <Text style={styles.schoolLocation}>
                        {school.city && school.country
                          ? `${school.city}, ${school.country}`
                          : school.city || school.country || 'Location not specified'}
                      </Text>
                      <Text style={styles.schoolCode}>Code: {school.code}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              console.log('Logout button TouchableOpacity pressed');
              handleLogout();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out" size={20} color="#EF4444" />
            <Text style={styles.actionButtonText}>Logout</Text>
            <Ionicons name="chevron-forward" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Spacer for footer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Custom Logout Confirmation Modal */}
      <Modal
        visible={showLogoutConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelLogout}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="log-out" size={32} color="#EF4444" />
            </View>

            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to logout? You'll need to sign in again to access your account.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={cancelLogout}
                disabled={isLoggingOut}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButtonConfirm, isLoggingOut && styles.modalButtonDisabled]}
                onPress={confirmLogout}
                disabled={isLoggingOut}
              >
                <Text style={styles.modalButtonTextConfirm}>
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* School Detail Modal */}
      <Modal
        transparent
        visible={showSchoolModal}
        animationType="fade"
        onRequestClose={() => setShowSchoolModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowSchoolModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>School Details</Text>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => setShowSchoolModal(false)}
                  >
                    <Ionicons name="close" size={20} color="#111827" />
                  </TouchableOpacity>
                </View>
                <View style={styles.modalBody}>
                  {selectedSchool && (
                    <>
                      <View style={styles.detailRow}>
                        <Ionicons name="school" size={20} color="#8B5CF6" style={styles.detailIcon} />
                        <View style={styles.detailContent}>
                          <Text style={styles.detailLabel}>School Name</Text>
                          <Text style={styles.detailValue}>{selectedSchool.name}</Text>
                        </View>
                      </View>
                      <View style={styles.detailRow}>
                        <Ionicons name="key" size={20} color="#8B5CF6" style={styles.detailIcon} />
                        <View style={styles.detailContent}>
                          <Text style={styles.detailLabel}>School Code</Text>
                          <Text style={styles.detailValue}>{selectedSchool.code}</Text>
                        </View>
                      </View>
                      <View style={styles.detailRow}>
                        <Ionicons name="location" size={20} color="#8B5CF6" style={styles.detailIcon} />
                        <View style={styles.detailContent}>
                          <Text style={styles.detailLabel}>City</Text>
                          <Text style={styles.detailValue}>{selectedSchool.city || '-'}</Text>
                        </View>
                      </View>
                      <View style={styles.detailRow}>
                        <Ionicons name="earth" size={20} color="#8B5CF6" style={styles.detailIcon} />
                        <View style={styles.detailContent}>
                          <Text style={styles.detailLabel}>Country</Text>
                          <Text style={styles.detailValue}>{selectedSchool.country || '-'}</Text>
                        </View>
                      </View>
                    </>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.primaryBtn, { marginTop: 12 }]}
                  onPress={() => setShowSchoolModal(false)}
                >
                  <Text style={styles.primaryBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  codeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  codeIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  codeInfo: {
    flex: 1,
  },
  codeLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  codeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  codeDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  // School section styles
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    color: '#6B7280',
    fontSize: 14,
    marginLeft: 8,
  },
  schoolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  schoolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  schoolIcon: {
    marginRight: 12,
  },
  schoolDetails: {
    flex: 1,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  schoolLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  schoolCode: {
    fontSize: 12,
    color: '#8B5CF6',
    fontFamily: 'monospace',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#EF4444',
    marginLeft: 12,
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalBody: {
    width: '100%',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailIcon: {
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  primaryBtn: {
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
    width: '100%',
  },
  primaryBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButtonCancel: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  modalButtonConfirm: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  modalButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  modalButtonTextCancel: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalButtonTextConfirm: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ParentSettings;