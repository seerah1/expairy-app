/**
 * ItemCard Component
 * Displays food item information in a card format
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FoodItem } from '../types/food-item.types';
import { StatusBadge } from './StatusBadge';
import { s, ms } from '../utils/responsive.utils';

interface ItemCardProps {
  item: FoodItem;
  onPress: (item: FoodItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onPress }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(item)} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.category}>{item.category}</Text>
          </View>
        </View>
        <StatusBadge expiryDate={item.expiry_date} />
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Expires:</Text>
          <Text style={styles.detailValue}>{formatDate(item.expiry_date)}</Text>
        </View>

        {item.quantity && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Quantity:</Text>
            <Text style={styles.detailValue}>{item.quantity}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Storage:</Text>
          <Text style={styles.detailValue}>{item.storage_type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: s(12),
    padding: s(16),
    marginBottom: s(12),
    borderLeftWidth: 4,
    borderLeftColor: '#4FD1C5',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: s(12),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: s(8),
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: ms(17),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: s(3),
    letterSpacing: -0.3,
  },
  category: {
    fontSize: ms(13),
    color: '#9CA3AF',
    fontWeight: '500',
  },
  details: {
    gap: s(8),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: ms(13),
    color: '#9CA3AF',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: ms(13),
    color: '#E5E7EB',
    fontWeight: '500',
  },
});
