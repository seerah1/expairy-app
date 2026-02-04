/**
 * Food Items Service
 * API calls for food item operations
 */

import apiClient from './api';
import {
  FoodItem,
  CreateFoodItemRequest,
  UpdateFoodItemRequest,
  FoodItemResponse,
} from '../types/food-item.types';
import { ApiResponse } from '../types/api.types';

export interface FoodItemsListParams {
  status?: 'Expired' | 'Expiring Soon' | 'Safe';
  category?: string;
  storageType?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'expiry_asc' | 'expiry_desc' | 'name_asc' | 'name_desc' | 'created_asc' | 'created_desc';
}

export interface FoodItemsListResponse {
  success: boolean;
  data: FoodItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get all food items for authenticated user
 */
export const getFoodItems = async (
  params?: FoodItemsListParams
): Promise<FoodItemsListResponse> => {
  const response = await apiClient.get<FoodItemsListResponse>('/food-items', { params });
  return response.data;
};

/**
 * Get single food item by ID
 */
export const getFoodItem = async (id: number): Promise<FoodItem> => {
  const response = await apiClient.get<FoodItemResponse>(`/food-items/${id}`);
  return response.data.data;
};

/**
 * Create new food item
 */
export const createFoodItem = async (data: CreateFoodItemRequest): Promise<FoodItem> => {
  const response = await apiClient.post<FoodItemResponse>('/food-items', data);
  return response.data.data;
};

/**
 * Update food item
 */
export const updateFoodItem = async (
  id: number,
  data: UpdateFoodItemRequest
): Promise<FoodItem> => {
  const response = await apiClient.put<FoodItemResponse>(`/food-items/${id}`, data);
  return response.data.data;
};

/**
 * Delete food item
 */
export const deleteFoodItem = async (id: number): Promise<void> => {
  await apiClient.delete<ApiResponse>(`/food-items/${id}`);
};

/**
 * Get food items expiring soon (within 7 days)
 */
export const getExpiringSoonItems = async (): Promise<FoodItem[]> => {
  const response = await getFoodItems({ status: 'Expiring Soon', sort: 'expiry_asc' });
  return response.data;
};
