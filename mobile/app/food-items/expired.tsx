/**
 * Expired Items Screen
 * Shows expired food items AND documents
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFoodItems } from '../../src/services/food-items.service';
import { getDocuments } from '../../src/services/documents.service';
import { FoodItem } from '../../src/types/food-item.types';
import { Document } from '../../src/types/document.types';
import { StatusBadge } from '../../src/components/StatusBadge';
import { s, ms } from '../../src/utils/responsive.utils';
import { calculateRemainingDays } from '../../src/utils/date.utils';

// Combined type for food items and documents
type CombinedItem = (FoodItem & { item_type: 'food' }) | (Document & { item_type: 'document' });

export default function ExpiredItemsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<CombinedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setError(null);
      // Fetch ALL items (not filtered by status) to filter on frontend with real-time calculation
      const [foodResponse, docResponse] = await Promise.all([
        getFoodItems({ sort: 'expiry_asc' }),
        getDocuments({ sort: 'expiry_asc' }),
      ]);

      // Combine and add item_type to differentiate
      const foodItems: CombinedItem[] = foodResponse.data.map(item => ({ ...item, item_type: 'food' as const }));
      const documents: CombinedItem[] = docResponse.data.map(doc => ({ ...doc, item_type: 'document' as const }));

      // Combine all items
      const allItems = [...foodItems, ...documents];

      // Filter expired items on frontend (real-time calculation)
      const expiredItems = allItems.filter(item => calculateRemainingDays(item.expiry_date) < 0);

      // Sort by expiry date (most recently expired first)
      const sorted = expiredItems.sort((a, b) =>
        new Date(b.expiry_date).getTime() - new Date(a.expiry_date).getTime()
      );

      setItems(sorted);
    } catch (err: any) {
      setError(err.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const handleItemPress = (item: CombinedItem) => {
    if (item.item_type === 'document') {
      router.push(`/documents/${item.id}`);
    } else {
      router.push(`/food-items/${item.id}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderItem = ({ item }: { item: CombinedItem }) => {
    const isDocument = item.item_type === 'document';
    const displayName = isDocument ? (item as Document & { item_type: 'document' }).type : (item as FoodItem & { item_type: 'food' }).name;
    const subtitle = isDocument
      ? `Document #${(item as Document & { item_type: 'document' }).number}`
      : (item as FoodItem & { item_type: 'food' }).category;
    const detailInfo = isDocument
      ? `Type: ${(item as Document & { item_type: 'document' }).type}`
      : `Storage: ${(item as FoodItem & { item_type: 'food' }).storage_type}`;

    return (
      <TouchableOpacity
        style={[styles.itemCard, styles.expiredCard]}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.itemName}>{displayName}</Text>
              {isDocument && <Text style={styles.itemTypeBadge}>DOC</Text>}
            </View>
            <Text style={styles.itemCategory}>{subtitle}</Text>
          </View>
          <StatusBadge expiryDate={item.expiry_date} />
        </View>
        <View style={styles.itemDetails}>
          <Text style={styles.detailText}>Expired: {formatDate(item.expiry_date)}</Text>
          <Text style={styles.detailText}>{detailInfo}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Expired Items</Text>
      <Text style={styles.emptyText}>Great! You don't have any expired items</Text>
      <TouchableOpacity style={styles.goBackButton} onPress={() => router.back()}>
        <Text style={styles.goBackButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={styles.loadingText}>Loading expired items...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadItems}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Expired Items</Text>
        <Text style={styles.count}>{items.length}</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => `${item.item_type}-${item.id}`}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, items.length === 0 && styles.listContentEmpty]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#EF4444']}
            tintColor="#EF4444"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(20),
    paddingVertical: s(20),
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  backButton: {
    fontSize: ms(16),
    color: '#F56565',
    fontWeight: '600',
  },
  title: {
    fontSize: ms(22),
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  count: {
    fontSize: ms(15),
    fontWeight: '600',
    color: '#F56565',
    backgroundColor: 'rgba(245, 101, 101, 0.15)',
    paddingHorizontal: s(12),
    paddingVertical: s(6),
    borderRadius: s(10),
    borderWidth: 1,
    borderColor: 'rgba(245, 101, 101, 0.3)',
  },
  listContent: {
    padding: s(16),
    paddingBottom: s(32),
  },
  listContentEmpty: {
    flexGrow: 1,
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
    backgroundColor: '#F56565',
    paddingHorizontal: s(24),
    paddingVertical: s(12),
    borderRadius: s(10),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: ms(16),
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: s(12),
    padding: s(16),
    marginBottom: s(12),
    borderLeftWidth: 4,
    borderLeftColor: '#F56565',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  expiredCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F56565',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: s(12),
  },
  itemInfo: {
    flex: 1,
    marginRight: s(12),
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
  },
  itemName: {
    fontSize: ms(17),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: s(3),
    letterSpacing: -0.3,
  },
  itemTypeBadge: {
    fontSize: ms(10),
    fontWeight: '700',
    color: '#9333EA',
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    paddingHorizontal: s(6),
    paddingVertical: s(2),
    borderRadius: s(4),
    overflow: 'hidden',
    marginBottom: s(3),
  },
  itemCategory: {
    fontSize: ms(13),
    color: '#9CA3AF',
    fontWeight: '500',
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: ms(13),
    color: '#9CA3AF',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: s(32),
  },
  emptyTitle: {
    fontSize: ms(22),
    fontWeight: '600',
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
  goBackButton: {
    backgroundColor: '#F56565',
    paddingHorizontal: s(28),
    paddingVertical: s(14),
    borderRadius: s(12),
    shadowColor: '#F56565',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  goBackButtonText: {
    color: '#FFFFFF',
    fontSize: ms(16),
    fontWeight: '600',
  },
});
