/**
 * Profile Screen
 * User profile with details, app version, and logout
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/store/auth.context';
import { ConfirmDialog } from '../../src/components/ConfirmDialog';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { s, ms } from '../../src/utils/responsive.utils';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const handleLogout = async () => {
    setShowLogoutDialog(false);
    setLoading(true);
    try {
      await logout();
      // Navigation handled by root layout
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User Info Card */}
        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.email?.charAt(0).toUpperCase() || 'U'}</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Account Information</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Ionicons name="mail-outline" size={s(18)} color="#9CA3AF" style={styles.infoIcon} />
                <Text style={styles.infoLabel}>Email</Text>
              </View>
              <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
            </View>

            {user?.createdAt && (
              <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <Ionicons
                    name="calendar-outline"
                    size={s(18)}
                    color="#9CA3AF"
                    style={styles.infoIcon}
                  />
                  <Text style={styles.infoLabel}>Member Since</Text>
                </View>
                <Text style={styles.infoValue}>{formatDate(user.createdAt)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* App Info Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>App Information</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Ionicons name="code-outline" size={s(18)} color="#9CA3AF" style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Version</Text>
            </View>
            <Text style={styles.infoValue}>{appVersion}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Ionicons name="apps-outline" size={s(18)} color="#9CA3AF" style={styles.infoIcon} />
              <Text style={styles.infoLabel}>App Name</Text>
            </View>
            <Text style={styles.infoValue}>Expiry Tracker</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setShowLogoutDialog(true)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={styles.logoutButtonContent}>
              <Ionicons
                name="log-out-outline"
                size={s(20)}
                color="#FFFFFF"
                style={styles.logoutIcon}
              />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>

      <ConfirmDialog
        visible={showLogoutDialog}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutDialog(false)}
        destructive
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: s(16),
    paddingBottom: s(32),
  },
  header: {
    marginBottom: s(28),
  },
  title: {
    fontSize: ms(32),
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: s(16),
    padding: s(20),
    marginBottom: s(16),
    borderWidth: 1,
    borderColor: '#2D2D2D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: s(24),
  },
  avatar: {
    width: s(90),
    height: s(90),
    borderRadius: s(45),
    backgroundColor: '#4FD1C5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4FD1C5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: ms(36),
    fontWeight: '600',
    color: '#121212',
  },
  infoSection: {
    marginTop: s(8),
  },
  sectionTitle: {
    fontSize: ms(17),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: s(16),
    letterSpacing: -0.3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: s(14),
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: s(10),
  },
  infoLabel: {
    fontSize: ms(14),
    color: '#9CA3AF',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: ms(14),
    fontWeight: '500',
    color: '#E5E7EB',
    flex: 1,
    textAlign: 'right',
  },
  logoutButton: {
    backgroundColor: '#F56565',
    borderRadius: s(12),
    padding: s(16),
    alignItems: 'center',
    marginTop: s(8),
    shadowColor: '#F56565',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutIcon: {
    marginRight: s(8),
  },
  logoutButtonText: {
    fontSize: ms(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
