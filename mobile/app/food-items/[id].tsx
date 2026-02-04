/**
 * Food Item Detail/Edit Screen
 * View and edit food item details
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useItems } from '../../src/store/items.context';
import { DatePicker } from '../../src/components/DatePicker';
import { StatusBadge } from '../../src/components/StatusBadge';
import { ConfirmDialog } from '../../src/components/ConfirmDialog';
import { FOOD_CATEGORIES } from '../../src/constants/categories';
import { STORAGE_TYPES } from '../../src/constants/storage-types';
import { Ionicons } from '@expo/vector-icons';
import { s, ms } from '../../src/utils/responsive.utils';

export default function FoodItemDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getItemById, updateItem, deleteItem } = useItems();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  const [item, setItem] = useState(getItemById(Number(id)));

  const [name, setName] = useState(item?.name || '');
  const [category, setCategory] = useState(item?.category || FOOD_CATEGORIES[0]);
  const [expiryDate, setExpiryDate] = useState(item ? new Date(item.expiry_date) : new Date());
  const [quantity, setQuantity] = useState(item?.quantity || '');
  const [storageType, setStorageType] = useState(item?.storage_type || STORAGE_TYPES[0]);

  useEffect(() => {
    const currentItem = getItemById(Number(id));
    if (currentItem) {
      setItem(currentItem);
      setName(currentItem.name);
      setCategory(currentItem.category);
      setExpiryDate(new Date(currentItem.expiry_date));
      setQuantity(currentItem.quantity || '');
      setStorageType(currentItem.storage_type);
    }
  }, [id, getItemById]);

  if (showSuccessScreen) {
    return (
      <View style={styles.successContainer}>
        <Ionicons name="checkmark-circle" size={s(80)} color="#48BB78" style={styles.successIcon} />
        <Text style={styles.successTitle}>Food Item Saved Successfully</Text>
        <Text style={styles.successMessage}>Your food item has been updated</Text>
        <TouchableOpacity
          style={styles.successButton}
          onPress={() => router.push('/(tabs)/food-items')}
        >
          <Text style={styles.successButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Item not found</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => router.push('/(tabs)/food-items')}
        >
          <Text style={styles.errorButtonText}>Go to Food Items</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateItem(Number(id), {
        name: name.trim(),
        category,
        expiryDate: expiryDate.toISOString().split('T')[0],
        quantity: quantity.trim() || undefined,
        storageType,
      });

      setEditing(false);

      // Show success screen
      setShowSuccessScreen(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update food item');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteDialog(false);
    setLoading(true);
    try {
      await deleteItem(Number(id));
      // Clear the item to trigger "not found" screen
      setItem(null);
      setLoading(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete food item');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(item.name);
    setCategory(item.category);
    setExpiryDate(new Date(item.expiry_date));
    setQuantity(item.quantity || '');
    setStorageType(item.storage_type);
    setEditing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/food-items')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Food Item</Text>
        {!editing ? (
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Text style={styles.editButton}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {!editing ? (
          // View Mode
          <View>
            <View style={styles.statusContainer}>
              <StatusBadge expiryDate={item.expiry_date} />
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemCategory}>{item.category}</Text>
            </View>

            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Expiry Date</Text>
                <Text style={styles.detailValue}>
                  {new Date(item.expiry_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>

              {item.quantity && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Quantity</Text>
                  <Text style={styles.detailValue}>{item.quantity}</Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Storage</Text>
                <Text style={styles.detailValue}>{item.storage_type}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Added</Text>
                <Text style={styles.detailValue}>
                  {new Date(item.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.deleteButton} onPress={() => setShowDeleteDialog(true)}>
              <Text style={styles.deleteButtonText}>Delete Item</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Edit Mode
          <View>
            <View style={styles.field}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Item name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Category *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipContainer}
              >
                {FOOD_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, category === cat && styles.chipSelected]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.chipText, category === cat && styles.chipTextSelected]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <DatePicker
              label="Expiry Date *"
              value={expiryDate}
              onChange={setExpiryDate}
              minimumDate={new Date()}
            />

            <View style={styles.field}>
              <Text style={styles.label}>Quantity (Optional)</Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="e.g., 1 liter, 500g"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Storage Type *</Text>
              <View style={styles.storageGrid}>
                {STORAGE_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.storageCard, storageType === type && styles.storageCardSelected]}
                    onPress={() => setStorageType(type)}
                  >
                    <Text
                      style={[
                        styles.storageText,
                        storageType === type && styles.storageTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <ConfirmDialog
        visible={showDeleteDialog}
        title="Delete Food Item"
        message={`Are you sure you want to delete "${item.name}"? This action cannot be undone and all scheduled notifications will be cancelled.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(16),
    paddingVertical: s(16),
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  title: {
    fontSize: ms(18),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backButton: {
    fontSize: ms(16),
    color: '#4FD1C5',
  },
  editButton: {
    fontSize: ms(16),
    fontWeight: '600',
    color: '#4FD1C5',
  },
  cancelButton: {
    fontSize: ms(16),
    color: '#9CA3AF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: s(16),
  },
  statusContainer: {
    marginBottom: s(16),
  },
  infoCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: s(12),
    padding: s(20),
    marginBottom: s(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  itemName: {
    fontSize: ms(24),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: s(4),
  },
  itemCategory: {
    fontSize: ms(16),
    color: '#9CA3AF',
  },
  detailsCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: s(12),
    padding: s(16),
    marginBottom: s(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: s(12),
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  detailLabel: {
    fontSize: ms(16),
    color: '#9CA3AF',
  },
  detailValue: {
    fontSize: ms(16),
    fontWeight: '500',
    color: '#E5E7EB',
  },
  deleteButton: {
    backgroundColor: '#2D2D2D',
    borderRadius: s(8),
    padding: s(16),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F56565',
  },
  deleteButtonText: {
    fontSize: ms(16),
    fontWeight: '600',
    color: '#F56565',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: s(20),
    backgroundColor: '#121212',
  },
  errorText: {
    fontSize: ms(18),
    color: '#9CA3AF',
    marginBottom: s(16),
  },
  errorButton: {
    backgroundColor: '#4FD1C5',
    paddingHorizontal: s(24),
    paddingVertical: s(12),
    borderRadius: s(8),
  },
  errorButtonText: {
    fontSize: ms(16),
    fontWeight: '600',
    color: '#121212',
  },
  field: {
    marginBottom: s(20),
  },
  label: {
    fontSize: ms(16),
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: s(8),
  },
  input: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: s(8),
    paddingHorizontal: s(16),
    paddingVertical: s(12),
    fontSize: ms(16),
    color: '#FFFFFF',
  },
  chipContainer: {
    flexDirection: 'row',
    marginTop: s(8),
  },
  chip: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: s(20),
    paddingHorizontal: s(16),
    paddingVertical: s(8),
    marginRight: s(8),
  },
  chipSelected: {
    backgroundColor: '#4FD1C5',
    borderColor: '#4FD1C5',
  },
  chipText: {
    fontSize: ms(14),
    color: '#E5E7EB',
  },
  chipTextSelected: {
    color: '#121212',
  },
  storageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(12),
  },
  storageCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1E1E1E',
    borderWidth: 2,
    borderColor: '#3D3D3D',
    borderRadius: s(12),
    padding: s(16),
    alignItems: 'center',
  },
  storageCardSelected: {
    borderColor: '#4FD1C5',
    backgroundColor: '#2D3748',
  },
  storageEmoji: {
    fontSize: ms(32),
    marginBottom: s(8),
  },
  storageText: {
    fontSize: ms(14),
    fontWeight: '500',
    color: '#E5E7EB',
  },
  storageTextSelected: {
    color: '#4FD1C5',
  },
  saveButton: {
    backgroundColor: '#4FD1C5',
    borderRadius: s(8),
    padding: s(16),
    alignItems: 'center',
    marginTop: s(8),
  },
  saveButtonText: {
    fontSize: ms(16),
    fontWeight: '600',
    color: '#121212',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: s(20),
    backgroundColor: '#121212',
  },
  successIcon: {
    marginBottom: s(24),
  },
  successTitle: {
    fontSize: ms(24),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: s(8),
    textAlign: 'center',
  },
  successMessage: {
    fontSize: ms(16),
    color: '#9CA3AF',
    marginBottom: s(32),
    textAlign: 'center',
  },
  successButton: {
    backgroundColor: '#4FD1C5',
    paddingHorizontal: s(32),
    paddingVertical: s(12),
    borderRadius: s(8),
  },
  successButtonText: {
    color: '#121212',
    fontSize: ms(16),
    fontWeight: '600',
  },
});
