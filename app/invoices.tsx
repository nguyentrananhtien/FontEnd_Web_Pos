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

interface InvoiceItem {
  dishId: number;
  dishName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Invoice {
  invoiceId: number;
  orderId: number;
  userId: number;
  userName: string;
  subtotal: number;
  discount: number;
  tax: number;
  finalAmount: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';
  createdAt: string;
  items?: InvoiceItem[];
}

export default function InvoicesScreen() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInvoices = async () => {
    if (!user?.id) return;

    try {
      const response = await api.instance.get(`/api/invoices/user/${user.id}`);
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách hóa đơn');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInvoices();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return '#10b981';
      case 'PENDING':
        return '#f59e0b';
      case 'CANCELLED':
        return '#ef4444';
      case 'REFUNDED':
        return '#6366f1';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Đã thanh toán';
      case 'PENDING':
        return 'Chờ thanh toán';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'REFUNDED':
        return 'Đã hoàn tiền';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleInvoicePress = (invoice: Invoice) => {
    router.push({
      pathname: '/invoice-detail',
      params: { invoiceId: invoice.invoiceId }
    });
  };

  const renderInvoice = ({ item }: { item: Invoice }) => (
    <TouchableOpacity
      onPress={() => handleInvoicePress(item)}
      className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">
            Hóa đơn #{item.invoiceId}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            {formatDate(item.createdAt)}
          </Text>
        </View>
        <View
          style={{ backgroundColor: getStatusColor(item.status) }}
          className="px-3 py-1 rounded-full"
        >
          <Text className="text-xs font-medium text-white">
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View className="border-t border-gray-100 pt-3 mt-2">
        <View className="flex-row justify-between mb-1">
          <Text className="text-sm text-gray-600">Tạm tính:</Text>
          <Text className="text-sm text-gray-900">
            {formatCurrency(item.subtotal)}
          </Text>
        </View>

        {item.discount > 0 && (
          <View className="flex-row justify-between mb-1">
            <Text className="text-sm text-gray-600">Giảm giá:</Text>
            <Text className="text-sm text-red-600">
              -{formatCurrency(item.discount)}
            </Text>
          </View>
        )}

        <View className="flex-row justify-between mb-1">
          <Text className="text-sm text-gray-600">Thuế VAT:</Text>
          <Text className="text-sm text-gray-900">
            {formatCurrency(item.tax)}
          </Text>
        </View>

        <View className="flex-row justify-between pt-2 border-t border-gray-100">
          <Text className="text-base font-bold text-gray-900">Tổng cộng:</Text>
          <Text className="text-base font-bold text-orange-600">
            {formatCurrency(item.finalAmount)}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-end mt-3">
        <Ionicons name="chevron-forward" size={20} color="#f97316" />
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
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold flex-1">
            Hóa đơn của tôi
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 px-4 pt-4">
        {invoices.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Ionicons name="receipt-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 mt-4 text-center">
              Bạn chưa có hóa đơn nào
            </Text>
          </View>
        ) : (
          <FlatList
            data={invoices}
            renderItem={renderInvoice}
            keyExtractor={(item) => item.invoiceId.toString()}
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
    </View>
  );
}

