import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { authApi } from '@/api/authApi';
import { WaterDropLoader } from '@/components/WaterDropLoader';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

    try {
      const response = await authApi.login({ email, password });
      console.log('Login successful:', response);

      const elapsed = Date.now() - startTime;
      if (elapsed < 2000) {
        await new Promise(resolve => setTimeout(resolve, 2000 - elapsed));
      }

      router.replace('/home');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    Alert.alert('Info', 'Google login will be implemented with backend API');
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password reset will be implemented with backend API');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <LinearGradient
        colors={['#f97316', '#ec4899']}
        className="flex-1"
      >
        {isLoading && (
          <View style={styles.loaderOverlay}>
            <WaterDropLoader size={60} color="#ffffff" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}

        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
          <View className="flex-1 justify-center p-6">
            <View className="items-center mb-10">
              <View>
                <Text className="text-5xl">🍽️</Text>
              </View>
              <Text className="text-3xl font-bold text-white mb-2">
                Restaurant POS
              </Text>
              <Text className="text-base text-white/90">
                Sign in to continue
              </Text>
            </View>

            <View className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl">
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Email
                </Text>
                <TextInput
                  className="h-12 border border-gray-300 rounded-xl px-4 text-base bg-gray-50"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                />
              </View>

              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Password
                </Text>
                <TextInput
                  className="h-12 border border-gray-300 rounded-xl px-4 text-base bg-gray-50"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <TouchableOpacity
                className="self-end mb-6"
                onPress={handleForgotPassword}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Text className="text-orange-600 text-sm font-semibold">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl justify-center items-center mb-6 shadow-lg active:opacity-80 ${isLoading ? 'opacity-60' : ''}`}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#f97316', '#ec4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="h-12 rounded-xl justify-center items-center w-full"
                >
                  <Text className="text-white text-base font-semibold">
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View className="flex-row items-center mb-6">
                <View className="flex-1 h-px bg-gray-300" />
                <Text className="mx-4 text-gray-500 text-sm">OR</Text>
                <View className="flex-1 h-px bg-gray-300" />
              </View>

              <TouchableOpacity
                className="h-12 flex-row items-center justify-center rounded-xl border border-gray-300 bg-white active:bg-gray-50"
                onPress={handleGoogleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text className="text-xl font-bold mr-3">G</Text>
                <Text className="text-base font-semibold text-gray-700">
                  Continue with Google
                </Text>
              </TouchableOpacity>

              <View className="flex-row justify-center mt-6">
                <Text className="text-gray-600 text-sm">
                  Don't have an account?{' '}
                </Text>
                <TouchableOpacity onPress={handleRegister} disabled={isLoading} activeOpacity={0.7}>
                  <Text className="text-orange-600 text-sm font-semibold">
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 50,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
    fontWeight: '600',
  },
});

