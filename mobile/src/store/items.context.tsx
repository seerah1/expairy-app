/**
 * Items Context
 * Global state management for food items
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { FoodItem, CreateFoodItemRequest, UpdateFoodItemRequest } from '../types/food-item.types';
import * as foodItemsService from '../services/food-items.service';
import * as notificationsService from '../services/notifications.service';

interface ItemsContextType {
  items: FoodItem[];
  loading: boolean;
  error: string | null;
  refreshItems: () => Promise<void>;
  createItem: (data: CreateFoodItemRequest) => Promise<FoodItem>;
  updateItem: (id: number, data: UpdateFoodItemRequest) => Promise<FoodItem>;
  deleteItem: (id: number) => Promise<void>;
  getItemById: (id: number) => FoodItem | undefined;
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

export const useItems = () => {
  const context = useContext(ItemsContext);
  if (!context) {
    throw new Error('useItems must be used within ItemsProvider');
  }
  return context;
};

interface ItemsProviderProps {
  children: ReactNode;
}

export const ItemsProvider: React.FC<ItemsProviderProps> = ({ children }) => {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store notification IDs for each item
  const [notificationIds, setNotificationIds] = useState<Map<number, string[]>>(new Map());

  const refreshItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await foodItemsService.getFoodItems({ sort: 'expiry_asc' });
      setItems(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load items');
      console.error('Error loading items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(async (data: CreateFoodItemRequest): Promise<FoodItem> => {
    setError(null);
    try {
      const newItem = await foodItemsService.createFoodItem(data);

      // Schedule notifications for the new item
      const ids = await notificationsService.scheduleItemNotifications(
        newItem.id,
        newItem.name,
        newItem.expiry_date,
        'food'
      );

      // Store notification IDs
      setNotificationIds((prev) => new Map(prev).set(newItem.id, ids));

      // Add to local state
      setItems((prev) =>
        [...prev, newItem].sort(
          (a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
        )
      );

      return newItem;
    } catch (err: any) {
      setError(err.message || 'Failed to create item');
      throw err;
    }
  }, []);

  const updateItem = useCallback(
    async (id: number, data: UpdateFoodItemRequest): Promise<FoodItem> => {
      setError(null);
      try {
        const updatedItem = await foodItemsService.updateFoodItem(id, data);

        // If expiry date changed, reschedule notifications
        if (data.expiryDate) {
          // Cancel old notifications
          const oldIds = notificationIds.get(id);
          if (oldIds) {
            await notificationsService.cancelItemNotifications(oldIds);
          }

          // Schedule new notifications
          const newIds = await notificationsService.scheduleItemNotifications(
            updatedItem.id,
            updatedItem.name,
            updatedItem.expiry_date,
            'food'
          );

          setNotificationIds((prev) => new Map(prev).set(id, newIds));
        }

        // Update local state
        setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));

        return updatedItem;
      } catch (err: any) {
        setError(err.message || 'Failed to update item');
        throw err;
      }
    },
    [notificationIds]
  );

  const deleteItem = useCallback(
    async (id: number): Promise<void> => {
      setError(null);
      try {
        // Cancel notifications
        const ids = notificationIds.get(id);
        if (ids) {
          await notificationsService.cancelItemNotifications(ids);
          setNotificationIds((prev) => {
            const newMap = new Map(prev);
            newMap.delete(id);
            return newMap;
          });
        }

        // Delete from backend
        await foodItemsService.deleteFoodItem(id);

        // Remove from local state
        setItems((prev) => prev.filter((item) => item.id !== id));
      } catch (err: any) {
        setError(err.message || 'Failed to delete item');
        throw err;
      }
    },
    [notificationIds]
  );

  const getItemById = useCallback(
    (id: number): FoodItem | undefined => {
      return items.find((item) => item.id === id);
    },
    [items]
  );

  const value: ItemsContextType = {
    items,
    loading,
    error,
    refreshItems,
    createItem,
    updateItem,
    deleteItem,
    getItemById,
  };

  return <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>;
};
