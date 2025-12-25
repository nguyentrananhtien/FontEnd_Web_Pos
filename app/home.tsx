import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/providers/auth-provider';

export default function HomeScreen() {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <LinearGradient
      colors={['#f97316', '#ec4899']}
      className="flex-1"
    >
      <View className="flex-1 p-6 justify-center">
        <View className="absolute top-12 right-6">
          <TouchableOpacity
            className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur-lg"
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>

        {user && (
          <View className="mb-8">
            <Text className="text-lg text-center text-white/90">
              Welcome, {user.name || user.email}!
            </Text>
          </View>
        )}

        <Text className="text-4xl font-bold text-center mb-2 text-white">
          Restaurant POS System
        </Text>
        <Text className="text-base text-center text-white/90 mb-12">
          Choose a section to begin
        </Text>

        <View className="gap-5">
          <TouchableOpacity
            className="p-6 rounded-xl bg-white/20 backdrop-blur-lg active:bg-white/30"
            onPress={() => router.push('/(tabs)/screen/menu')}
            activeOpacity={0.8}
          >
            <Text className="text-2xl font-semibold text-white text-center mb-2">
              🍽️ Menu & Orders
            </Text>
            <Text className="text-sm text-white/90 text-center">
              Browse menu and manage orders
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="p-6 rounded-xl bg-white/20 backdrop-blur-lg active:bg-white/30"
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.8}
          >
            <Text className="text-2xl font-semibold text-white text-center mb-2">
              🪑 Table Management
            </Text>
            <Text className="text-sm text-white/90 text-center">
              View and manage dining tables
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}
