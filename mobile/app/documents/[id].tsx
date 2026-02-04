/**
 * Document Detail/Edit Screen
 * View and edit document details with file viewer
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
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getDocument, updateDocument, deleteDocument } from '../../src/services/documents.service';
import { Document } from '../../src/types/document.types';
import { DatePicker } from '../../src/components/DatePicker';
import { FileUploader } from '../../src/components/FileUploader';
import { ConfirmDialog } from '../../src/components/ConfirmDialog';
import { DOCUMENT_TYPES } from '../../src/constants/document-types';
import { getToken } from '../../src/utils/storage.utils';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { s, ms } from '../../src/utils/responsive.utils';
import { calculateRemainingDays } from '../../src/utils/date.utils';

export default function DocumentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [document, setDocument] = useState<Document | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  const [type, setType] = useState('');
  const [number, setNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [issueDate, setIssueDate] = useState<Date | null>(null);
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    type: string;
    size: number;
  } | null>(null);

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    try {
      const doc = await getDocument(Number(id));
      console.log('Loaded document:', doc);
      console.log('File info:', {
        file_name: doc.file_name,
        file_path: doc.file_path,
        file_size: doc.file_size,
      });
      setDocument(doc);
      setType(doc.type);
      setNumber(doc.number);
      setExpiryDate(new Date(doc.expiry_date));
      setIssueDate(doc.issue_date ? new Date(doc.issue_date) : null);
      setIssuingAuthority(doc.issuing_authority || '');
      setNotes(doc.notes || '');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load document', [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to documents tab instead of going back
            router.push('/(tabs)/documents');
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedDoc = await updateDocument(
        Number(id),
        {
          type,
          number: number.trim(),
          expiryDate: expiryDate.toISOString().split('T')[0],
          issueDate: issueDate ? issueDate.toISOString().split('T')[0] : undefined,
          issuingAuthority: issuingAuthority.trim() || undefined,
          notes: notes.trim() || undefined,
        },
        selectedFile || undefined
      );

      // Update local state with the returned document
      setDocument(updatedDoc);

      // Exit edit mode and clear selected file
      setEditing(false);
      setSelectedFile(null);

      // Show success screen
      setShowSuccessScreen(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update document');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteDialog(false);
    setLoading(true);
    try {
      await deleteDocument(Number(id));
      // Clear the document to trigger "not found" screen
      setDocument(null);
      setLoading(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete document');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (document) {
      setType(document.type);
      setNumber(document.number);
      setExpiryDate(new Date(document.expiry_date));
      setIssueDate(document.issue_date ? new Date(document.issue_date) : null);
      setIssuingAuthority(document.issuing_authority || '');
      setNotes(document.notes || '');
      setSelectedFile(null);
    }
    setEditing(false);
  };

  const handleDownloadFile = async () => {
    if (!document?.file_path || !document?.file_name) {
      Alert.alert('Error', 'No file attached to this document');
      return;
    }

    try {
      setLoading(true);

      // Get API URL and token
      const API_URL =
        Constants.expoConfig?.extra?.apiUrl ||
        process.env.EXPO_PUBLIC_API_URL ||
        'http://localhost:3000/api';
      const token = await getToken();

      if (!token) {
        Alert.alert('Error', 'You must be logged in to download files');
        setLoading(false);
        return;
      }

      const downloadUrl = `${API_URL}/documents/${id}/download`;

      if (Platform.OS === 'web') {
        // For web, fetch and trigger download
        try {
          const response = await fetch(downloadUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to download file');
          }

          const blob = await response.blob();

          // Create a temporary URL for the blob
          const blobUrl = URL.createObjectURL(blob);

          // Create a link and trigger download
          const link = window.document.createElement('a');
          link.href = blobUrl;
          link.download = document.file_name;
          link.style.display = 'none';

          window.document.body.appendChild(link);
          link.click();
          window.document.body.removeChild(link);

          // Clean up the blob URL
          setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

          Alert.alert('Success', 'File downloaded successfully');
        } catch (error) {
          console.error('Web download error:', error);
          throw error;
        }
      } else {
        // For mobile, use FileSystem to download and share
        const fileUri = `${FileSystem.cacheDirectory}${document.file_name}`;

        const downloadResult = await FileSystem.downloadAsync(downloadUrl, fileUri, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (downloadResult.status === 200) {
          const isAvailable = await Sharing.isAvailableAsync();

          if (isAvailable) {
            await Sharing.shareAsync(downloadResult.uri, {
              mimeType: document.file_name.endsWith('.pdf') ? 'application/pdf' : 'image/*',
              dialogTitle: 'Open file with',
            });
          } else {
            Alert.alert('Success', `File saved to: ${downloadResult.uri}`);
          }
        } else {
          Alert.alert('Error', 'Failed to download file');
        }
      }
    } catch (error: any) {
      console.error('Error downloading file:', error);
      Alert.alert('Error', error.message || 'Failed to download file');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Expired':
        return '#F56565';
      case 'Expiring Soon':
        return '#F6E05E';
      case 'Safe':
        return '#48BB78';
      default:
        return '#6B7280';
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

  if (loading && !document) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4FD1C5" />
        <Text style={styles.loadingText}>Loading document...</Text>
      </View>
    );
  }

  if (showSuccessScreen) {
    return (
      <View style={styles.successContainer}>
        <Ionicons name="checkmark-circle" size={s(80)} color="#48BB78" style={styles.successIcon} />
        <Text style={styles.successTitle}>Document Saved Successfully</Text>
        <Text style={styles.successMessage}>Your document has been updated</Text>
        <TouchableOpacity
          style={styles.successButton}
          onPress={() => router.push('/(tabs)/documents')}
        >
          <Text style={styles.successButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!document) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Document not found</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => router.push('/(tabs)/documents')}
        >
          <Text style={styles.errorButtonText}>Go to Documents</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/documents')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Document</Text>
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
              <View
                style={[styles.statusBadge, { backgroundColor: getStatusColor(document.status) }]}
              >
                <Text style={styles.statusText}>
                  {(() => {
                    const days = calculateRemainingDays(document.expiry_date);
                    if (days < 0) {
                      const absDays = Math.abs(days);
                      return absDays === 1 ? 'Expired yesterday' : `Expired ${absDays} days ago`;
                    }
                    if (days === 0) return 'Expires today';
                    if (days === 1) return 'Expires tomorrow';
                    return `${days} days left`;
                  })()}
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.documentType}>{document.type}</Text>
              <Text style={styles.documentNumber}>{document.number}</Text>
            </View>

            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Expiry Date</Text>
                <Text style={styles.detailValue}>{formatDate(document.expiry_date)}</Text>
              </View>

              {document.issue_date && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Issue Date</Text>
                  <Text style={styles.detailValue}>{formatDate(document.issue_date)}</Text>
                </View>
              )}

              {document.issuing_authority && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Issuing Authority</Text>
                  <Text style={styles.detailValue}>{document.issuing_authority}</Text>
                </View>
              )}

              {document.notes && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Notes</Text>
                  <Text style={styles.detailValue}>{document.notes}</Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Created</Text>
                <Text style={styles.detailValue}>
                  {new Date(document.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>

            {document.file_name && (
              <View style={styles.fileCard}>
                <Text style={styles.fileLabel}>Attached File</Text>
                <TouchableOpacity
                  style={styles.fileButton}
                  onPress={handleDownloadFile}
                  activeOpacity={0.7}
                >
                  <Text style={styles.fileIcon}>File</Text>
                  <View style={styles.fileNameContainer}>
                    <Text style={styles.fileName}>{document.file_name}</Text>
                    <Text style={styles.fileSizeText}>
                      {document.file_size ? `${(document.file_size / 1024).toFixed(1)} KB` : ''}
                    </Text>
                  </View>
                  <View style={styles.downloadIconContainer}>
                    <Text style={styles.downloadIcon}>DL</Text>
                    <Text style={styles.downloadText}>Download</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.deleteButton} onPress={() => setShowDeleteDialog(true)}>
              <Text style={styles.deleteButtonText}>Delete Document</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Edit Mode
          <View>
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
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Document Number *</Text>
              <TextInput
                style={styles.input}
                value={number}
                onChangeText={setNumber}
                placeholder="Document number"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <DatePicker
              label="Expiry Date *"
              value={expiryDate}
              onChange={setExpiryDate}
              minimumDate={new Date()}
            />

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

            <FileUploader
              onFileSelected={setSelectedFile}
              currentFile={
                selectedFile ||
                (document.file_name
                  ? { name: document.file_name, size: document.file_size || 0 }
                  : null)
              }
              onRemoveFile={() => setSelectedFile(null)}
            />

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
        title="Delete Document"
        message={`Are you sure you want to delete "${document.type} - ${document.number}"? This action cannot be undone and all scheduled notifications will be cancelled.`}
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
  statusContainer: {
    marginBottom: s(16),
  },
  statusBadge: {
    paddingHorizontal: s(16),
    paddingVertical: s(8),
    borderRadius: s(12),
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: ms(14),
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: s(12),
    padding: s(20),
    marginBottom: s(16),
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  documentType: {
    fontSize: ms(24),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: s(4),
  },
  documentNumber: {
    fontSize: ms(16),
    color: '#9CA3AF',
  },
  detailsCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: s(12),
    padding: s(16),
    marginBottom: s(16),
    borderWidth: 1,
    borderColor: '#2D2D2D',
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
    flex: 1,
    textAlign: 'right',
  },
  fileCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: s(12),
    padding: s(16),
    marginBottom: s(16),
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  fileLabel: {
    fontSize: ms(16),
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: s(12),
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
    borderWidth: 1,
    borderColor: '#4FD1C5',
    borderRadius: s(8),
    padding: s(16),
  },
  fileIcon: {
    fontSize: ms(14),
    fontWeight: '600',
    color: '#4FD1C5',
    marginRight: s(12),
  },
  fileNameContainer: {
    flex: 1,
  },
  fileName: {
    fontSize: ms(14),
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: s(2),
  },
  fileSizeText: {
    fontSize: ms(12),
    color: '#9CA3AF',
  },
  downloadIconContainer: {
    alignItems: 'center',
    marginLeft: s(12),
  },
  downloadIcon: {
    fontSize: ms(14),
    fontWeight: '600',
    color: '#4FD1C5',
  },
  downloadText: {
    fontSize: ms(10),
    fontWeight: '600',
    color: '#4FD1C5',
    marginTop: s(2),
  },
  deleteButton: {
    backgroundColor: 'rgba(245, 101, 101, 0.1)',
    borderWidth: 1,
    borderColor: '#F56565',
    borderRadius: s(8),
    padding: s(16),
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: ms(16),
    fontWeight: '600',
    color: '#F56565',
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
  textArea: {
    minHeight: s(100),
    paddingTop: s(12),
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
});
