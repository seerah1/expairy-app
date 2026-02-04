/**
 * Food Items List Screen
 * Displays all food items with filtering and sorting options
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
import { useItems } from '../../src/store/items.context';
import { ItemCard } from '../../src/components/ItemCard';
import { FoodItem } from '../../src/types/food-item.types';
import { s, ms } from '../../src/utils/responsive.utils';

export default function FoodItemsScreen() {
  const router = useRouter();
  const { items, loading, error, refreshItems } = useItems();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refreshItems();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshItems();
    setRefreshing(false);
  };

  const handleItemPress = (item: FoodItem) => {
    router.push(`/food-items/${item.id}`);
  };

  const handleAddPress = () => {
    router.push('/food-items/new');
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Food Items Yet</Text>
      <Text style={styles.emptyText}>
        Start tracking your food items to prevent waste and get expiry reminders
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddPress}>
        <Text style={styles.emptyButtonText}>Add Your First Item</Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={refreshItems}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && items.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4FD1C5" />
        <Text style={styles.loadingText}>Loading items...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Food Items</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {error && !loading && renderError()}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ItemCard item={item} onPress={handleItemPress} />}
        contentContainerStyle={[styles.listContent, items.length === 0 && styles.listContentEmpty]}
        ListEmptyComponent={!loading && !error ? renderEmptyState : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4FD1C5']}
            tintColor="#4FD1C5"
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
  title: {
    fontSize: ms(28),
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  addButton: {
    backgroundColor: '#4FD1C5',
    paddingHorizontal: s(18),
    paddingVertical: s(10),
    borderRadius: s(10),
    shadowColor: '#4FD1C5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#121212',
    fontSize: ms(15),
    fontWeight: '600',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyButton: {
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
  emptyButtonText: {
    color: '#121212',
    fontSize: ms(16),
    fontWeight: '600',
  },
  errorContainer: {
    padding: s(16),
    backgroundColor: 'rgba(245, 101, 101, 0.1)',
    marginHorizontal: s(16),
    marginTop: s(16),
    borderRadius: s(12),
    borderLeftWidth: 4,
    borderLeftColor: '#F56565',
    borderWidth: 1,
    borderColor: 'rgba(245, 101, 101, 0.2)',
  },
  errorText: {
    color: '#F56565',
    fontSize: ms(14),
    marginBottom: s(12),
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#F56565',
    paddingHorizontal: s(16),
    paddingVertical: s(10),
    borderRadius: s(8),
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: ms(14),
    fontWeight: '600',
  },
});
