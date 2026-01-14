import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { orderApi } from '@/services/api';
import { OrderDTO } from '@/services/types';
import { formatPrice } from '@/services/utils';
import { useAuth } from '@/providers/auth-provider';

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [activeFilter, user]);

  const loadOrders = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Vui lòng đăng nhập để xem đơn hàng');
      return;
    }

    try {
      setIsLoading(true);
      let data: OrderDTO[];

      // Get orders by customer ID (logged-in user)
      data = await orderApi.getByCustomer(user.id);

      // Filter by status if needed
      if (activeFilter !== 'ALL') {
        data = data.filter(order => order.status === activeFilter);
      }

      console.log(`📦 Loaded ${data.length} orders for user ${user.id}`);
      setOrders(data);
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PREPARING':
        return 'bg-purple-100 text-purple-800';
      case 'READY':
        return 'bg-green-100 text-green-800';
      case 'SERVED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-orange-100 text-orange-800';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderOrderCard = (order: OrderDTO) => (
    <TouchableOpacity
      key={order.id}
      className="bg-white rounded-2xl p-4 mb-4 shadow-sm active:opacity-80"
      onPress={() => router.push(`/order-detail?orderId=${order.id}`)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <MaterialIcons name="receipt-long" size={20} color="#F08B3C" />
          <Text className="text-gray-800 font-bold text-base ml-2">
            Order #{order.id}
          </Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
          <Text className="text-xs font-semibold">
            {order.status}
          </Text>
        </View>
      </View>

      {/* Order Info */}
      <View className="mb-3">
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="access-time" size={16} color="#9CA3AF" />
          <Text className="text-gray-600 text-sm ml-2">
            {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
          </Text>
        </View>

        {order.reservationId && (
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="table-restaurant" size={16} color="#9CA3AF" />
            <Text className="text-gray-600 text-sm ml-2">
              Reservation #{order.reservationId}
            </Text>
          </View>
        )}
      </View>

      {/* Items Summary */}
      <View className="border-t border-gray-100 pt-3 mb-3">
        <Text className="text-gray-700 text-sm mb-2">
          {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'item' : 'items'}
        </Text>
        {order.items?.slice(0, 2).map((item, index) => (
          <View key={index} className="flex-row justify-between mb-1">
            <Text className="text-gray-600 text-sm flex-1" numberOfLines={1}>
              {item.dishName || `Dish #${item.dishId}`}
            </Text>
            <Text className="text-gray-600 text-sm ml-2">
              x{item.quantity}
            </Text>
          </View>
        ))}
        {(order.items?.length || 0) > 2 && (
          <Text className="text-gray-500 text-xs italic">
            +{(order.items?.length || 0) - 2} more items
          </Text>
        )}
      </View>

      {/* Footer */}
      <View className="flex-row justify-between items-center border-t border-gray-100 pt-3">
        <View className="flex-row items-center">
          <View className={`px-2 py-1 rounded ${getPaymentStatusColor(order.paymentStatus)}`}>
            <Text className="text-xs font-medium">
              {order.paymentStatus}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <Text className="text-gray-600 text-sm mr-2">Total:</Text>
          <Text className="text-orange-500 font-bold text-lg">
            {formatPrice(order.totalAmount)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-gray-800 font-bold text-2xl">Đơn hàng của tôi</Text>
            {user && (
              <Text className="text-gray-500 text-sm mt-1">
                {user.fullName || user.email}
              </Text>
            )}
          </View>
          {user && (
            <View className="bg-orange-100 px-3 py-2 rounded-full">
              <Text className="text-orange-700 text-xs font-semibold">
                {orders.length} đơn
              </Text>
            </View>
          )}
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          {['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'].map((filter) => (
            <TouchableOpacity
              key={filter}
              className={`mr-2 px-4 py-2 rounded-full ${
                activeFilter === filter 
                  ? 'bg-orange-500' 
                  : 'bg-gray-100'
              }`}
              onPress={() => setActiveFilter(filter)}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-semibold ${
                activeFilter === filter 
                  ? 'text-white' 
                  : 'text-gray-700'
              }`}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {!user ? (
        <View className="flex-1 justify-center items-center px-6">
          <MaterialIcons name="person-outline" size={80} color="#D1D5DB" />
          <Text className="text-gray-500 text-lg font-semibold mt-4">
            Vui lòng đăng nhập
          </Text>
          <Text className="text-gray-400 text-sm mt-2 text-center">
            Bạn cần đăng nhập để xem đơn hàng của mình
          </Text>
          <TouchableOpacity
            className="mt-6 bg-orange-500 px-6 py-3 rounded-xl active:opacity-80"
            onPress={() => router.push('/auth/login')}
            activeOpacity={0.7}
          >
            <Text className="text-white font-semibold">Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      ) : isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#F08B3C" />
          <Text className="text-gray-500 mt-4">Đang tải đơn hàng...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <MaterialIcons name="receipt-long" size={80} color="#D1D5DB" />
          <Text className="text-gray-500 text-lg font-semibold mt-4">
            No orders found
          </Text>
          <Text className="text-gray-400 text-sm mt-2 text-center">
            {activeFilter === 'ALL'
              ? 'You haven\'t placed any orders yet'
              : `No ${activeFilter.toLowerCase()} orders`}
          </Text>
          <TouchableOpacity
            className="mt-6 bg-orange-500 px-6 py-3 rounded-xl active:opacity-80"
            onPress={() => router.push('/(tabs)/menu')}
            activeOpacity={0.7}
          >
            <Text className="text-white font-semibold">Browse Menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1 px-6 py-4">
          {orders.map((order) => renderOrderCard(order))}
        </ScrollView>
      )}
    </View>
  );
}

