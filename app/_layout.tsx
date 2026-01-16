import { Stack } from "expo-router";
import "./global.css";
import { CartProvider } from "@/providers/cart-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { useEffect, useRef, useState } from "react";
import * as Notifications from 'expo-notifications';
import pushNotificationService from "@/services/pushNotificationService";
import { router } from "expo-router";
import { useAuth } from "@/providers/auth-provider";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function NotificationHandler() {
  const { user } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    // Register for push notifications
    pushNotificationService.registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        console.log('📱 Push token registered:', token);

        // Save token to AsyncStorage for logout
        AsyncStorage.setItem('EXPO_PUSH_TOKEN', token);

        // Register token to backend when user is logged in
        if (user?.id) {
          pushNotificationService.registerPushTokenToBackend(user.id, token);
        }
      }
    });

    // Listen for notifications while app is in foreground
    notificationListener.current = pushNotificationService.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification received:', notification);

      // Update badge count
      pushNotificationService.getBadgeCountAsync().then(count => {
        pushNotificationService.setBadgeCountAsync(count + 1);
      });
    });

    // Listen for user tapping on notification
    responseListener.current = pushNotificationService.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);

      const data = response.notification.request.content.data;

      // Navigate based on notification type
      if (data.type === 'ORDER_UPDATE') {
        router.push('/(tabs)/orders');
      } else if (data.type === 'RESERVATION') {
        router.push('/(tabs)/dining');
      } else if (data.type === 'PROMOTION' || data.type === 'SYSTEM') {
        router.push('/notifications');
      }
    });

    // Cleanup
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [user]);

  // Register token when user logs in
  useEffect(() => {
    if (user?.id && expoPushToken) {
      pushNotificationService.registerPushTokenToBackend(user.id, expoPushToken);
    }
  }, [user?.id, expoPushToken]);

  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <NotificationHandler />
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="order-confirmation" />
          </Stack>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

