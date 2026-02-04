/**
 * Login Screen
 * User login with email and password
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/store/auth.context';
import { isValidEmail } from '../../src/utils/validation.utils';
import { s, ms } from '../../src/utils/responsive.utils';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    // Validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      // Navigation handled by root layout
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/auth-bg.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text variant="headlineLarge" style={styles.title}>
              Welcome Back
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Sign in to continue tracking your items
            </Text>

            <View style={styles.form}>
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                disabled={loading}
                error={!!error && !isValidEmail(email) && email.length > 0}
                style={styles.input}
                textColor="#FFFFFF"
                placeholderTextColor="#6B7280"
                outlineColor="#3D3D3D"
                activeOutlineColor="#4FD1C5"
                theme={{ colors: { onSurfaceVariant: '#9CA3AF' } }}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                disabled={loading}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                    iconColor="#9CA3AF"
                  />
                }
                style={styles.input}
                textColor="#FFFFFF"
                placeholderTextColor="#6B7280"
                outlineColor="#3D3D3D"
                activeOutlineColor="#4FD1C5"
                theme={{ colors: { onSurfaceVariant: '#9CA3AF' } }}
              />

              {error ? (
                <HelperText type="error" visible={!!error} style={styles.errorText}>
                  {error}
                </HelperText>
              ) : null}

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.button}
                buttonColor="#4FD1C5"
                textColor="#121212"
              >
                Sign In
              </Button>

              <Button
                mode="text"
                onPress={() => router.push('/register')}
                disabled={loading}
                style={styles.linkButton}
                textColor="#4FD1C5"
              >
                Don't have an account? Sign Up
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 18, 18, 0.5)',
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: s(24),
    justifyContent: 'center',
  },
  title: {
    marginBottom: s(8),
    textAlign: 'center',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    marginBottom: s(32),
    textAlign: 'center',
    color: '#E5E7EB',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  form: {
    width: '100%',
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderRadius: s(16),
    padding: s(24),
    borderWidth: 1,
    borderColor: 'rgba(77, 209, 197, 0.3)',
  },
  input: {
    marginBottom: s(16),
    backgroundColor: '#1E1E1E',
  },
  button: {
    marginTop: s(8),
    marginBottom: s(16),
    backgroundColor: '#4FD1C5',
  },
  linkButton: {
    marginTop: s(8),
  },
  errorText: {
    color: '#F56565',
  },
});
