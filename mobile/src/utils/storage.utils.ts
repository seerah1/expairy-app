/**
 * Storage utility functions with platform-aware storage
 * Uses SecureStore for iOS/Android and AsyncStorage for web
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'user_data';

// Platform-aware storage wrapper
const storage = {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },

  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

/**
 * Store JWT token securely
 * @param token - JWT token string
 */
export const storeToken = async (token: string): Promise<void> => {
  try {
    await storage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing token:', error);
    throw new Error('Failed to store authentication token');
  }
};

/**
 * Retrieve JWT token from secure storage
 * @returns JWT token or null if not found
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await storage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

/**
 * Remove JWT token from secure storage
 */
export const removeToken = async (): Promise<void> => {
  try {
    await storage.deleteItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

/**
 * Store user data securely
 * @param user - User object
 */
export const storeUser = async (user: any): Promise<void> => {
  try {
    await storage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error storing user data:', error);
    throw new Error('Failed to store user data');
  }
};

/**
 * Retrieve user data from secure storage
 * @returns User object or null if not found
 */
export const getUser = async (): Promise<any | null> => {
  try {
    const userData = await storage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
};

/**
 * Remove user data from secure storage
 */
export const removeUser = async (): Promise<void> => {
  try {
    await storage.deleteItem(USER_KEY);
  } catch (error) {
    console.error('Error removing user data:', error);
  }
};

/**
 * Clear all authentication data
 */
export const clearAuthData = async (): Promise<void> => {
  await removeToken();
  await removeUser();
};
