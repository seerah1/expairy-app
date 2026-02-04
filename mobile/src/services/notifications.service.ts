/**
 * Notifications Service
 * Handles local notification scheduling and management using Expo Notifications
 * Note: Push notifications are NOT supported in Expo Go (SDK 53+).
 *       This service lazy-loads expo-notifications to avoid auto-registration errors in Expo Go.
 */

import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const isExpoGo = Constants.appOwnership === 'expo';

// Lazy-loaded notifications module (avoids push token auto-registration error in Expo Go)
let _notifications: typeof import('expo-notifications') | null = null;
let _handlerSet = false;

async function getNotifications() {
  if (!_notifications) {
    _notifications = await import('expo-notifications');
    if (!_handlerSet && !isExpoGo) {
      _notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
      _handlerSet = true;
    }
  }
  return _notifications;
}

/**
 * Initialize notification handler (call early in app lifecycle for dev builds)
 */
export const initNotifications = async (): Promise<void> => {
  if (isExpoGo) return;
  await getNotifications();
};

/**
 * Request notification permissions from user
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    console.warn('Notifications only work on physical devices');
    return false;
  }

  if (isExpoGo) {
    return false;
  }

  try {
    const Notifications = await getNotifications();
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted');
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('expiry-alerts', {
        name: 'Expiry Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B6B',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Schedule notifications for an item
 * Schedules at 30, 15, 7, and 1 days before expiry
 */
export const scheduleItemNotifications = async (
  itemId: number,
  itemName: string,
  expiryDate: string,
  itemType: 'food' | 'document' = 'food'
): Promise<string[]> => {
  if (isExpoGo) return [];

  const Notifications = await getNotifications();
  const notificationIds: string[] = [];
  const expiry = new Date(expiryDate);
  const now = new Date();

  const intervals = [30, 15, 7, 1];

  for (const days of intervals) {
    const notificationDate = new Date(expiry);
    notificationDate.setDate(notificationDate.getDate() - days);
    notificationDate.setHours(9, 0, 0, 0);

    if (notificationDate > now) {
      try {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `${itemType === 'food' ? 'Food Item' : 'Document'} Expiry Alert`,
            body:
              days === 1 ? `${itemName} expires tomorrow!` : `${itemName} expires in ${days} days`,
            data: { itemId, itemType, daysUntilExpiry: days },
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: notificationDate,
          },
        });

        notificationIds.push(notificationId);
      } catch (error) {
        console.error(`Error scheduling notification for ${days} days:`, error);
      }
    }
  }

  return notificationIds;
};

/**
 * Cancel all notifications for an item
 */
export const cancelItemNotifications = async (notificationIds: string[]): Promise<void> => {
  if (isExpoGo) return;
  try {
    const Notifications = await getNotifications();
    for (const id of notificationIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  } catch (error) {
    console.error('Error cancelling notifications:', error);
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  if (isExpoGo) return;
  try {
    const Notifications = await getNotifications();
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
};

/**
 * Get all scheduled notifications
 */
export const getScheduledNotifications = async (): Promise<any[]> => {
  if (isExpoGo) return [];
  try {
    const Notifications = await getNotifications();
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

/**
 * Add notification received listener
 */
export const addNotificationReceivedListener = (callback: (notification: any) => void) => {
  if (isExpoGo) {
    return { remove: () => {} };
  }
  // For listeners we need sync access — use require as fallback
  const Notifications = require('expo-notifications');
  return Notifications.addNotificationReceivedListener(callback);
};

/**
 * Add notification response listener (when user taps notification)
 */
export const addNotificationResponseListener = (callback: (response: any) => void) => {
  if (isExpoGo) {
    return { remove: () => {} };
  }
  const Notifications = require('expo-notifications');
  return Notifications.addNotificationResponseReceivedListener(callback);
};
