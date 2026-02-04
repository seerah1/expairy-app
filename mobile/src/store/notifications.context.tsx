/**
 * Notifications Context
 * Global state management for notification permissions and handling
 * Uses the notifications service (which lazy-loads expo-notifications to avoid Expo Go errors)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as notificationsService from '../services/notifications.service';

interface NotificationsContextType {
  permissionsGranted: boolean;
  requestPermissions: () => Promise<boolean>;
  scheduledCount: number;
  refreshScheduledCount: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
};

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);

  // Initialize notifications and check permissions on mount
  useEffect(() => {
    notificationsService.initNotifications();
    refreshScheduledCount();
  }, []);

  // Set up notification listeners
  useEffect(() => {
    const receivedSubscription = notificationsService.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
      }
    );

    const responseSubscription = notificationsService.addNotificationResponseListener(
      (response) => {
        console.log('Notification tapped:', response);
        const { itemId, itemType } = response.notification?.request?.content?.data ?? {};
        if (itemId && itemType) {
          console.log(`Navigate to ${itemType} item ${itemId}`);
        }
      }
    );

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const granted = await notificationsService.requestNotificationPermissions();
      setPermissionsGranted(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  };

  const refreshScheduledCount = async () => {
    try {
      const scheduled = await notificationsService.getScheduledNotifications();
      setScheduledCount(scheduled.length);
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
    }
  };

  const value: NotificationsContextType = {
    permissionsGranted,
    requestPermissions,
    scheduledCount,
    refreshScheduledCount,
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};
