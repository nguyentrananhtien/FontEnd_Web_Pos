import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  ToastAndroid
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import api from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/auth-provider';
import useVNPayPayment from '@/hooks/useVNPayPayment';

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
  items: InvoiceItem[];
}

export default function InvoiceDetailScreen() {
  const { invoiceId } = useLocalSearchParams();
  const { user } = useAuth();
  const { loading: paying, createPaymentFromInvoice } = useVNPayPayment();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoiceDetail();
  }, [invoiceId]);

  const fetchInvoiceDetail = async () => {
    try {
      const response = await api.instance.get(`/api/invoices/${invoiceId}`);
      setInvoice(response.data);
    } catch (error) {
      console.error('Error fetching invoice detail:', error);
      showToast('Không thể tải chi tiết hóa đơn', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.LONG);
    } else {
      Alert.alert(type === 'success' ? 'Thành công' : 'Lỗi', message);
    }
  };

  const handlePayment = async () => {
    if (!invoice || !user) {
      showToast('Vui lòng đăng nhập để thanh toán', 'error');
      return;
    }

    const success = await createPaymentFromInvoice(invoice.invoiceId, user.id);

    if (success) {
      showToast('Đang chuyển đến trang thanh toán...', 'success');
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

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!invoice) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-600">Không tìm thấy hóa đơn</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-orange-600 pt-12 pb-6 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold flex-1">
            Chi tiết hóa đơn
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Invoice Info */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <View className="flex-row justify-between items-start mb-3">
            <View>
              <Text className="text-lg font-bold text-gray-900">
                Hóa đơn #{invoice.invoiceId}
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                {formatDate(invoice.createdAt)}
              </Text>
            </View>
            <View
              style={{ backgroundColor: getStatusColor(invoice.status) }}
              className="px-3 py-1 rounded-full"
            >
              <Text className="text-xs font-medium text-white">
                {getStatusText(invoice.status)}
              </Text>
            </View>
          </View>

          <View className="border-t border-gray-100 pt-3">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-600">Mã đơn hàng:</Text>
              <Text className="text-sm font-medium text-gray-900">
                #{invoice.orderId}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Khách hàng:</Text>
              <Text className="text-sm font-medium text-gray-900">
                {invoice.userName}
              </Text>
            </View>
          </View>
        </View>

        {/* Items */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-base font-bold text-gray-900 mb-3">
            Chi tiết món ăn
          </Text>

          {invoice.items && invoice.items.map((item, index) => (
            <View
              key={index}
              className="flex-row justify-between items-start py-3 border-b border-gray-100"
            >
              <View className="flex-1 mr-2">
                <Text className="text-sm font-medium text-gray-900">
                  {item.dishName}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  {formatCurrency(item.unitPrice)} x {item.quantity}
                </Text>
              </View>
              <Text className="text-sm font-medium text-gray-900">
                {formatCurrency(item.subtotal)}
              </Text>
            </View>
          ))}
        </View>

        {/* Payment Summary */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-base font-bold text-gray-900 mb-3">
            Tổng thanh toán
          </Text>

          <View className="space-y-2">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-600">Tạm tính:</Text>
              <Text className="text-sm text-gray-900">
                {formatCurrency(invoice.subtotal)}
              </Text>
            </View>

            {invoice.discount > 0 && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-600">Giảm giá:</Text>
                <Text className="text-sm text-red-600">
                  -{formatCurrency(invoice.discount)}
                </Text>
              </View>
            )}

            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-600">Thuế VAT (10%):</Text>
              <Text className="text-sm text-gray-900">
                {formatCurrency(invoice.tax)}
              </Text>
            </View>

            <View className="border-t border-gray-200 pt-3 mt-2">
              <View className="flex-row justify-between">
                <Text className="text-lg font-bold text-gray-900">
                  Tổng cộng:
                </Text>
                <Text className="text-lg font-bold text-orange-600">
                  {formatCurrency(invoice.finalAmount)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Button */}
        {invoice.status === 'PENDING' && (
          <TouchableOpacity
            onPress={handlePayment}
            disabled={paying}
            className={`rounded-lg py-4 mb-6 shadow-sm ${
              paying ? 'bg-gray-400' : 'bg-orange-600'
            }`}
          >
            {paying ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator color="#fff" size="small" />
                <Text className="text-white font-bold text-base ml-2">
                  Đang xử lý...
                </Text>
              </View>
            ) : (
              <Text className="text-white text-center font-bold text-base">
                💳 Thanh toán ngay
              </Text>
            )}
          </TouchableOpacity>
        )}

        {invoice.status === 'PAID' && (
          <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <Text className="text-green-700 font-semibold ml-2">
                Hóa đơn đã được thanh toán
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

