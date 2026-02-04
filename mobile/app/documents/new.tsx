/**
 * New Document Screen
 * Form for creating a new document
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
import { createDocument } from '../../src/services/documents.service';
import { DatePicker } from '../../src/components/DatePicker';
import { FileUploader } from '../../src/components/FileUploader';
import { DOCUMENT_TYPES } from '../../src/constants/document-types';
import { Ionicons } from '@expo/vector-icons';
import { s, ms } from '../../src/utils/responsive.utils';

export default function NewDocumentScreen() {
  const router = useRouter();

  const [type, setType] = useState(DOCUMENT_TYPES[0]);
  const [number, setNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [issueDate, setIssueDate] = useState<Date | null>(null);
  const [showIssueDatePicker, setShowIssueDatePicker] = useState(false);
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    type: string;
    size: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!type) {
      newErrors.type = 'Document type is required';
    }

    if (!number.trim()) {
      newErrors.number = 'Document number is required';
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
      const documentData = {
        type,
        number: number.trim(),
        expiryDate: expiryDate.toISOString().split('T')[0],
        issueDate:
          showIssueDatePicker && issueDate ? issueDate.toISOString().split('T')[0] : undefined,
        issuingAuthority: issuingAuthority.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      console.log('Submitting document data:', documentData);
      console.log('Selected file:', selectedFile);

      const createdDoc = await createDocument(documentData, selectedFile || undefined);

      console.log('Document created successfully:', createdDoc);

      setShowSuccessScreen(true);
    } catch (error: any) {
      console.error('Document creation error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));

      let errorMessage = error.message || 'Failed to create document';

      // If there are validation errors, show them in detail
      if (error.errors && Array.isArray(error.errors)) {
        console.error('Validation errors:', error.errors);
        const errorDetails = error.errors
          .map((e: any) => {
            if (e.field && e.message) {
              return `• ${e.field}: ${e.message}`;
            }
            return `• ${e.msg || e.message || JSON.stringify(e)}`;
          })
          .join('\n');
        errorMessage = `Validation errors:\n${errorDetails}`;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (showSuccessScreen) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successContent}>
          <Ionicons name="checkmark-circle" size={s(80)} color="#48BB78" style={styles.successIcon} />
          <Text style={styles.successTitle}>Document Saved Successfully</Text>
          <Text style={styles.successMessage}>Your document has been created</Text>
          <TouchableOpacity
            style={styles.successButton}
            onPress={() => router.push('/(tabs)/documents')}
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
        <TouchableOpacity onPress={() => router.push('/(tabs)/documents')}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Document</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={loading}>
          <Text style={[styles.saveButton, loading && styles.saveButtonDisabled]}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Document Type Picker */}
        <View style={styles.field}>
          <Text style={styles.label}>Document Type *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipContainer}
          >
            {DOCUMENT_TYPES.map((docType) => (
              <TouchableOpacity
                key={docType}
                style={[styles.chip, type === docType && styles.chipSelected]}
                onPress={() => setType(docType)}
              >
                <Text style={[styles.chipText, type === docType && styles.chipTextSelected]}>
                  {docType}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
        </View>

        {/* Document Number Input */}
        <View style={styles.field}>
          <Text style={styles.label}>Document Number *</Text>
          <TextInput
            style={[styles.input, errors.number && styles.inputError]}
            value={number}
            onChangeText={setNumber}
            placeholder="e.g., AB123456"
            placeholderTextColor="#9CA3AF"
          />
          {errors.number && <Text style={styles.errorText}>{errors.number}</Text>}
        </View>

        {/* Expiry Date Picker */}
        <DatePicker
          label="Expiry Date *"
          value={expiryDate}
          onChange={setExpiryDate}
          minimumDate={new Date()}
        />

        {/* Issue Date Picker */}
        <View style={styles.field}>
          <Text style={styles.label}>Issue Date (Optional)</Text>
          {!showIssueDatePicker ? (
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                // Set default issue date to 1 year before expiry date
                const defaultIssueDate = new Date(expiryDate);
                defaultIssueDate.setFullYear(defaultIssueDate.getFullYear() - 1);
                setIssueDate(defaultIssueDate);
                setShowIssueDatePicker(true);
              }}
            >
              <Text style={styles.dateButtonText}>Tap to add issue date</Text>
            </TouchableOpacity>
          ) : (
            <>
              <DatePicker
                label=""
                value={issueDate || new Date()}
                onChange={setIssueDate}
                maximumDate={expiryDate}
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => {
                  setIssueDate(null);
                  setShowIssueDatePicker(false);
                }}
              >
                <Text style={styles.removeButtonText}>Remove Issue Date</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Issuing Authority Input */}
        <View style={styles.field}>
          <Text style={styles.label}>Issuing Authority (Optional)</Text>
          <TextInput
            style={styles.input}
            value={issuingAuthority}
            onChangeText={setIssuingAuthority}
            placeholder="e.g., Department of State"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Notes Input */}
        <View style={styles.field}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any additional notes..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* File Uploader */}
        <FileUploader
          onFileSelected={setSelectedFile}
          currentFile={selectedFile}
          onRemoveFile={() => setSelectedFile(null)}
        />

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
  textArea: {
    minHeight: s(100),
    paddingTop: s(12),
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
  dateButton: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: s(8),
    paddingHorizontal: s(16),
    paddingVertical: s(12),
  },
  dateButtonText: {
    fontSize: ms(16),
    color: '#E5E7EB',
  },
  removeButton: {
    marginTop: s(8),
    paddingVertical: s(8),
    paddingHorizontal: s(12),
    backgroundColor: '#2D2D2D',
    borderRadius: s(6),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F56565',
  },
  removeButtonText: {
    fontSize: ms(14),
    fontWeight: '500',
    color: '#F56565',
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
