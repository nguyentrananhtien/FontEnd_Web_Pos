import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import api from './api';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationService {
  registerForPushNotificationsAsync: () => Promise<string | undefined>;
  sendPushNotification: (expoPushToken: string, title: string, body: string, data?: any) => Promise<void>;
  schedulePushNotification: (title: string, body: string, seconds: number, data?: any) => Promise<string>;
  addNotificationReceivedListener: (callback: (notification: Notifications.Notification) => void) => Notifications.Subscription;
  addNotificationResponseReceivedListener: (callback: (response: Notifications.NotificationResponse) => void) => Notifications.Subscription;
}

/**
 * Register device for push notifications and get Expo Push Token
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;

  // Check if running in Expo Go
  const isExpoGo = Constants.appOwnership === 'expo';

  if (isExpoGo && Platform.OS === 'android') {
    console.warn('⚠️ Push notifications are not fully supported in Expo Go on Android (SDK 53+). Use development build for full functionality.');
    // Return undefined or skip registration
    return undefined;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('⚠️ Push notification permission not granted');
      return undefined;
    }

    try {
      // Get the token that uniquely identifies this device
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;

      if (!projectId) {
        console.error('❌ No projectId found in app.json');
        return undefined;
      }

      token = (await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      })).data;

      console.log('📱 Expo Push Token:', token);
    } catch (error) {
      console.error('❌ Error getting push token:', error);
      return undefined;
    }
  } else {
    console.warn('⚠️ Must use physical device for Push Notifications');
  }

  return token;
}

/**
 * Send push notification to a specific device
 */
export async function sendPushNotification(
    expoPushToken: string,
    title: string,
    body: string,
    data?: any
) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data || {},
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

/**
 * Schedule a local notification
 */
export async function schedulePushNotification(
    title: string,
    body: string,
    seconds: number = 5,
    data?: any
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      data: data || {},
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: seconds,
    },
  });

  return id;
}

/**
 * Register token to backend for user
 */
export async function registerPushTokenToBackend(
    userId: number,
    expoPushToken: string
): Promise<void> {
  try {
    await api.instance.post('/api/v1/users/push-token', {
      userId,
      pushToken: expoPushToken,
      platform: Platform.OS,
    });
    console.log('✅ Push token registered to backend');
  } catch (error) {
    console.error('❌ Failed to register push token:', error);
  }
}

/**
 * Remove token from backend on logout
 */
export async function removePushTokenFromBackend(
    userId: number,
    expoPushToken: string
): Promise<void> {
  try {
    await api.instance.delete('/api/v1/users/push-token', {
      params: {
        userId,
        pushToken: expoPushToken
      }
    });
    console.log('✅ Push token removed from backend');
  } catch (error) {
    console.error('❌ Failed to remove push token:', error);
  }
}

/**
 * Listen for notifications received while app is foregrounded
 */
export function addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Listen for user interactions with notifications
 */
export function addNotificationResponseReceivedListener(
    callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Get notification badge count
 */
export async function getBadgeCountAsync(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set notification badge count
 */
export async function setBadgeCountAsync(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear all notifications
 */
export async function dismissAllNotificationsAsync(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
}

export default {
  registerForPushNotificationsAsync,
  sendPushNotification,
  schedulePushNotification,
  registerPushTokenToBackend,
  removePushTokenFromBackend,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  getBadgeCountAsync,
  setBadgeCountAsync,
  dismissAllNotificationsAsync,
};
