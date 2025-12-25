import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { orderApi } from '@/api/orderApi';
import { CircularSpinner } from '@/components/CircularSpinner';
import { OrderDTO } from '@/services/types';

export default function OrderDetailScreen() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<string>('qr');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await orderApi.getOrdersByStatus('PENDING');
      setOrders(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (orderId: number | undefined, totalAmount: number) => {
    if (!orderId) return;

    if (selectedPayment === 'vnpay') {
      try {
        const paymentResponse = await orderApi.createVNPayPayment({
          orderId,
          amount: totalAmount,
          orderInfo: `Payment for order #${orderId}`,
        });

        if (paymentResponse.paymentUrl) {
          Linking.openURL(paymentResponse.paymentUrl);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to create payment');
      }
    } else {
      Alert.alert('Success', 'Payment method selected: ' + selectedPayment);
    }
  };

  const renderPaymentMethods = () => (
    <View className="bg-white rounded-xl p-4 mb-4">
      <Text className="text-gray-900 text-sm font-medium mb-4">
        Select payment method
      </Text>
      <View className="flex-row flex-wrap gap-3">
        {[
          { id: 'qr', label: '💵 Cash', color: '#D97639' },
          { id: 'vnpay', label: 'VNPAY', color: '#0066CC' },
          { id: 'google', label: 'G Pay', color: '#4285F4' },
        ].map((method) => (
          <TouchableOpacity
            key={method.id}
            onPress={() => setSelectedPayment(method.id)}
            className={`flex-1 min-w-[100px] p-4 rounded-xl border-2 items-center justify-center ${
              selectedPayment === method.id ? 'bg-orange-50' : 'bg-white'
            }`}
            style={{
              borderColor: selectedPayment === method.id ? method.color : '#E5E7EB',
              boxShadow: selectedPayment === method.id
                ? '0 0 0 4px rgba(217, 118, 57, 0.1)'
                : 'none',
            }}
          >
            <Text className="text-sm font-semibold">{method.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderOrderItem = (order: OrderDTO) => (
    <View key={order.id} className="bg-white rounded-xl p-4 mb-4">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-bold text-gray-900">
          Order #{order.id}
        </Text>
        <View className={`px-3 py-1 rounded-full ${
          order.status === 'PENDING' ? 'bg-yellow-100' :
          order.status === 'CONFIRMED' ? 'bg-blue-100' :
          order.status === 'READY' ? 'bg-green-100' : 'bg-gray-100'
        }`}>
          <Text className={`text-xs font-semibold ${
            order.status === 'PENDING' ? 'text-yellow-800' :
            order.status === 'CONFIRMED' ? 'text-blue-800' :
            order.status === 'READY' ? 'text-green-800' : 'text-gray-800'
          }`}>
            {order.status}
          </Text>
        </View>
      </View>

      <View className="border-b border-gray-200 pb-3 mb-3">
        <View className="flex-row justify-between mb-2">
          <Text className="text-xs text-gray-500 uppercase">No.</Text>
          <Text className="text-xs text-gray-500 uppercase flex-1 ml-4">Dishes</Text>
          <Text className="text-xs text-gray-500 uppercase w-16 text-center">Count</Text>
          <Text className="text-xs text-gray-500 uppercase w-20 text-right">Price</Text>
        </View>

        {order.items?.map((item, index) => (
          <View key={index} className="flex-row justify-between items-center py-2">
            <Text className="text-sm text-gray-900 w-8">{index + 1}</Text>
            <View className="flex-1 flex-row items-center ml-4">
              <View className="w-12 h-12 bg-gray-200 rounded-lg mr-2" />
              <Text className="text-sm text-gray-900 font-medium flex-1">
                Dish #{item.dishId}
              </Text>
            </View>
            <Text className="text-sm text-gray-900 w-16 text-center">
              {item.quantity}
            </Text>
            <Text className="text-sm text-gray-900 font-semibold w-20 text-right">
              ${item.unitPrice}
            </Text>
          </View>
        ))}
      </View>

      <View className="space-y-2 mb-3">
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-700">Subtotal</Text>
          <Text className="text-sm text-gray-900">${order.totalAmount}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-700">Discount</Text>
          <Text className="text-sm text-green-600">-$0</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-700">GST</Text>
          <Text className="text-sm text-gray-900">$0</Text>
        </View>
      </View>

      <View className="border-t-2 border-gray-200 pt-3 mb-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-bold text-gray-900">Total</Text>
          <Text className="text-xl font-bold text-gray-900">
            ${order.totalAmount}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => handlePayment(order.id, order.totalAmount)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#F5A86E', '#D97639']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="rounded-xl py-4 items-center"
          style={{ boxShadow: '0 4px 12px rgba(217, 118, 57, 0.3)' }}
        >
          <Text className="text-white text-base font-semibold">
            Make Payment
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <CircularSpinner size={60} color="#f97316" />
        <Text className="text-gray-600 mt-4 text-base">Loading orders...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Text className="text-2xl">←</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">
            Order Details
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {renderPaymentMethods()}
        {orders.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-500 text-base">No orders found</Text>
          </View>
        ) : (
          orders.map((order) => renderOrderItem(order))
        )}
      </ScrollView>
    </View>
  );
}

