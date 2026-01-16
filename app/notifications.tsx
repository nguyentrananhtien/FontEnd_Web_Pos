import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';
import api from '@/services/api';
import { Ionicons } from '@expo/vector-icons';

interface Notification {
  notificationId: number;
  title: string;
  message: string;
  type: 'PROMOTION' | 'ORDER_UPDATE' | 'RESERVATION' | 'SYSTEM';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
}

interface UserNotification {
  userNotificationId: number;
  userId: number;
  notificationId: number;
  isRead: boolean;
  sentAt: string;
  notification: Notification;
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      const [notifResponse, countResponse] = await Promise.all([
        api.instance.get(`/api/notifications/user/${user.id}`),
        api.instance.get(`/api/notifications/user/${user.id}/unread/count`)
      ]);

      setNotifications(notifResponse.data);
      setUnreadCount(countResponse.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Lỗi', 'Không thể tải thông báo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (userNotificationId: number) => {
    try {
      await api.instance.put(`/api/notifications/read/${userNotificationId}`);
      fetchNotifications(); // Refresh to update read status
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationPress = (item: UserNotification) => {
    if (!item.isRead) {
      markAsRead(item.userNotificationId);
    }

    // Navigate based on notification type
    if (item.notification.type === 'ORDER_UPDATE') {
      router.push('/(tabs)/orders');
    } else if (item.notification.type === 'RESERVATION') {
      router.push('/(tabs)/dining');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PROMOTION':
        return 'pricetag';
      case 'ORDER_UPDATE':
        return 'restaurant';
      case 'RESERVATION':
        return 'calendar';
      case 'SYSTEM':
        return 'information-circle';
      default:
        return 'notifications';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PROMOTION':
        return '#f59e0b';
      case 'ORDER_UPDATE':
        return '#10b981';
      case 'RESERVATION':
        return '#3b82f6';
      case 'SYSTEM':
        return '#6366f1';
      default:
        return '#6b7280';
    }
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'HIGH' || priority === 'URGENT') {
      return (
        <View className="bg-red-100 px-2 py-1 rounded">
          <Text className="text-xs font-medium text-red-600">Quan trọng</Text>
        </View>
      );
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderNotification = ({ item }: { item: UserNotification }) => (
    <TouchableOpacity
      onPress={() => handleNotificationPress(item)}
      className={`bg-white border-b border-gray-100 px-4 py-4 ${
        !item.isRead ? 'bg-orange-50' : ''
      }`}
    >
      <View className="flex-row">
        <View
          style={{ backgroundColor: getTypeColor(item.notification.type) }}
          className="w-12 h-12 rounded-full items-center justify-center mr-3"
        >
          <Ionicons
            name={getTypeIcon(item.notification.type) as any}
            size={24}
            color="white"
          />
        </View>

        <View className="flex-1">
          <View className="flex-row items-start justify-between mb-1">
            <Text
              className={`text-base flex-1 ${
                item.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold'
              }`}
            >
              {item.notification.title}
            </Text>
            {!item.isRead && (
              <View className="w-2 h-2 bg-orange-600 rounded-full ml-2 mt-2" />
            )}
          </View>

          <Text className="text-sm text-gray-600 mb-2">
            {item.notification.message}
          </Text>

          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-gray-400">
              {formatDate(item.sentAt)}
            </Text>
            {getPriorityBadge(item.notification.priority)}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="text-gray-600 mt-2">Đang tải...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-orange-600 pt-12 pb-6 px-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Thông báo</Text>
          </View>
          {unreadCount > 0 && (
            <View className="bg-white px-3 py-1 rounded-full">
              <Text className="text-orange-600 font-bold text-sm">
                {unreadCount} mới
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      {notifications.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="notifications-off-outline" size={64} color="#d1d5db" />
          <Text className="text-gray-500 mt-4 text-center">
            Bạn chưa có thông báo nào
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.userNotificationId.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#f97316']}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

