/**
 * New Food Item Screen
 * Form for creating a new food item
 */

import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useItems } from '../../src/store/items.context';
import { DatePicker } from '../../src/components/DatePicker';
import { FOOD_CATEGORIES } from '../../src/constants/categories';
import { STORAGE_TYPES } from '../../src/constants/storage-types';
import { Ionicons } from '@expo/vector-icons';
import { s, ms } from '../../src/utils/responsive.utils';

export default function NewFoodItemScreen() {
  const router = useRouter();
  const { createItem } = useItems();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(FOOD_CATEGORIES[0]);
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [quantity, setQuantity] = useState('');
  const [storageType, setStorageType] = useState(STORAGE_TYPES[0]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!category) {
      newErrors.category = 'Category is required';
    }

    if (!storageType) {
      newErrors.storageType = 'Storage type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await createItem({
        name: name.trim(),
        category,
        expiryDate: expiryDate.toISOString().split('T')[0], // YYYY-MM-DD format
        quantity: quantity.trim() || undefined,
        storageType,
      });

      setShowSuccessScreen(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create food item');
    } finally {
      setLoading(false);
    }
  };

  if (showSuccessScreen) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successContent}>
          <Ionicons name="checkmark-circle" size={s(80)} color="#48BB78" style={styles.successIcon} />
          <Text style={styles.successTitle}>Food Item Saved Successfully</Text>
          <Text style={styles.successMessage}>Your food item has been created</Text>
          <TouchableOpacity
            style={styles.successButton}
            onPress={() => router.push('/(tabs)/food-items')}
          >
            <Text style={styles.successButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/food-items')}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Food Item</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={loading}>
          <Text style={[styles.saveButton, loading && styles.saveButtonDisabled]}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Name Input */}
        <View style={styles.field}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Milk, Eggs, Chicken"
            placeholderTextColor="#9CA3AF"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Category Picker */}
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
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
        </View>

        {/* Expiry Date Picker */}
        <DatePicker
          label="Expiry Date *"
          value={expiryDate}
          onChange={setExpiryDate}
          minimumDate={new Date()}
        />

        {/* Quantity Input */}
        <View style={styles.field}>
          <Text style={styles.label}>Quantity (Optional)</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="e.g., 1 liter, 500g, 12 pieces"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Storage Type Picker */}
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
                  style={[styles.storageText, storageType === type && styles.storageTextSelected]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.storageType && <Text style={styles.errorText}>{errors.storageType}</Text>}
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#4FD1C5" />
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
  cancelButton: {
    fontSize: ms(16),
    color: '#9CA3AF',
  },
  saveButton: {
    fontSize: ms(16),
    fontWeight: '600',
    color: '#4FD1C5',
  },
  saveButtonDisabled: {
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: s(16),
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
  inputError: {
    borderColor: '#F56565',
  },
  errorText: {
    fontSize: ms(14),
    color: '#F56565',
    marginTop: s(4),
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
  storageText: {
    fontSize: ms(14),
    fontWeight: '500',
    color: '#E5E7EB',
  },
  storageTextSelected: {
    color: '#4FD1C5',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(18, 18, 18, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
    padding: s(32),
  },
  successIcon: {
    marginBottom: s(16),
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
    paddingVertical: s(14),
    borderRadius: s(8),
  },
  successButtonText: {
    color: '#121212',
    fontSize: ms(16),
    fontWeight: '600',
  },
});
