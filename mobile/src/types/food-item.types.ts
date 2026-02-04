/**
 * Food item related TypeScript types
 */

import { FoodCategory } from '../constants/categories';
import { StorageType } from '../constants/storage-types';

export interface FoodItem {
  id: number;
  user_id: number;
  name: string;
  category: FoodCategory;
  expiry_date: string; // ISO format (YYYY-MM-DD)
  quantity?: string;
  storage_type: StorageType;
  status: 'Expired' | 'Expiring Soon' | 'Safe';
  remaining_days: number;
  created_at: string;
  updated_at: string;
}

export interface CreateFoodItemRequest {
  name: string;
  category: FoodCategory;
  expiryDate: string;
  quantity?: string;
  storageType: StorageType;
}

export interface UpdateFoodItemRequest {
  name?: string;
  category?: FoodCategory;
  expiryDate?: string;
  quantity?: string;
  storageType?: StorageType;
}

export interface FoodItemsResponse {
  success: boolean;
  data: {
    items: FoodItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface FoodItemResponse {
  success: boolean;
  message?: string;
  data: FoodItem;
}
