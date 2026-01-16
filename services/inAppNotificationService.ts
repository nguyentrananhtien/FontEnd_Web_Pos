import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import api from './api';

/**
 * IN-APP NOTIFICATION SERVICE
 * Works with Expo Go SDK 53+ using local notifications
 * Polls backend for new notifications and displays them in-app
 */

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

// Track last checked notification ID to avoid duplicates
let lastCheckedNotificationId = 0;
let pollingInterval: NodeJS.Timeout | null = null;

/**
 * Initialize notification permissions
 */
export async function initializeNotifications(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('⚠️ Notification permission not granted');
      return false;
    }

    // Set notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }

    console.log('✅ Notifications initialized');
    return true;
  } catch (error) {
    console.error('❌ Error initializing notifications:', error);
    return false;
  }
}

/**
 * Present a local notification immediately
 */
export async function presentLocalNotification(
    title: string,
    body: string,
    data?: any
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: data || {},
        sound: true,
      },
      trigger: null, // null means immediate
    });
  } catch (error) {
    console.error('❌ Error presenting notification:', error);
  }
}

/**
 * Schedule a local notification for later
 */
export async function scheduleLocalNotification(
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
 * Check for new notifications from backend
 */
export async function checkForNewNotifications(userId: number): Promise<void> {
  try {
    // Get unread notifications
    const response = await api.instance.get(`/api/notifications/user/${userId}/unread`);
    const unreadNotifications = response.data;

    if (!Array.isArray(unreadNotifications) || unreadNotifications.length === 0) {
      return;
    }

    // Filter only new notifications (not yet shown)
    const newNotifications = unreadNotifications.filter(
        (item: any) => item.userNotificationId > lastCheckedNotificationId
    );

    if (newNotifications.length > 0) {
      // Update last checked ID
      lastCheckedNotificationId = Math.max(
          ...newNotifications.map((item: any) => item.userNotificationId)
      );

      // Show local notification for each new notification
      for (const item of newNotifications) {
        await presentLocalNotification(
            item.notification.title,
            item.notification.message,
            {
              userNotificationId: item.userNotificationId,
              notificationId: item.notification.notificationId,
              type: item.notification.type,
            }
        );
      }

      // Update badge count
      const countResponse = await api.instance.get(`/api/notifications/user/${userId}/unread/count`);
      await setBadgeCountAsync(countResponse.data);
    }
  } catch (error) {
    console.error('❌ Error checking for new notifications:', error);
  }
}

/**
 * Start polling for new notifications
 */
export function startNotificationPolling(userId: number, intervalMs: number = 30000): void {
  if (pollingInterval) {
    console.warn('⚠️ Notification polling already running');
    return;
  }

  console.log('🔄 Starting notification polling...');

  // Initial check
  checkForNewNotifications(userId);

  // Poll every intervalMs (default 30 seconds)
  pollingInterval = setInterval(() => {
    checkForNewNotifications(userId);
  }, intervalMs);
}

/**
 * Stop polling for new notifications
 */
export function stopNotificationPolling(): void {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    lastCheckedNotificationId = 0;
    console.log('🛑 Notification polling stopped');
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

/**
 * Sync badge count with backend
 */
export async function syncBadgeCount(userId: number): Promise<void> {
  try {
    const response = await api.instance.get(`/api/notifications/user/${userId}/unread/count`);
    await setBadgeCountAsync(response.data);
  } catch (error) {
    console.error('❌ Error syncing badge count:', error);
  }
}

export default {
  initializeNotifications,
  presentLocalNotification,
  scheduleLocalNotification,
  checkForNewNotifications,
  startNotificationPolling,
  stopNotificationPolling,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  getBadgeCountAsync,
  setBadgeCountAsync,
  dismissAllNotificationsAsync,
  syncBadgeCount,
};
