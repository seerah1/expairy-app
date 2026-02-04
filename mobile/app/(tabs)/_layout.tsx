/**
 * Tabs Layout
 * Main app tabs navigation - Dark Theme
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { s } from '../../src/utils/responsive.utils';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4FD1C5',
        tabBarInactiveTintColor: '#6B7280',
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopWidth: 1,
          borderTopColor: '#2D2D2D',
          paddingBottom: insets.bottom + s(8),
          paddingTop: s(8),
          height: s(60) + insets.bottom,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={s(size || 24)} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="food-items"
        options={{
          title: 'Food',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant-outline" size={s(size || 24)} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: 'Docs',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={s(size || 24)} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={s(size || 24)} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
