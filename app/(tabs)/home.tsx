import { useAuth } from '@/providers/auth-provider';
import { router } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { UserHeader } from '@/components/home/UserHeader';
import { QuickActionButton } from '@/components/home/QuickActionButton';
import { dishApi } from '@/services/api';
import { DishDTO } from '@/services/types';
import DishImage from '@/components/DishImage';

export default function HomeScreen() {
  const { user, logout, refreshUserData, isLoading: authLoading } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredDishes, setFeaturedDishes] = useState<DishDTO[]>([]);
  const [dishesLoading, setDishesLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Load user data and featured dishes
    refreshUserData();
    loadFeaturedDishes();
  }, []);

  const loadFeaturedDishes = async () => {
    try {
      setDishesLoading(true);
      console.log('🍽️ Loading featured dishes...');
      const dishes = await dishApi.getActive();
      console.log('✅ Loaded dishes:', dishes.length);

      // Randomly select 5 dishes for "Món hôm nay"
      const shuffled = [...dishes].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 5);

      console.log('✅ Selected featured dishes:', selected.length);
      setFeaturedDishes(selected);
    } catch (error) {
      console.error('❌ Failed to load featured dishes:', error);
      // Don't show alert, just log the error
    } finally {
      setDishesLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search-results?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('auth/login');
            } catch (error) {
              Alert.alert('Lỗi', 'Đăng xuất thất bại. Vui lòng thử lại.');
            }
          }
        }
      ]
    );
  };

  if (authLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#F08B3C" />
        <Text className="text-gray-400 mt-3">Đang tải...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
          <UserHeader
            userName={user?.fullName || user?.name || user?.email || 'Khách'}
            userAvatar={user?.avatar}
            onProfilePress={() => router.push('/profile')}
            onMenuPress={() => setMenuVisible(true)}
          />

              <View className="px-6 py-4 bg-white">
                <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                  <MaterialIcons name="search" size={20} color="#9CA3AF" />
                  <TextInput
                    placeholder="Search for dishes or tables..."
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 ml-2 text-gray-800"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchQuery('')}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="clear" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View className="px-6 py-6 bg-white">
                <Text className="text-gray-800 font-bold text-lg mb-4">Quick Actions</Text>
                <View className="flex-row flex-wrap gap-3">
                  <View className="w-[30%]">
                    <QuickActionButton
                      icon="qr-code-scanner"
                      label="QR Scanner"
                      onPress={() => router.push('/screen/CheckIn')}
                    />
                  </View>
                  <View className="w-[30%]">
                    <QuickActionButton
                      icon="restaurant-menu"
                      label="Food Menu"
                      onPress={() => router.push('/(tabs)/menu')}
                    />
                  </View>
                  <View className="w-[30%]">
                    <QuickActionButton
                      icon="event-seat"
                      label="Table Reservation"
                      onPress={() => router.push('/(tabs)/dining')}
                    />
                  </View>
                  <View className="w-[30%]">
                    <QuickActionButton
                      icon="receipt-long"
                      label="Order History"
                      onPress={() => router.push('/(tabs)/orders')}
                    />
                  </View>
                  <View className="w-[30%]">
                    <QuickActionButton
                      icon="notifications"
                      iconLibrary="Ionicons"
                      label="Notifications"
                      onPress={() => router.push('/notifications')}
                    />
                  </View>
                  <View className="w-[30%]">
                    <QuickActionButton
                      icon="receipt"
                      iconLibrary="Ionicons"
                      label="Invoices"
                      onPress={() => router.push('/invoices')}
                    />
                  </View>
                </View>
              </View>

              <View className="py-6 bg-gray-50">
                <View className="flex-row items-center justify-between px-6 mb-4">
                  <Text className="text-gray-800 font-bold text-lg">
                    Món hôm nay
                  </Text>
                  <TouchableOpacity
                    onPress={loadFeaturedDishes}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="refresh" size={24} color="#F08B3C" />
                  </TouchableOpacity>
                </View>

                {dishesLoading ? (
                  <View className="py-12 items-center">
                    <ActivityIndicator size="large" color="#F08B3C" />
                    <Text className="text-gray-400 text-sm mt-3">Đang tải món ăn...</Text>
                  </View>
                ) : featuredDishes.length > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="px-6"
                  >
                    {featuredDishes.map((dish) => (
                      <TouchableOpacity
                        key={dish.id}
                        className="mr-4 bg-white rounded-2xl overflow-hidden shadow-sm w-56 active:opacity-80"
                        onPress={() => router.push('/(tabs)/menu')}
                        activeOpacity={0.7}
                      >
                        <DishImage
                          imageUrl={dish.imageUrl}
                          style={{ width: '100%', height: 160, resizeMode: 'cover' }}
                        />
                        <View className="p-4">
                          <Text className="text-gray-800 font-bold text-base mb-1" numberOfLines={1}>
                            {dish.name}
                          </Text>
                          <Text className="text-gray-500 text-xs mb-3" numberOfLines={2}>
                            {dish.description}
                          </Text>
                          <View className="flex-row items-center justify-between">
                            <Text className="text-orange-600 font-bold text-lg">
                              {dish.price.toLocaleString('vi-VN')} ₫
                            </Text>
                            <View className="flex-row items-center gap-1">
                              {dish.isVegetarian && (
                                <View className="bg-green-100 px-2 py-1 rounded">
                                  <Text className="text-green-700 text-xs font-semibold">Chay</Text>
                                </View>
                              )}
                              {dish.isSpicy && (
                                <Text className="text-lg">🌶️</Text>
                              )}
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  <View className="px-6">
                    <TouchableOpacity
                      className="bg-orange-50 border border-orange-200 rounded-2xl p-6 items-center active:opacity-80"
                      onPress={() => router.push('/(tabs)/menu')}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="restaurant-menu" size={48} color="#F08B3C" />
                      <Text className="text-gray-800 font-bold text-base mt-3 mb-1">
                        Không có món ăn
                      </Text>
                      <Text className="text-gray-500 text-sm text-center">
                        Vui lòng thử lại hoặc xem menu đầy đủ
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View className="px-6 py-6 bg-gray-50">
                <TouchableOpacity
                  className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl overflow-hidden active:opacity-90"
                  activeOpacity={0.7}
                  onPress={() => Alert.alert('Về chúng tôi', 'Chức năng đang phát triển')}
                >
                  <View className="bg-orange-500 p-6">
                    <Text className="text-white font-bold text-2xl mb-2">Về nhà hàng</Text>
                    <Text className="text-white/90 text-sm">
                      Khám phá câu chuyện, địa điểm và những điều đặc biệt của chúng tôi
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View className="px-6 py-6 pb-24 bg-gray-50">
                <Text className="text-gray-800 font-bold text-lg mb-4">
                  Special Offers
                </Text>
                <View className="bg-white rounded-2xl p-4 shadow-sm">
                  <Text className="text-gray-600 text-center">
                    Check back soon for amazing deals!
                  </Text>
                </View>
              </View>
            </ScrollView>
          </Animated.View>

          {/* Menu Modal */}
          <Modal
            visible={menuVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setMenuVisible(false)}
          >
            <TouchableOpacity
              className="flex-1 bg-black/50"
              activeOpacity={1}
              onPress={() => setMenuVisible(false)}
            >
              <View className="absolute top-16 right-6 bg-white rounded-2xl overflow-hidden shadow-lg">
                <TouchableOpacity
                  className="flex-row items-center px-6 py-4 border-b border-gray-100 active:bg-gray-50"
                  onPress={() => {
                    setMenuVisible(false);
                    router.push('/profile');
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="person" size={20} color="#F08B3C" />
                  <Text className="ml-3 text-gray-800 font-medium">Hồ sơ</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center px-6 py-4 border-b border-gray-100 active:bg-gray-50"
                  onPress={() => {
                    setMenuVisible(false);
                    router.push('/notifications');
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="notifications" size={20} color="#F08B3C" />
                  <Text className="ml-3 text-gray-800 font-medium">Thông báo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center px-6 py-4 border-b border-gray-100 active:bg-gray-50"
                  onPress={() => {
                    setMenuVisible(false);
                    router.push('/invoices');
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="receipt-long" size={20} color="#F08B3C" />
                  <Text className="ml-3 text-gray-800 font-medium">Hóa đơn</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center px-6 py-4 active:bg-gray-50"
                  onPress={() => {
                    setMenuVisible(false);
                    handleLogout();
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="logout" size={20} color="#EF4444" />
                  <Text className="ml-3 text-red-500 font-medium">Đăng xuất</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      );
    }
