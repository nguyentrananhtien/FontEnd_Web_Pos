import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, TextInput, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, Href } from 'expo-router';
import { useCart } from '@/providers/cart-provider';
import { useAuth } from '@/providers/auth-provider';
import { formatPrice } from '@/services/utils';
import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DishImage from '@/components/DishImage';

interface Reservation {
  reservationId: number;
  tableId: number;
  tableCode: string;
  reservationDate: string;
  timeSlotLabel: string;
  numberOfGuests: number;
  status: string;
}

export default function CartScreen() {
  const { user } = useAuth();
  const { cart, updateQuantity, removeFromCart, getTotalAmount, clearCart } = useCart();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [loadingReservations, setLoadingReservations] = useState(false);

  useEffect(() => {
    loadUserReservations();
    loadLastReservation();
  }, [user]);

  const loadUserReservations = async () => {
    if (!user?.id) return;

    setLoadingReservations(true);
    try {
      // Use new active reservations endpoint - backend filters CONFIRMED and future dates
      const response = await api.instance.get(`/api/reservations/user/${user.id}/active`);

      // Response format: { success: true, message: "...", data: [...] }
      const reservationData = response.data.data || response.data;
      setReservations(reservationData);
    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      setLoadingReservations(false);
    }
  };

  const loadLastReservation = async () => {
    try {
      const lastResId = await AsyncStorage.getItem('LAST_RESERVATION_ID');
      if (lastResId && reservations.length > 0) {
        const lastRes = reservations.find(r => r.reservationId === parseInt(lastResId));
        if (lastRes) {
          setSelectedReservation(lastRes);
        }
      }
    } catch (error) {
      console.error('Error loading last reservation:', error);
    }
  };

  const incrementQuantity = (dishId: number) => {
    const item = cart.find(item => item.dishId === dishId);
    if (item) {
      updateQuantity(dishId, item.quantity + 1);
    }
  };

  const decrementQuantity = (dishId: number) => {
    const item = cart.find(item => item.dishId === dishId);
    if (item) {
      if (item.quantity > 1) {
        updateQuantity(dishId, item.quantity - 1);
      } else {
        Alert.alert(
          "Remove Item",
          "Are you sure you want to remove this item from cart?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Remove",
              style: "destructive",
              onPress: () => removeFromCart(dishId)
            }
          ]
        );
      }
    }
  };

  const placeOrder = () => {
    if (cart.length === 0) {
      Alert.alert("Giỏ hàng trống", "Vui lòng thêm món ăn vào giỏ hàng trước.");
      return;
    }

    if (!user) {
      Alert.alert(
        "Vui lòng đăng nhập",
        "Bạn cần đăng nhập để đặt hàng.",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Đăng nhập",
            onPress: () => router.push('/auth/login')
          }
        ]
      );
      return;
    }

    // Check if user has any valid reservations
    if (reservations.length === 0) {
      Alert.alert(
        "Chưa có đặt bàn",
        "Bạn cần đặt bàn trước khi đặt món. Bạn có muốn đặt bàn ngay không?",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Đặt bàn",
            onPress: () => router.push('/(tabs)/dining')
          }
        ]
      );
      return;
    }

    // If no reservation selected, show modal
    if (!selectedReservation) {
      setShowReservationModal(true);
      return;
    }

    // Navigate to order confirmation with reservation info
    console.log(`📦 Placing order for user: ${user.email}, reservation: ${selectedReservation.reservationId}`);
    router.push({
      pathname: "/order-confirmation",
      params: { reservationId: selectedReservation.reservationId }
    } as any);
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleBrowseMenu = () => {
    router.push("/(tabs)/screen/menu" as Href);
  };

  return (
    <SafeAreaView className="cart flex-1 bg-[#F8F8F8]">
      {/* Header */}
      <View className="cart__header px-4 py-4 bg-white shadow-sm">
        <View className="cart__header-content flex-row items-center justify-between">
          <TouchableOpacity
            className="cart__btn-back"
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#000000" />
          </TouchableOpacity>

          <View className="flex-1 mx-4">
            <Text className="text-center text-lg font-bold text-[#000000]">
              Giỏ hàng
            </Text>
            {user && (
              <Text className="text-center text-xs text-gray-500 mt-1">
                {user.fullName || user.email}
              </Text>
            )}
          </View>

          <View className="w-6" />
        </View>
      </View>

      {/* Search Bar */}
      <View className="cart__search mx-4 mt-4 mb-3 bg-white rounded-xl px-4 py-3 flex-row items-center shadow-sm">
        <Ionicons name="search" size={20} color="#666666" />
        <TextInput
          className="cart__search-input flex-1 ml-3 text-sm text-[#000000]"
          placeholder="Search Dishes"
          placeholderTextColor="#666666"
          editable={false}
        />
      </View>

      {/* Selected Reservation */}
      {selectedReservation && cart.length > 0 && (
        <View className="mx-4 mb-3 bg-orange-50 border border-orange-200 rounded-xl p-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-bold text-gray-800">Bàn đã chọn</Text>
            <TouchableOpacity onPress={() => setShowReservationModal(true)}>
              <Text className="text-sm font-semibold text-orange-600">Đổi bàn</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="restaurant" size={16} color="#f97316" />
            <Text className="ml-2 text-sm text-gray-700">
              {selectedReservation.tableCode} • {new Date(selectedReservation.reservationDate).toLocaleDateString('vi-VN')} • {selectedReservation.timeSlotLabel}
            </Text>
          </View>
        </View>
      )}

      {cart.length === 0 ? (
        <View className="cart__empty flex-1 justify-center items-center px-4">
          <Ionicons name="cart-outline" size={80} color="#E5E5E5" />
          <Text className="cart__empty-title text-xl font-semibold text-[#666666] mt-4 mb-2">Your cart is empty</Text>
          <Text className="cart__empty-subtitle text-[#666666] text-center mb-6 text-sm">Add some delicious items to get started</Text>
          <TouchableOpacity
            className="cart__btn-browse bg-[#D97639] px-6 py-3 rounded-lg active:bg-[#C86830]"
            onPress={handleBrowseMenu}
            activeOpacity={0.9}
          >
            <Text className="cart__btn-browse-text text-white font-semibold">Browse Menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Menu Preview - 2 Items */}
          <View className="cart__preview px-4 mb-3">
            <View className="cart__preview-grid flex-row justify-between">
              {cart.slice(0, 2).map((item) => (
                <View key={item.dishId} className="cart__preview-card w-[48%] bg-white rounded-xl overflow-hidden shadow-sm">
                  <DishImage
                    imageUrl={item.imageUrl}
                    style={{ width: '100%', aspectRatio: 1, resizeMode: 'cover' }}
                    defaultImage={require('../../assets/images/test.png')}
                  />
                  <View className="cart__preview-info p-3">
                    <Text className="cart__preview-name text-sm font-medium text-[#000000] mb-1" numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View className="cart__preview-counter flex-row items-center justify-between bg-[#D97639] rounded-lg py-1.5 px-2">
                      <TouchableOpacity
                        className="cart__btn-decrement w-6 h-6 items-center justify-center active:scale-95"
                        onPress={() => decrementQuantity(item.dishId)}
                        activeOpacity={0.8}
                      >
                        <Text className="text-white text-base font-bold">-</Text>
                      </TouchableOpacity>

                      <Text className="cart__preview-quantity text-white font-semibold text-sm">
                        {item.quantity}
                      </Text>

                      <TouchableOpacity
                        className="cart__btn-increment w-6 h-6 items-center justify-center active:scale-95"
                        onPress={() => incrementQuantity(item.dishId)}
                        activeOpacity={0.8}
                      >
                        <Text className="text-white text-base font-bold">+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Order Summary Sheet */}
          <View className="cart__summary flex-1 bg-white rounded-t-3xl shadow-lg">
            {/* Summary Header */}
            <View className="cart__summary-header px-4 py-4 border-b border-[#E5E5E5]">
              <Text className="cart__summary-title text-lg font-bold text-[#000000] mb-3">Order Summary</Text>

              {/* Table Header Row */}
              <View className="cart__table-header flex-row py-2 border-b border-[#E5E5E5]">
                <Text className="cart__header-col text-[#666666] text-xs font-semibold w-10">No.</Text>
                <Text className="cart__header-col text-[#666666] text-xs font-semibold flex-1">Dishes</Text>
                <Text className="cart__header-col text-[#666666] text-xs font-semibold w-24 text-center">Count</Text>
                <Text className="cart__header-col text-[#666666] text-xs font-semibold w-16 text-right">Price</Text>
              </View>
            </View>

            {/* Items List */}
            <ScrollView className="cart__items-list px-4 py-2">
              {cart.map((item, index) => (
                <View key={item.dishId} className="cart__item flex-row items-center py-3 border-b border-[#F8F8F8]">
                  <Text className="cart__item-number text-[#666666] text-sm w-10">{index + 1}</Text>

                  <View className="cart__item-info flex-1 flex-row items-center">
                    <DishImage
                      imageUrl={item.imageUrl}
                      style={{ width: 62, height: 62, borderRadius: 8, marginRight: 8, resizeMode: 'cover' }}
                      defaultImage={require('../../assets/images/test.png')}
                    />
                    <Text className="cart__item-name text-[#000000] text-sm font-medium flex-1" numberOfLines={2}>
                      {item.name}
                    </Text>
                  </View>

                  <View className="cart__item-counter flex-row items-center w-24 justify-center">
                    <TouchableOpacity
                      className="cart__btn-decrement bg-[#D97639] rounded-full items-center justify-center active:scale-95"
                      style={{ width: 28, height: 28 }}
                      onPress={() => decrementQuantity(item.dishId)}
                      activeOpacity={0.8}
                    >
                      <Text className="text-white text-sm font-bold">-</Text>
                    </TouchableOpacity>

                    <Text className="cart__item-count text-[#000000] font-semibold text-sm mx-2">
                      {item.quantity}
                    </Text>

                    <TouchableOpacity
                      className="cart__btn-increment bg-[#D97639] rounded-full items-center justify-center active:scale-95"
                      style={{ width: 28, height: 28 }}
                      onPress={() => incrementQuantity(item.dishId)}
                      activeOpacity={0.8}
                    >
                      <Text className="text-white text-sm font-bold">+</Text>
                    </TouchableOpacity>
                  </View>

                  <Text className="cart__item-price text-[#000000] text-sm font-semibold w-16 text-right">
                    {formatPrice(item.price * item.quantity)}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* Footer */}
            <View className="cart__footer px-4 py-4 border-t border-[#E5E5E5]">
              <View className="cart__total-row flex-row items-center justify-between mb-4">
                <Text className="cart__total-label text-lg font-bold text-[#000000]">Total</Text>
                <Text className="cart__total-amount text-xl font-bold text-[#D97639]">
                  {formatPrice(getTotalAmount())}
                </Text>
              </View>

              <TouchableOpacity
                className="cart__btn-confirm bg-[#D97639] rounded-xl py-4 items-center active:bg-[#C86830]"
                onPress={placeOrder}
                activeOpacity={0.9}
              >
                <Text className="cart__btn-confirm-text text-white font-bold text-base">Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* Reservation Selection Modal */}
      <Modal
        visible={showReservationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReservationModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '70%' }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">Chọn bàn đã đặt</Text>
              <TouchableOpacity onPress={() => setShowReservationModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {loadingReservations ? (
              <View className="py-12 items-center">
                <Text className="text-gray-500">Đang tải...</Text>
              </View>
            ) : reservations.length === 0 ? (
              <View className="py-12 items-center">
                <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
                <Text className="text-gray-500 mt-4 text-center">
                  Bạn chưa có đặt bàn nào
                </Text>
                <TouchableOpacity
                  className="mt-4 bg-orange-600 px-6 py-3 rounded-lg"
                  onPress={() => {
                    setShowReservationModal(false);
                    router.push('/(tabs)/dining');
                  }}
                >
                  <Text className="text-white font-semibold">Đặt bàn ngay</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView>
                {reservations.map((res) => (
                  <TouchableOpacity
                    key={res.reservationId}
                    className={`mb-3 p-4 rounded-xl border-2 ${
                      selectedReservation?.reservationId === res.reservationId
                        ? 'border-orange-600 bg-orange-50'
                        : 'border-gray-200 bg-white'
                    }`}
                    onPress={() => {
                      setSelectedReservation(res);
                      setShowReservationModal(false);
                    }}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-bold text-gray-900 mb-1">
                          {res.tableCode}
                        </Text>
                        <View className="flex-row items-center mb-1">
                          <Ionicons name="calendar" size={14} color="#666" />
                          <Text className="ml-2 text-sm text-gray-600">
                            {new Date(res.reservationDate).toLocaleDateString('vi-VN')}
                          </Text>
                        </View>
                        <View className="flex-row items-center mb-1">
                          <Ionicons name="time" size={14} color="#666" />
                          <Text className="ml-2 text-sm text-gray-600">
                            {res.timeSlotLabel}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Ionicons name="people" size={14} color="#666" />
                          <Text className="ml-2 text-sm text-gray-600">
                            {res.numberOfGuests} khách
                          </Text>
                        </View>
                      </View>
                      {selectedReservation?.reservationId === res.reservationId && (
                        <Ionicons name="checkmark-circle" size={24} color="#f97316" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
