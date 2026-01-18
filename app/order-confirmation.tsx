import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/providers/cart-provider';
import api, { orderApi, reservationApi, ReservationDTO } from '@/services/api';
import { formatPrice } from '@/services/utils';
import { useAuth } from '@/providers/auth-provider';

type PaymentMethod = 'cash' | 'bank_transfer';

export default function OrderConfirmationScreen() {
  const { user } = useAuth();
  const { cart, getTotalAmount, clearCart, selectedReservationId, setReservation } = useCart();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('cash');
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [userReservations, setUserReservations] = useState<ReservationDTO[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);

  const totalAmount = getTotalAmount();

  useEffect(() => {
    loadUserReservations();
  }, [user]);

  const loadUserReservations = async () => {
    if (!user?.id) {
      setLoadingReservations(false);
      return;
    }

    try {
      setLoadingReservations(true);
      const reservations = await reservationApi.getByUserId(user.id);
      // Only show confirmed reservations that haven't been completed or cancelled
      const activeReservations = reservations.filter(
        r => r.status === 'CHECKED_IN' || r.status === 'PENDING'
      );
      setUserReservations(activeReservations);
    } catch (error) {
      console.error('Failed to load reservations:', error);
    } finally {
      setLoadingReservations(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (cart.length === 0) {
      Alert.alert("Giỏ hàng trống", "Giỏ hàng của bạn đang trống. Vui lòng thêm món ăn trước.");
      return;
    }

    if (!user?.id) {
      Alert.alert("Yêu cầu đăng nhập", "Vui lòng đăng nhập để đặt hàng.");
      return;
    }

    Alert.alert(
      "Xác nhận đơn hàng",
      `Bạn sắp đặt đơn hàng với phương thức thanh toán ${selectedPaymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}. Tổng: ${formatPrice(totalAmount)}`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: async () => {
            try {
              const orderData = {
                customerId: user.id,
                reservationId: selectedReservationId || undefined,
                status: "PENDING" as const,
                paymentStatus: "PENDING" as const,
                totalAmount: totalAmount,
                items: cart.map(item => ({
                  dishId: item.dishId,
                  dishName: item.name,
                  quantity: item.quantity,
                  unitPrice: item.price,
                })),
              };

              console.log('📦 Creating order:', orderData);
              const order = await orderApi.create(orderData);
              console.log("✅ Order created:", order);

              // Backend auto-creates invoice asynchronously
              // Wait a moment then try to get invoice
              let invoice = null;
              try {
                console.log('⏳ Waiting for invoice to be created...');
                // Wait 1.5 seconds for async invoice creation
                await new Promise(resolve => setTimeout(resolve, 1500));

                console.log('📄 Fetching invoice for order:', order.id);
                const invoiceResponse = await api.instance.get(`/api/invoices/order/${order.id}`);
                invoice = invoiceResponse.data;
                console.log("✅ Invoice found:", invoice.invoiceId);
              } catch (invoiceError: any) {
                console.error("⚠️ Invoice not ready yet:", invoiceError.response?.status);
                // Invoice might still be creating, that's ok
              }

              clearCart();

              Alert.alert(
                "Đặt hàng thành công!",
                invoice
                  ? `Đơn hàng #${order.id} đã được đặt thành công.\n\nHóa đơn #${invoice.invoiceId} đã sẵn sàng. Bạn có thể thanh toán ngay hoặc xem sau.`
                  : `Đơn hàng #${order.id} đã được đặt thành công.\n\nHóa đơn đang được tạo. Vui lòng kiểm tra mục "Hóa đơn" sau ít phút.`,
                [
                  invoice && {
                    text: "Xem hóa đơn",
                    onPress: () => router.push('/invoices' as Href),
                  },
                  {
                    text: "Xem đơn hàng",
                    onPress: () => router.push('/(tabs)/orders' as Href),
                  },
                  {
                    text: "Về trang chủ",
                    onPress: () => router.push('/(tabs)/home' as Href),
                  },
                ].filter(Boolean) as any
              );
            } catch (error) {
              console.error("❌ Error creating order:", error);
              Alert.alert(
                "Đặt hàng thất bại",
                "Không thể đặt hàng. Vui lòng thử lại.",
                [{ text: "OK" }]
              );
            }
          }
        }
      ]
    );
  };

  const handleBackToMenu = () => {
    router.replace("/(tabs)/menu" as Href);
  };

  if (orderConfirmed) {
    return (
      <SafeAreaView className="order-confirmation flex-1 bg-gray-100">
        <View className="order-confirmation__content flex-1 justify-center items-center px-6">
          <View className="order-confirmation__success-icon w-24 h-24 bg-green-500 rounded-full justify-center items-center mb-6 shadow-lg">
            <Ionicons name="checkmark" size={50} color="white" />
          </View>

          <Text className="order-confirmation__title text-2xl font-bold text-gray-800 mb-2">Order Confirmed!</Text>
          <Text className="order-confirmation__subtitle text-gray-600 text-center mb-6 leading-6">
            Your order has been successfully placed and is being prepared.
          </Text>

          <View className="order-confirmation__details bg-white p-6 rounded-xl w-full mb-8 shadow-sm">
            <View className="order-confirmation__order-info items-center mb-4">
              <Text className="order-confirmation__order-number text-lg font-semibold text-gray-800">Order {orderNumber}</Text>
              <Text className="order-confirmation__table-info text-sm text-gray-500 mt-1">Table T02 • Dine-in</Text>
            </View>

            <View className="order-confirmation__divider border-t border-gray-200 pt-4">
              <View className="order-confirmation__payment-info flex-row justify-between items-center mb-2">
                <Text className="text-gray-600">Payment Method:</Text>
                <Text className="font-semibold text-gray-800">
                  {selectedPaymentMethod === 'cash' ? 'Cash' : 'Bank Transfer'}
                </Text>
              </View>
              <View className="order-confirmation__status-info flex-row justify-between items-center">
                <Text className="text-gray-600">Status:</Text>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-orange-500 rounded-full mr-2"></View>
                  <Text className="font-semibold text-orange-600">Preparing</Text>
                </View>
              </View>
            </View>
          </View>

          <View className="order-confirmation__actions w-full">
            <TouchableOpacity
              className="order-confirmation__btn-primary bg-orange-500 w-full py-4 rounded-xl items-center shadow-sm"
              onPress={handleBackToMenu}
            >
              <Text className="text-white font-semibold text-lg">Back to Menu</Text>
            </TouchableOpacity>
          </View>

          <Text className="order-confirmation__footer-text text-gray-400 text-center text-sm mt-8 leading-5">
            Thank you for your order!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="order-confirmation flex-1 bg-gray-100">
      <ScrollView className="order-confirmation__scroll flex-1">
        {/* Header */}
        <View className="order-confirmation__header px-4 py-4 bg-white shadow-sm">
          <View className="order-confirmation__header-content flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text className="order-confirmation__header-title text-xl font-bold text-gray-800">Xác nhận đơn hàng</Text>
          </View>
        </View>

        <View className="order-confirmation__body px-4 py-6">
          {/* Order Summary */}
          <View className="order-confirmation__summary bg-white rounded-xl p-4 mb-6 shadow-sm">
            <Text className="order-confirmation__summary-title text-lg font-bold text-gray-800 mb-4">Tóm tắt đơn hàng</Text>
            {cart.map((item, index) => (
              <View key={index} className="order-confirmation__item flex-row justify-between items-center py-2">
                <View className="order-confirmation__item-info flex-1">
                  <Text className="order-confirmation__item-name text-gray-800 font-medium">{item.name}</Text>
                  <Text className="order-confirmation__item-quantity text-sm text-gray-500">Số lượng: {item.quantity}</Text>
                </View>
                <Text className="order-confirmation__item-price font-semibold text-gray-800">{formatPrice(item.price * item.quantity)}</Text>
              </View>
            ))}
            <View className="order-confirmation__divider border-t border-gray-200 my-3"></View>
            <View className="order-confirmation__total flex-row justify-between items-center">
              <Text className="order-confirmation__total-label text-lg font-bold text-gray-800">Tổng cộng</Text>
              <Text className="order-confirmation__total-amount text-xl font-bold text-orange-500">{formatPrice(totalAmount)}</Text>
            </View>
          </View>

          {/* Reservation Selection */}
          <View className="order-confirmation__reservation bg-white rounded-xl p-4 mb-6 shadow-sm">
            <Text className="order-confirmation__reservation-title text-lg font-bold text-gray-800 mb-4">
              Chọn bàn đã đặt (tùy chọn)
            </Text>

            {loadingReservations ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#F08B3C" />
                <Text className="text-gray-500 text-sm mt-2">Đang tải...</Text>
              </View>
            ) : userReservations.length > 0 ? (
              <>
                <TouchableOpacity
                  className={`flex-row items-center p-3 rounded-xl border-2 mb-2 ${
                    selectedReservationId === null ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'
                  }`}
                  onPress={() => setReservation(null)}
                >
                  <View className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                    selectedReservationId === null ? 'border-orange-500' : 'border-gray-300'
                  }`}>
                    {selectedReservationId === null && (
                      <View className="w-2.5 h-2.5 rounded-full bg-orange-500"></View>
                    )}
                  </View>
                  <Text className={`font-medium ${
                    selectedReservationId === null ? 'text-orange-600' : 'text-gray-800'
                  }`}>Không dùng đặt bàn</Text>
                </TouchableOpacity>

                {userReservations.map((reservation) => (
                  <TouchableOpacity
                    key={reservation.reservationId}
                    className={`flex-row items-center p-3 rounded-xl border-2 mb-2 ${
                      selectedReservationId === reservation.reservationId 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                    onPress={() => setReservation(reservation.reservationId!)}
                  >
                    <View className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                      selectedReservationId === reservation.reservationId ? 'border-orange-500' : 'border-gray-300'
                    }`}>
                      {selectedReservationId === reservation.reservationId && (
                        <View className="w-2.5 h-2.5 rounded-full bg-orange-500"></View>
                      )}
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Ionicons name="restaurant" size={16} color="#F08B3C" />
                        <Text className={`ml-2 font-semibold ${
                          selectedReservationId === reservation.reservationId ? 'text-orange-600' : 'text-gray-800'
                        }`}>
                          Bàn {reservation.tableCode}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
                        <Text className="ml-1 text-xs text-gray-500">
                          {new Date(reservation.reservationDate).toLocaleDateString('vi-VN')}
                        </Text>
                        <Ionicons name="time-outline" size={14} color="#9CA3AF" className="ml-2" />
                        <Text className="ml-1 text-xs text-gray-500">
                          {reservation.timeSlotLabel || `Slot ${reservation.timeSlotId}`}
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-400 mt-1">
                        {reservation.numberOfGuests} người • {reservation.status}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <View className="py-4 items-center">
                <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
                <Text className="text-gray-500 text-sm mt-2 text-center">
                  Bạn chưa có bàn đặt trước
                </Text>
                <TouchableOpacity
                  className="mt-3 bg-orange-100 px-4 py-2 rounded-lg"
                  onPress={() => router.push('/(tabs)/dining' as Href)}
                >
                  <Text className="text-orange-600 font-semibold text-sm">Đặt bàn ngay</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Payment Method Selection */}
          <View className="order-confirmation__payment bg-white rounded-xl p-4 shadow-sm">
            <Text className="order-confirmation__payment-title text-lg font-bold text-gray-800 mb-4">Phương thức thanh toán</Text>

            {/* Cash Option */}
            <TouchableOpacity
              className={`order-confirmation__payment-option flex-row items-center p-4 rounded-xl border-2 mb-3 ${
                selectedPaymentMethod === 'cash' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'
              }`}
              onPress={() => setSelectedPaymentMethod('cash')}
            >
              <View className={`order-confirmation__payment-radio w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
                selectedPaymentMethod === 'cash' ? 'border-orange-500' : 'border-gray-300'
              }`}>
                {selectedPaymentMethod === 'cash' && (
                  <View className="order-confirmation__payment-radio-inner w-3 h-3 rounded-full bg-orange-500"></View>
                )}
              </View>
              <Ionicons
                name="cash-outline"
                size={24}
                color={selectedPaymentMethod === 'cash' ? '#f97316' : '#6b7280'}
              />
              <View className="order-confirmation__payment-option-text ml-3">
                <Text className={`order-confirmation__payment-option-label font-semibold ${
                  selectedPaymentMethod === 'cash' ? 'text-orange-600' : 'text-gray-800'
                }`}>Tiền mặt</Text>
                <Text className="order-confirmation__payment-option-desc text-sm text-gray-500">Thanh toán bằng tiền mặt</Text>
              </View>
            </TouchableOpacity>

            {/* Bank Transfer Option */}
            <TouchableOpacity
              className={`order-confirmation__payment-option flex-row items-center p-4 rounded-xl border-2 ${
                selectedPaymentMethod === 'bank_transfer' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'
              }`}
              onPress={() => setSelectedPaymentMethod('bank_transfer')}
            >
              <View className={`order-confirmation__payment-radio w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
                selectedPaymentMethod === 'bank_transfer' ? 'border-orange-500' : 'border-gray-300'
              }`}>
                {selectedPaymentMethod === 'bank_transfer' && (
                  <View className="order-confirmation__payment-radio-inner w-3 h-3 rounded-full bg-orange-500"></View>
                )}
              </View>
              <Ionicons
                name="card-outline"
                size={24}
                color={selectedPaymentMethod === 'bank_transfer' ? '#f97316' : '#6b7280'}
              />
              <View className="order-confirmation__payment-option-text ml-3">
                <Text className={`order-confirmation__payment-option-label font-semibold ${
                  selectedPaymentMethod === 'bank_transfer' ? 'text-orange-600' : 'text-gray-800'
                }`}>Chuyển khoản</Text>
                <Text className="order-confirmation__payment-option-desc text-sm text-gray-500">Thanh toán qua chuyển khoản</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View className="order-confirmation__footer px-4 py-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="order-confirmation__btn-confirm bg-orange-500 py-4 rounded-xl items-center shadow-sm"
          onPress={handleConfirmOrder}
        >
          <Text className="text-white font-bold text-lg">Xác nhận đơn hàng • {formatPrice(totalAmount)}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
