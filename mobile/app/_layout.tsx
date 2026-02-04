/**
 * Root Layout
 * Main app layout with authentication check and providers
 */

import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

import { AuthProvider, useAuth } from '../src/store/auth.context';
import { ItemsProvider } from '../src/store/items.context';
import { NotificationsProvider, useNotifications } from '../src/store/notifications.context';

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const notifications = useNotifications();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)/dashboard');
    }
  }, [isAuthenticated, isLoading, segments]);

  useEffect(() => {
    if (Platform.OS !== 'web' && isAuthenticated && !isLoading) {
      notifications.requestPermissions();
    }
  }, [isAuthenticated, isLoading]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <NotificationsProvider>
          <ItemsProvider>
            <StatusBar style="light" backgroundColor="#121212" />
            <RootLayoutNav />
          </ItemsProvider>
        </NotificationsProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
