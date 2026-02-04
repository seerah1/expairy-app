/**
 * Dashboard Screen
 * Overview with statistics and quick insights
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getDashboardOverview,
  DashboardOverview,
  DashboardItem,
} from '../../src/services/dashboard.service';
import { getFoodItems } from '../../src/services/food-items.service';
import { getDocuments } from '../../src/services/documents.service';
import { useItems } from '../../src/store/items.context';
import { s, ms } from '../../src/utils/responsive.utils';
import { calculateRemainingDays } from '../../src/utils/date.utils';

export default function DashboardScreen() {
  const router = useRouter();
  const { items, refreshItems } = useItems();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  // Refresh dashboard when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (!loading) {
        loadDashboard();
      }
    }, [loading])
  );

  // Refresh dashboard when items change
  useEffect(() => {
    if (!loading) {
      loadDashboard();
    }
  }, [items.length]);

  const loadDashboard = async () => {
    try {
      setError(null);
      // Fetch dashboard overview and all items in parallel
      const [data, foodResponse, docResponse] = await Promise.all([
        getDashboardOverview(),
        getFoodItems({ sort: 'expiry_asc' }),
        getDocuments({ sort: 'expiry_asc' }),
      ]);

      // Combine all items for real-time statistics calculation
      const allItems = [
        ...foodResponse.data.map(item => ({ ...item, expiry_date: item.expiry_date })),
        ...docResponse.data.map(doc => ({ ...doc, expiry_date: doc.expiry_date })),
      ];

      // Calculate real-time statistics
      let expired = 0;
      let expiringSoon = 0;
      let safe = 0;

      allItems.forEach(item => {
        const days = calculateRemainingDays(item.expiry_date);
        if (days < 0) {
          expired++;
        } else if (days <= 7) {
          expiringSoon++;
        } else {
          safe++;
        }
      });

      // Update overview with recalculated statistics
      const updatedOverview: DashboardOverview = {
        ...data,
        statistics: {
          total: allItems.length,
          expired,
          expiringSoon,
          safe,
        },
      };

      setOverview(updatedOverview);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshItems();
    await loadDashboard();
    setRefreshing(false);
  };

  const handleStatCardPress = (status: string) => {
    if (status === 'Expired') {
      router.push('/food-items/expired');
    } else if (status === 'Expiring Soon') {
      router.push('/food-items/expiring-soon');
    } else if (status === 'Safe') {
      router.push('/food-items/safe');
    } else {
      router.push('/food-items/all');
    }
  };

  const handleItemPress = (item: DashboardItem) => {
    if (item.item_type === 'food_item') {
      router.push(`/food-items/${item.id}`);
    } else if (item.item_type === 'document') {
      router.push(`/documents/${item.id}`);
    }
  };

  const handleViewAllPress = () => {
    router.push('/food-items/all');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getItemName = (item: DashboardItem) => {
    if (item.item_type === 'food_item') {
      return (item as any).name;
    } else {
      // For documents, type contains the document type (Passport, ID Card, etc.)
      const doc = item as any;
      return `${doc.type} - ${doc.number}`;
    }
  };

  const getItemCategory = (item: DashboardItem) => {
    if (item.item_type === 'food_item') {
      return (item as any).category;
    } else {
      return 'Document';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error || !overview) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Failed to load dashboard'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDashboard}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { statistics, upcomingExpirations, recentlyAdded } = overview;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />
        }
      >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Track your food items at a glance</Text>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsGrid}>
        <TouchableOpacity
          style={[styles.statCard, styles.totalCard]}
          onPress={() => handleStatCardPress('all')}
        >
          <Text style={styles.statValue}>{statistics.total}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statCard, styles.expiredCard]}
          onPress={() => handleStatCardPress('Expired')}
        >
          <Text style={styles.statValue}>{statistics.expired}</Text>
          <Text style={styles.statLabel}>Expired</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statCard, styles.expiringSoonCard]}
          onPress={() => handleStatCardPress('Expiring Soon')}
        >
          <Text style={styles.statValue}>{statistics.expiringSoon}</Text>
          <Text style={styles.statLabel}>Expiring Soon</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statCard, styles.safeCard]}
          onPress={() => handleStatCardPress('Safe')}
        >
          <Text style={styles.statValue}>{statistics.safe}</Text>
          <Text style={styles.statLabel}>Safe</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming Expirations */}
      {upcomingExpirations.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Expirations</Text>
            <TouchableOpacity onPress={handleViewAllPress}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {upcomingExpirations.map((item) => (
            <TouchableOpacity
              key={`${item.item_type}-${item.id}`}
              style={styles.itemCard}
              onPress={() => handleItemPress(item)}
            >
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{getItemName(item)}</Text>
                <Text style={styles.itemCategory}>{getItemCategory(item)}</Text>
              </View>
              <View style={styles.itemExpiry}>
                <Text style={styles.expiryDate}>{formatDate((item as any).expiry_date)}</Text>
                <Text
                  style={[
                    styles.expiryDays,
                    item.status === 'Expired' && styles.expiryDaysExpired,
                    item.status === 'Expiring Soon' && styles.expiryDaysWarning,
                  ]}
                >
                  {(() => {
                    const days = calculateRemainingDays((item as any).expiry_date);
                    if (days < 0) {
                      const absDays = Math.abs(days);
                      return absDays === 1 ? 'Expired yesterday' : `Expired ${absDays} days ago`;
                    }
                    if (days === 0) return 'Expires today';
                    if (days === 1) return 'Tomorrow';
                    return `${days} days`;
                  })()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Recently Added */}
      {recentlyAdded.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Added</Text>
          </View>

          {recentlyAdded.map((item) => (
            <TouchableOpacity
              key={`${item.item_type}-${item.id}`}
              style={styles.itemCard}
              onPress={() => handleItemPress(item)}
            >
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{getItemName(item)}</Text>
                <Text style={styles.itemCategory}>{getItemCategory(item)}</Text>
              </View>
              <View style={styles.itemBadge}>
                <Text style={styles.badgeText}>New</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Empty State */}
      {statistics.total === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Items Yet</Text>
          <Text style={styles.emptyText}>
            Start tracking your food items to see insights and statistics here
          </Text>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/food-items/new')}>
            <Text style={styles.addButtonText}>Add Your First Item</Text>
          </TouchableOpacity>
        </View>
      )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: s(16),
    paddingBottom: s(32),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    marginTop: s(12),
    fontSize: ms(16),
    color: '#9CA3AF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: s(20),
    backgroundColor: '#121212',
  },
  errorText: {
    fontSize: ms(16),
    color: '#F56565',
    marginBottom: s(16),
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4FD1C5',
    paddingHorizontal: s(24),
    paddingVertical: s(12),
    borderRadius: s(8),
  },
  retryButtonText: {
    color: '#121212',
    fontSize: ms(16),
    fontWeight: '600',
  },
  header: {
    marginBottom: s(24),
  },
  title: {
    fontSize: ms(32),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: s(4),
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: ms(16),
    color: '#9CA3AF',
    fontWeight: '400',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(12),
    marginBottom: s(32),
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#1E1E1E',
    borderRadius: s(16),
    padding: s(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  totalCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4FD1C5',
    backgroundColor: 'rgba(79, 209, 197, 0.05)',
  },
  expiredCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F56565',
    backgroundColor: 'rgba(245, 101, 101, 0.05)',
  },
  expiringSoonCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F6E05E',
    backgroundColor: 'rgba(246, 224, 94, 0.05)',
  },
  safeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#48BB78',
    backgroundColor: 'rgba(72, 187, 120, 0.05)',
  },
  statValue: {
    fontSize: ms(36),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: s(6),
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: ms(13),
    color: '#9CA3AF',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: s(28),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: s(16),
    paddingHorizontal: s(4),
  },
  sectionTitle: {
    fontSize: ms(20),
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  viewAllText: {
    fontSize: ms(14),
    fontWeight: '500',
    color: '#4FD1C5',
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: s(12),
    padding: s(16),
    marginBottom: s(10),
    borderWidth: 1,
    borderColor: '#2D2D2D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  itemInfo: {
    flex: 1,
    marginRight: s(12),
  },
  itemName: {
    fontSize: ms(16),
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: s(4),
  },
  itemCategory: {
    fontSize: ms(13),
    color: '#9CA3AF',
    fontWeight: '500',
  },
  itemExpiry: {
    alignItems: 'flex-end',
  },
  expiryDate: {
    fontSize: ms(13),
    fontWeight: '500',
    color: '#E5E7EB',
    marginBottom: s(4),
  },
  expiryDays: {
    fontSize: ms(12),
    fontWeight: '500',
    color: '#48BB78',
    backgroundColor: 'rgba(72, 187, 120, 0.15)',
    paddingHorizontal: s(8),
    paddingVertical: s(3),
    borderRadius: s(6),
  },
  expiryDaysWarning: {
    color: '#F6E05E',
    backgroundColor: 'rgba(246, 224, 94, 0.15)',
  },
  expiryDaysExpired: {
    color: '#F56565',
    backgroundColor: 'rgba(245, 101, 101, 0.15)',
  },
  itemBadge: {
    backgroundColor: 'rgba(79, 209, 197, 0.15)',
    borderRadius: s(8),
    paddingHorizontal: s(10),
    paddingVertical: s(4),
    borderWidth: 1,
    borderColor: 'rgba(79, 209, 197, 0.3)',
  },
  badgeText: {
    fontSize: ms(11),
    fontWeight: '500',
    color: '#4FD1C5',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: s(60),
    paddingHorizontal: s(32),
  },
  emptyTitle: {
    fontSize: ms(22),
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: s(8),
    textAlign: 'center',
  },
  emptyText: {
    fontSize: ms(15),
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: s(28),
    lineHeight: ms(22),
  },
  addButton: {
    backgroundColor: '#4FD1C5',
    paddingHorizontal: s(28),
    paddingVertical: s(14),
    borderRadius: s(12),
    shadowColor: '#4FD1C5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    color: '#121212',
    fontSize: ms(16),
    fontWeight: '500',
  },
});
