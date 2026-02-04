/**
 * Documents List Screen
 * Displays all documents with filtering and sorting options
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
import { getDocuments } from '../../src/services/documents.service';
import { Document } from '../../src/types/document.types';
import { s, ms } from '../../src/utils/responsive.utils';
import { calculateRemainingDays } from '../../src/utils/date.utils';

export default function DocumentsScreen() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setError(null);
      const response = await getDocuments({ sort: 'expiry_asc' });
      setDocuments(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDocuments();
    setRefreshing(false);
  };

  const handleDocumentPress = (document: Document) => {
    router.push(`/documents/${document.id}`);
  };

  const handleAddPress = () => {
    router.push('/documents/new');
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
        return '#9CA3AF';
    }
  };

  const getStatusTextColor = (status: string) => {
    return status === 'Expiring Soon' ? '#121212' : '#FFFFFF';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderDocumentCard = ({ item }: { item: Document }) => (
    <TouchableOpacity
      style={styles.documentCard}
      onPress={() => handleDocumentPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.documentType}>{item.type}</Text>
            <Text style={styles.documentNumber} numberOfLines={1}>
              {item.number}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={[styles.statusText, { color: getStatusTextColor(item.status) }]}>
            {(() => {
              const days = calculateRemainingDays(item.expiry_date);
              if (days < 0) return 'Expired';
              if (days === 0) return 'Today';
              if (days === 1) return '1 day';
              return `${days} days`;
            })()}
          </Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Expires:</Text>
          <Text style={styles.detailValue}>{formatDate(item.expiry_date)}</Text>
        </View>

        {item.issuing_authority && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Issued by:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {item.issuing_authority}
            </Text>
          </View>
        )}

        {item.file_name && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>File:</Text>
            <Text style={styles.detailValue}>Attached: {item.file_name}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Documents Yet</Text>
      <Text style={styles.emptyText}>
        Start tracking your important documents to get expiry reminders
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddPress}>
        <Text style={styles.emptyButtonText}>Add Your First Document</Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadDocuments}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4FD1C5" />
        <Text style={styles.loadingText}>Loading documents...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Documents</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {error && !loading && renderError()}

      <FlatList
        data={documents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDocumentCard}
        contentContainerStyle={[
          styles.listContent,
          documents.length === 0 && styles.listContentEmpty,
        ]}
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
  documentCard: {
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
  cardHeader: {
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
  icon: {
    fontSize: ms(32),
    marginRight: s(12),
    display: 'none',
  },
  titleContainer: {
    flex: 1,
  },
  documentType: {
    fontSize: ms(18),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: s(2),
    letterSpacing: -0.3,
  },
  documentNumber: {
    fontSize: ms(13),
    color: '#9CA3AF',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: s(10),
    paddingVertical: s(5),
    borderRadius: s(8),
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: ms(11),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardDetails: {
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
    flex: 1,
    textAlign: 'right',
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
