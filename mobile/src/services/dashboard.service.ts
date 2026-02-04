/**
 * Dashboard Service
 * API calls for dashboard statistics and overview
 */

import apiClient from './api';
import { FoodItem } from '../types/food-item.types';
import { Document } from '../types/document.types';

export interface DashboardStatistics {
  total: number;
  expired: number;
  expiringSoon: number;
  safe: number;
}

// Union type for items that can be either food items or documents
export type DashboardItem = (FoodItem & { item_type: 'food_item' }) | (Document & { item_type: 'document' });

export interface DashboardOverview {
  statistics: DashboardStatistics;
  upcomingExpirations: DashboardItem[];
  recentlyAdded: DashboardItem[];
  categoryBreakdown: { [key: string]: number };
  storageBreakdown: { [key: string]: number };
  documentTypeBreakdown: { [key: string]: number };
}

export interface DetailedStatistics {
  totalItems: number;
  statusDistribution: {
    expired: number;
    expiringSoon: number;
    safe: number;
  };
  categoryDistribution: { [key: string]: number };
  storageDistribution: { [key: string]: number };
  expiringThisWeek: number;
  expiringThisMonth: number;
  averageDaysUntilExpiry: number;
}

/**
 * Get dashboard overview with statistics and upcoming items
 */
export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  const response = await apiClient.get<{ success: boolean; data: DashboardOverview }>(
    '/dashboard/overview'
  );
  return response.data.data;
};

/**
 * Get detailed statistics
 */
export const getDetailedStatistics = async (): Promise<DetailedStatistics> => {
  const response = await apiClient.get<{ success: boolean; data: DetailedStatistics }>(
    '/dashboard/statistics'
  );
  return response.data.data;
};
