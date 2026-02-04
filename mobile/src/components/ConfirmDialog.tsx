/**
 * ConfirmDialog Component
 * Reusable confirmation dialog for destructive actions
 */

import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { s, ms } from '../utils/responsive.utils';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, destructive ? styles.destructiveButton : styles.confirmButton]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: s(20),
  },
  dialog: {
    backgroundColor: '#1E1E1E',
    borderRadius: s(16),
    padding: s(24),
    width: '100%',
    maxWidth: s(400),
    borderWidth: 1,
    borderColor: '#2D2D2D',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  title: {
    fontSize: ms(20),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: s(12),
  },
  message: {
    fontSize: ms(16),
    color: '#9CA3AF',
    lineHeight: ms(24),
    marginBottom: s(24),
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: s(12),
  },
  button: {
    flex: 1,
    paddingVertical: s(12),
    paddingHorizontal: s(16),
    borderRadius: s(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#2D2D2D',
  },
  confirmButton: {
    backgroundColor: '#4FD1C5',
  },
  destructiveButton: {
    backgroundColor: '#F56565',
  },
  cancelButtonText: {
    fontSize: ms(16),
    fontWeight: '600',
    color: '#E5E7EB',
  },
  confirmButtonText: {
    fontSize: ms(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
