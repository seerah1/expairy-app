/**
 * StatusBadge Component
 * Displays expiry status with color coding
 * Calculates remaining days in real-time from expiry date
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { s, ms } from '../utils/responsive.utils';
import { calculateRemainingDays, calculateStatus } from '../utils/date.utils';

interface StatusBadgeProps {
  status?: 'Expired' | 'Expiring Soon' | 'Safe';
  remainingDays?: number;
  expiryDate?: string; // ISO format (YYYY-MM-DD) - preferred for real-time calculation
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, remainingDays, expiryDate }) => {
  // Calculate real-time values if expiryDate is provided
  const { actualRemainingDays, actualStatus } = useMemo(() => {
    if (expiryDate) {
      const days = calculateRemainingDays(expiryDate);
      return {
        actualRemainingDays: days,
        actualStatus: calculateStatus(days),
      };
    }
    // Fallback to provided values
    return {
      actualRemainingDays: remainingDays ?? 0,
      actualStatus: status ?? 'Safe',
    };
  }, [expiryDate, remainingDays, status]);

  const getStatusColor = () => {
    switch (actualStatus) {
      case 'Expired':
        return '#F56565'; // Red
      case 'Expiring Soon':
        return '#F6E05E'; // Yellow
      case 'Safe':
        return '#48BB78'; // Green
      default:
        return '#9CA3AF'; // Gray
    }
  };

  const getTextColor = () => {
    switch (actualStatus) {
      case 'Expiring Soon':
        return '#121212'; // Dark text for yellow
      default:
        return '#FFFFFF';
    }
  };

  const getStatusText = () => {
    if (actualRemainingDays < 0) {
      const absDays = Math.abs(actualRemainingDays);
      return absDays === 1 ? 'Expired yesterday' : `Expired ${absDays} days ago`;
    } else if (actualRemainingDays === 0) {
      return 'Expires today';
    } else if (actualRemainingDays === 1) {
      return 'Expires tomorrow';
    } else {
      return `${actualRemainingDays} days left`;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor() }]}>
      <Text style={[styles.text, { color: getTextColor() }]}>{getStatusText()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: s(12),
    paddingVertical: s(6),
    borderRadius: s(12),
    alignSelf: 'flex-start',
  },
  text: {
    color: '#FFFFFF',
    fontSize: ms(12),
    fontWeight: '500',
  },
});
