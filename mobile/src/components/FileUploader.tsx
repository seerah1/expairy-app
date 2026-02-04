/**
 * FileUploader Component
 * Handles file selection and upload for documents
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { s, ms } from '../utils/responsive.utils';

interface FileUploaderProps {
  onFileSelected: (file: { uri: string; name: string; type: string; size: number }) => void;
  currentFile?: { name: string; size: number } | null;
  onRemoveFile?: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelected,
  currentFile,
  onRemoveFile,
}) => {
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    type: string;
    size: number;
  } | null>(null);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any, // Using string to avoid deprecation warning
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const file = {
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
          size: asset.fileSize || 0,
        };

        setSelectedFile(file);
        onFileSelected(file);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'image/*',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const file = {
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/octet-stream',
          size: asset.size || 0,
        };

        setSelectedFile(file);
        onFileSelected(file);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (onRemoveFile) {
      onRemoveFile();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const displayFile = selectedFile || currentFile;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Attach File (Optional)</Text>

      {!displayFile ? (
        <View style={styles.uploadOptions}>
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Text style={styles.uploadText}>Choose Image</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
            <Text style={styles.uploadText}>Choose Document</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.filePreview}>
          <View style={styles.fileInfo}>
            <View style={styles.fileDetails}>
              <Text style={styles.fileName} numberOfLines={1}>
                {displayFile.name}
              </Text>
              <Text style={styles.fileSize}>{formatFileSize(displayFile.size)}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.removeButton} onPress={handleRemoveFile}>
            <Ionicons name="close" size={s(18)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.hint}>Supported: Images (JPG, PNG) and PDF files (Max 10MB)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: s(20),
  },
  label: {
    fontSize: ms(16),
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: s(12),
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: s(12),
  },
  uploadButton: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderWidth: 2,
    borderColor: '#3D3D3D',
    borderStyle: 'dashed',
    borderRadius: s(8),
    padding: s(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: {
    fontSize: ms(32),
    marginBottom: s(8),
  },
  uploadText: {
    fontSize: ms(14),
    fontWeight: '500',
    color: '#9CA3AF',
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E',
    borderRadius: s(8),
    padding: s(12),
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileIcon: {
    fontSize: ms(32),
    marginRight: s(12),
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: ms(14),
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: s(2),
  },
  fileSize: {
    fontSize: ms(12),
    color: '#9CA3AF',
  },
  removeButton: {
    width: s(32),
    height: s(32),
    borderRadius: s(16),
    backgroundColor: '#F56565',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: s(12),
  },
  hint: {
    fontSize: ms(12),
    color: '#6B7280',
    marginTop: s(8),
  },
});
