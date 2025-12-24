import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/providers/cart-provider';
import { orderApi } from '@/services/api';
import { formatPrice } from '@/services/utils';

type PaymentMethod = 'cash' | 'bank_transfer';

export default function OrderConfirmationScreen() {
  const { cart, getTotalAmount, clearCart } = useCart();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('cash');
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');

  const totalAmount = getTotalAmount();

  const handleConfirmOrder = async () => {
    if (cart.length === 0) {
      Alert.alert("Empty Cart", "Your cart is empty. Please add items before placing an order.");
      return;
    }

    Alert.alert(
      "Confirm Order",
      `You are about to place an order with ${selectedPaymentMethod === 'cash' ? 'Cash' : 'Bank Transfer'} payment method. Total: ${formatPrice(totalAmount)}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              const orderData = {
                tableNumber: "T02",
                status: "PENDING" as const,
                paymentStatus: "PENDING" as const,
                paymentMethod: selectedPaymentMethod.toUpperCase(),
                totalAmount: totalAmount,
                items: cart.map(item => ({
                  dishId: item.dishId,
                  dishName: item.name,
                  quantity: item.quantity,
                  unitPrice: item.price,
                  specialRequests: undefined,
                })),
              };

              const order = await orderApi.create(orderData);
              console.log("Order created:", order);

              clearCart();

              Alert.alert(
                "Order Confirmed!",
                `Your order #${order.id} has been placed successfully.`,
                [
                  {
                    text: "View Orders",
                    onPress: () => router.push('/order-list' as Href),
                  },
                  {
                    text: "Back to Menu",
                    onPress: () => router.push('/(tabs)/screen/menu' as Href),
                  },
                ]
              );
            } catch (error) {
              console.error("Error creating order:", error);
              Alert.alert(
                "Order Failed",
                "Failed to place your order. Please try again.",
                [{ text: "OK" }]
              );
            }
          }
        }
      ]
    );
  };

  const handleBackToMenu = () => {
    router.replace("/(tabs)/screen/menu" as Href);
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
            <Text className="order-confirmation__header-title text-xl font-bold text-gray-800">Confirm Order</Text>
          </View>
        </View>

        <View className="order-confirmation__body px-4 py-6">
          {/* Order Summary */}
          <View className="order-confirmation__summary bg-white rounded-xl p-4 mb-6 shadow-sm">
            <Text className="order-confirmation__summary-title text-lg font-bold text-gray-800 mb-4">Order Summary</Text>
            {cart.map((item, index) => (
              <View key={index} className="order-confirmation__item flex-row justify-between items-center py-2">
                <View className="order-confirmation__item-info flex-1">
                  <Text className="order-confirmation__item-name text-gray-800 font-medium">{item.name}</Text>
                  <Text className="order-confirmation__item-quantity text-sm text-gray-500">Qty: {item.quantity}</Text>
                </View>
                <Text className="order-confirmation__item-price font-semibold text-gray-800">{formatPrice(item.price * item.quantity)}</Text>
              </View>
            ))}
            <View className="order-confirmation__divider border-t border-gray-200 my-3"></View>
            <View className="order-confirmation__total flex-row justify-between items-center">
              <Text className="order-confirmation__total-label text-lg font-bold text-gray-800">Total</Text>
              <Text className="order-confirmation__total-amount text-xl font-bold text-orange-500">{formatPrice(totalAmount)}</Text>
            </View>
          </View>

          {/* Payment Method Selection */}
          <View className="order-confirmation__payment bg-white rounded-xl p-4 shadow-sm">
            <Text className="order-confirmation__payment-title text-lg font-bold text-gray-800 mb-4">Payment Method</Text>

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
                }`}>Cash</Text>
                <Text className="order-confirmation__payment-option-desc text-sm text-gray-500">Pay with cash</Text>
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
                }`}>Bank Transfer</Text>
                <Text className="order-confirmation__payment-option-desc text-sm text-gray-500">Pay via bank transfer</Text>
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
          <Text className="text-white font-bold text-lg">Confirm Order • {formatPrice(totalAmount)}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
