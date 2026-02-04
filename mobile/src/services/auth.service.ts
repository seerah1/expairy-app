/**
 * Authentication Service
 * API calls for authentication operations
 */

import apiClient from './api';
import { storeToken, storeUser, clearAuthData } from '../utils/storage.utils';
import type { AuthResponse, User } from '../types/auth.types';

/**
 * Register new user
 * @param email - User email
 * @param password - User password
 * @param confirmPassword - Password confirmation
 * @returns User and token
 */
export const register = async (
  email: string,
  password: string,
  confirmPassword: string
): Promise<{ user: User; token: string }> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', {
    email,
    password,
    confirmPassword,
  });

  const { user, token } = response.data.data;

  // Store token and user data securely
  await storeToken(token);
  await storeUser(user);

  return { user, token };
};

/**
 * Login user
 * @param email - User email
 * @param password - User password
 * @returns User and token
 */
export const login = async (
  email: string,
  password: string
): Promise<{ user: User; token: string }> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', {
    email,
    password,
  });

  const { user, token } = response.data.data;

  // Store token and user data securely
  await storeToken(token);
  await storeUser(user);

  return { user, token };
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    // Continue with logout even if API call fails
    console.error('Logout API error:', error);
  } finally {
    // Clear local authentication data
    await clearAuthData();
  }
};

/**
 * Get current user profile
 * @returns User object
 */
export const getProfile = async (): Promise<User> => {
  const response = await apiClient.get('/auth/me');
  return response.data.data;
};
