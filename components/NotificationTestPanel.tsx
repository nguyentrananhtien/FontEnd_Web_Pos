import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import inAppNotificationService from '@/services/inAppNotificationService';
import { useAuth } from '@/providers/auth-provider';
import { Ionicons } from '@expo/vector-icons';

/**
 * TEST COMPONENT - Để test in-app notifications
 * Có thể thêm vào trang profile hoặc settings để test
 */
export default function NotificationTestPanel() {
  const { user } = useAuth();
  const [badgeCount, setBadgeCount] = useState(0);

  const handleTestImmediate = async () => {
    try {
      await inAppNotificationService.presentLocalNotification(
        'Test Notification',
        'This is a test notification!',
        { type: 'SYSTEM', testData: 'immediate' }
      );
      Alert.alert('Success', 'Notification sent immediately');
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification');
      console.error(error);
    }
  };

  const handleTestScheduled = async () => {
    try {
      await inAppNotificationService.scheduleLocalNotification(
        'Scheduled Test',
        'This notification was scheduled 5 seconds ago',
        5,
        { type: 'SYSTEM', testData: 'scheduled' }
      );
      Alert.alert('Success', 'Notification scheduled for 5 seconds');
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule notification');
      console.error(error);
    }
  };

  const handleTestOrderUpdate = async () => {
    await inAppNotificationService.presentLocalNotification(
      'Order Update',
      'Your order #123 is now being prepared',
      { type: 'ORDER_UPDATE', orderId: 123 }
    );
  };

  const handleTestReservation = async () => {
    await inAppNotificationService.presentLocalNotification(
      'Reservation Confirmed',
      'Your table booking for 6:00 PM has been confirmed',
      { type: 'RESERVATION', reservationId: 456 }
    );
  };

  const handleTestPromotion = async () => {
    await inAppNotificationService.presentLocalNotification(
      '🎉 Special Promotion',
      'Get 50% off on all dishes today!',
      { type: 'PROMOTION', promoCode: 'SAVE50' }
    );
  };

  const handleCheckBackend = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    try {
      await inAppNotificationService.checkForNewNotifications(user.id);
      Alert.alert('Success', 'Checked backend for new notifications');
    } catch (error) {
      Alert.alert('Error', 'Failed to check backend');
      console.error(error);
    }
  };

  const handleGetBadgeCount = async () => {
    try {
      const count = await inAppNotificationService.getBadgeCountAsync();
      setBadgeCount(count);
      Alert.alert('Badge Count', `Current count: ${count}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to get badge count');
      console.error(error);
    }
  };

  const handleSetBadgeCount = async () => {
    try {
      const newCount = badgeCount + 1;
      await inAppNotificationService.setBadgeCountAsync(newCount);
      setBadgeCount(newCount);
      Alert.alert('Success', `Badge count set to ${newCount}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to set badge count');
      console.error(error);
    }
  };

  const handleClearBadge = async () => {
    try {
      await inAppNotificationService.setBadgeCountAsync(0);
      setBadgeCount(0);
      Alert.alert('Success', 'Badge count cleared');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear badge');
      console.error(error);
    }
  };

  const handleDismissAll = async () => {
    try {
      await inAppNotificationService.dismissAllNotificationsAsync();
      Alert.alert('Success', 'All notifications dismissed');
    } catch (error) {
      Alert.alert('Error', 'Failed to dismiss notifications');
      console.error(error);
    }
  };

  const handleSyncBadge = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    try {
      await inAppNotificationService.syncBadgeCount(user.id);
      const newCount = await inAppNotificationService.getBadgeCountAsync();
      setBadgeCount(newCount);
      Alert.alert('Success', `Synced with backend. Count: ${newCount}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to sync badge count');
      console.error(error);
    }
  };

  const TestButton = ({
    onPress,
    title,
    icon,
    color = '#f97316'
  }: {
    onPress: () => void;
    title: string;
    icon: string;
    color?: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-lg p-4 mb-3 flex-row items-center border border-gray-200"
      activeOpacity={0.7}
    >
      <View
        style={{ backgroundColor: color }}
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
      >
        <Ionicons name={icon as any} size={20} color="white" />
      </View>
      <Text className="text-gray-800 font-medium flex-1">{title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="bg-orange-600 rounded-lg p-4 mb-4">
        <Text className="text-white text-lg font-bold mb-1">
          🧪 Notification Test Panel
        </Text>
        <Text className="text-orange-100 text-sm">
          Test in-app notifications functionality
        </Text>
      </View>

      {/* User Info */}
      <View className="bg-white rounded-lg p-4 mb-4">
        <Text className="text-gray-600 text-sm mb-1">Logged in as:</Text>
        <Text className="text-gray-900 font-semibold">
          {user?.email || 'Not logged in'}
        </Text>
        <Text className="text-gray-600 text-sm mt-1">
          User ID: {user?.id || 'N/A'}
        </Text>
        <Text className="text-gray-600 text-sm">
          Badge Count: {badgeCount}
        </Text>
      </View>

      {/* Test Notifications */}
      <Text className="text-gray-700 font-bold text-base mb-3">
        Test Notifications
      </Text>

      <TestButton
        onPress={handleTestImmediate}
        title="Test Immediate Notification"
        icon="flash"
        color="#10b981"
      />

      <TestButton
        onPress={handleTestScheduled}
        title="Test Scheduled (5s delay)"
        icon="time"
        color="#3b82f6"
      />

      <TestButton
        onPress={handleTestOrderUpdate}
        title="Test Order Update"
        icon="restaurant"
        color="#f59e0b"
      />

      <TestButton
        onPress={handleTestReservation}
        title="Test Reservation"
        icon="calendar"
        color="#8b5cf6"
      />

      <TestButton
        onPress={handleTestPromotion}
        title="Test Promotion"
        icon="pricetag"
        color="#ec4899"
      />

      {/* Backend Integration */}
      <Text className="text-gray-700 font-bold text-base mb-3 mt-6">
        Backend Integration
      </Text>

      <TestButton
        onPress={handleCheckBackend}
        title="Check Backend for New Notifications"
        icon="cloud-download"
        color="#6366f1"
      />

      <TestButton
        onPress={handleSyncBadge}
        title="Sync Badge Count with Backend"
        icon="sync"
        color="#06b6d4"
      />

      {/* Badge Management */}
      <Text className="text-gray-700 font-bold text-base mb-3 mt-6">
        Badge Management
      </Text>

      <TestButton
        onPress={handleGetBadgeCount}
        title="Get Current Badge Count"
        icon="information-circle"
        color="#64748b"
      />

      <TestButton
        onPress={handleSetBadgeCount}
        title="Increment Badge Count"
        icon="add-circle"
        color="#10b981"
      />

      <TestButton
        onPress={handleClearBadge}
        title="Clear Badge Count"
        icon="close-circle"
        color="#ef4444"
      />

      {/* Other Actions */}
      <Text className="text-gray-700 font-bold text-base mb-3 mt-6">
        Other Actions
      </Text>

      <TestButton
        onPress={handleDismissAll}
        title="Dismiss All Notifications"
        icon="trash"
        color="#dc2626"
      />

      {/* Info */}
      <View className="bg-blue-50 rounded-lg p-4 mt-4 border border-blue-200">
        <View className="flex-row items-start">
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <View className="flex-1 ml-2">
            <Text className="text-blue-900 font-semibold mb-1">
              How to use:
            </Text>
            <Text className="text-blue-700 text-sm">
              • Test notifications will appear as popups{'\n'}
              • Tap notifications to navigate{'\n'}
              • Backend check polls for real notifications{'\n'}
              • Badge count syncs with backend{'\n'}
              • Polling runs automatically every 30s when logged in
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
