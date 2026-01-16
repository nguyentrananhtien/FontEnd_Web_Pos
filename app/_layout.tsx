import { Stack } from "expo-router";
import "./global.css";
import { CartProvider } from "@/providers/cart-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { useEffect, useRef } from "react";
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import inAppNotificationService from "@/services/inAppNotificationService";
import paymentService from "@/services/paymentService";
import { router } from "expo-router";
import { useAuth } from "@/providers/auth-provider";
import { SafeAreaProvider } from 'react-native-safe-area-context';

function NotificationHandler() {
  const { user } = useAuth();
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    // Listen for notifications while app is in foreground
    notificationListener.current = inAppNotificationService.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification received:', notification);
    });

    // Listen for user tapping on notification
    responseListener.current = inAppNotificationService.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);

      const data = response.notification.request.content.data;

      // Mark as read if userNotificationId exists
      if (data.userNotificationId && user?.id) {
        // This will be handled by the notifications screen
        router.push('/notifications');
      } else {
        // Navigate based on notification type
        if (data.type === 'ORDER_UPDATE') {
          router.push('/(tabs)/orders');
        } else if (data.type === 'RESERVATION') {
          router.push('/(tabs)/dining');
        } else if (data.type === 'PROMOTION' || data.type === 'SYSTEM') {
          router.push('/notifications');
        }
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

  return null;
}

function PaymentDeepLinkHandler() {
  useEffect(() => {
    // Handle deep link when app is already open
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Handle deep link when app is opened from closed state
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = ({ url }: { url: string }) => {
    console.log('🔗 Received deep link:', url);
    const { path, queryParams } = Linking.parse(url);

    if (path === 'payment-result' && queryParams) {
      handlePaymentResult(queryParams as Record<string, any>);
    }
  };

  const handlePaymentResult = (params: Record<string, any>) => {
    // Navigate to payment result screen instead of showing alert
    router.push({
      pathname: '/payment-result',
      params: params
    });
  };

  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <NotificationHandler />
          <PaymentDeepLinkHandler />
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

