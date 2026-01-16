import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import paymentService from '@/services/paymentService';

export default function PaymentResultScreen() {
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    processPaymentResult();
  }, []);

  const processPaymentResult = async () => {
    try {
      const result = paymentService.parsePaymentResult(params as any);
      setPaymentData(result);

      // If we have txnRef, fetch payment details
      if (result.txnRef) {
        try {
          const details = await paymentService.getPaymentByTxnRef(result.txnRef);
          setPaymentData({ ...result, details });
        } catch (error) {
          console.log('Could not fetch payment details:', error);
        }
      }
    } catch (error) {
      console.error('Error processing payment result:', error);
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = paymentData && paymentService.isPaymentSuccessful(paymentData);

  const handleViewOrders = () => {
    router.replace('/(tabs)/orders');
  };

  const handleViewOrderDetail = () => {
    if (paymentData?.orderId) {
      router.push(`/order-detail?orderId=${paymentData.orderId}`);
    } else {
      router.replace('/(tabs)/orders');
    }
  };

  const handleGoHome = () => {
    router.replace('/(tabs)/home');
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="text-gray-600 mt-4">Đang xử lý kết quả thanh toán...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={isSuccess ? ['#10b981', '#059669'] : ['#ef4444', '#dc2626']}
        className="pt-12 pb-6 px-4"
      >
        <View className="items-center">
          <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-4">
            <Ionicons
              name={isSuccess ? 'checkmark-circle' : 'close-circle'}
              size={64}
              color={isSuccess ? '#10b981' : '#ef4444'}
            />
          </View>
          <Text className="text-white text-2xl font-bold mb-2">
            {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
          </Text>
          <Text className="text-white/90 text-center">
            {isSuccess
              ? 'Đơn hàng của bạn đã được xác nhận và đang được xử lý'
              : 'Giao dịch không thành công. Vui lòng thử lại'}
          </Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <View className="flex-1 px-4 pt-6">
        {isSuccess ? (
          <>
            {/* Payment Info */}
            <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
              <Text className="text-lg font-bold text-gray-900 mb-4">
                Thông tin thanh toán
              </Text>

              {paymentData.orderId && (
                <View className="flex-row justify-between mb-3 pb-3 border-b border-gray-100">
                  <Text className="text-sm text-gray-600">Mã đơn hàng:</Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    #{paymentData.orderId}
                  </Text>
                </View>
              )}

              {paymentData.amount && (
                <View className="flex-row justify-between mb-3 pb-3 border-b border-gray-100">
                  <Text className="text-sm text-gray-600">Số tiền:</Text>
                  <Text className="text-base font-bold text-orange-600">
                    {Number(paymentData.amount).toLocaleString('vi-VN')} VNĐ
                  </Text>
                </View>
              )}

              {paymentData.txnRef && (
                <View className="flex-row justify-between mb-3 pb-3 border-b border-gray-100">
                  <Text className="text-sm text-gray-600">Mã giao dịch:</Text>
                  <Text className="text-sm font-mono text-gray-900">
                    {paymentData.txnRef}
                  </Text>
                </View>
              )}

              {paymentData.transactionId && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Mã GD VNPay:</Text>
                  <Text className="text-sm font-mono text-gray-900">
                    {paymentData.transactionId}
                  </Text>
                </View>
              )}
            </View>

            {/* Success Message */}
            <View className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={24} color="#10b981" />
                <View className="flex-1 ml-3">
                  <Text className="text-green-900 font-semibold mb-1">
                    Thanh toán đã được xác nhận
                  </Text>
                  <Text className="text-green-700 text-sm">
                    Đơn hàng của bạn đang được chuẩn bị. Bạn sẽ nhận được thông báo khi đơn hàng sẵn sàng.
                  </Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Error Info */}
            <View className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-4">
              <View className="flex-row items-start">
                <Ionicons name="alert-circle" size={24} color="#ef4444" />
                <View className="flex-1 ml-3">
                  <Text className="text-red-900 font-semibold mb-2">
                    Lý do thất bại:
                  </Text>
                  <Text className="text-red-700 text-sm">
                    {paymentData?.error || 'Giao dịch bị hủy hoặc có lỗi xảy ra'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Help Text */}
            <View className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4">
              <View className="flex-row items-start">
                <Ionicons name="help-circle" size={24} color="#f59e0b" />
                <View className="flex-1 ml-3">
                  <Text className="text-yellow-900 font-semibold mb-1">
                    Bạn có thể:
                  </Text>
                  <Text className="text-yellow-700 text-sm">
                    • Thử lại thanh toán{'\n'}
                    • Chọn phương thức thanh toán khác{'\n'}
                    • Liên hệ hỗ trợ nếu vấn đề tiếp diễn
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Actions */}
        <View className="mt-auto mb-6">
          {isSuccess ? (
            <>
              {paymentData?.orderId && (
                <TouchableOpacity
                  onPress={handleViewOrderDetail}
                  className="bg-orange-600 rounded-xl py-4 mb-3 shadow-sm"
                >
                  <Text className="text-white text-center font-bold text-base">
                    Xem chi tiết đơn hàng
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleViewOrders}
                className="bg-white border-2 border-orange-600 rounded-xl py-4 mb-3"
              >
                <Text className="text-orange-600 text-center font-bold text-base">
                  Xem danh sách đơn hàng
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleGoHome}
                className="bg-gray-100 rounded-xl py-4"
              >
                <Text className="text-gray-700 text-center font-semibold text-base">
                  Về trang chủ
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={handleViewOrders}
                className="bg-orange-600 rounded-xl py-4 mb-3 shadow-sm"
              >
                <Text className="text-white text-center font-bold text-base">
                  Thử lại thanh toán
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleGoHome}
                className="bg-gray-100 rounded-xl py-4"
              >
                <Text className="text-gray-700 text-center font-semibold text-base">
                  Về trang chủ
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}
