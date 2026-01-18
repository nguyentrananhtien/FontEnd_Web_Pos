import { authApi } from '@/services/api';
import { router } from 'expo-router';
import { Alert } from 'react-native';

export const useAuth = () => {
  const logout = async () => {
    try {
      await authApi.logout();
      router.replace('/auth/login');
    } catch (error: any) {
      console.error('Logout failed:', error);
      Alert.alert('Error', 'Logout failed. Please try again.');
    }
  };

  const logoutAll = async () => {
    try {
      await authApi.logoutAll();
      router.replace('/auth/login');
    } catch (error: any) {
      console.error('Logout all failed:', error);
      Alert.alert('Error', 'Logout failed. Please try again.');
    }
  };

  return {
    logout,
    logoutAll,
  };
};

