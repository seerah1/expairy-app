/**
 * DatePicker Component
 * Cross-platform date picker for selecting expiry dates
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { s, ms } from '../utils/responsive.utils';

interface DatePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  error?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  minimumDate,
  error,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={[styles.input, error && styles.inputError]}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.inputText}>{formatDate(value)}</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {showPicker && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          minimumDate={minimumDate}
          textColor="#FFFFFF"
          themeVariant="dark"
        />
      )}

      {Platform.OS === 'ios' && showPicker && (
        <View style={styles.iosPickerContainer}>
          <View style={styles.iosPickerHeader}>
            <TouchableOpacity onPress={() => setShowPicker(false)}>
              <Text style={styles.iosPickerButton}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: s(16),
  },
  label: {
    fontSize: ms(16),
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: s(8),
  },
  input: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: s(8),
    paddingHorizontal: s(16),
    paddingVertical: s(12),
  },
  inputError: {
    borderColor: '#F56565',
  },
  inputText: {
    fontSize: ms(16),
    color: '#E5E7EB',
  },
  icon: {
    fontSize: ms(20),
  },
  errorText: {
    fontSize: ms(14),
    color: '#F56565',
    marginTop: s(4),
  },
  iosPickerContainer: {
    backgroundColor: '#1E1E1E',
    borderTopWidth: 1,
    borderTopColor: '#3D3D3D',
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: s(12),
  },
  iosPickerButton: {
    fontSize: ms(16),
    fontWeight: '600',
    color: '#4FD1C5',
  },
});
