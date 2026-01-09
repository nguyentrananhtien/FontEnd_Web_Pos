import { useAuth } from '@/providers/auth-provider';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Modal,
  Alert,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { UserHeader } from '@/components/home/UserHeader';
import { QuickActionButton } from '@/components/home/QuickActionButton';
import { FeaturedDishCard } from '@/components/home/FeaturedDishCard';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [menuVisible, setMenuVisible] = useState(false);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const featuredDishes = [
    {
      id: '1',
      name: 'Phở Bò Đặc Biệt',
      price: 65000,
      image: 'https://via.placeholder.com/200x120/F08B3C/FFFFFF?text=Pho+Bo',
      description: 'Phở bò truyền thống với nước dùng đậm đà',
    },
    {
      id: '2',
      name: 'Bún Chả Hà Nội',
      price: 55000,
      image: 'https://via.placeholder.com/200x120/F08B3C/FFFFFF?text=Bun+Cha',
      description: 'Bún chả thơm ngon với thịt nướng than hoa',
    },
    {
      id: '3',
      name: 'Cơm Tấm Sườn',
      price: 50000,
      image: 'https://via.placeholder.com/200x120/F08B3C/FFFFFF?text=Com+Tam',
      description: 'Cơm tấm sườn nướng đặc biệt',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
              <UserHeader
                userName={user?.name || user?.email}
                userAvatar={user?.avatar}
                onProfilePress={() => router.push('/profile')}
                onMenuPress={() => setMenuVisible(true)}
              />

              <View className="px-6 py-4 bg-white">
                <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                  <MaterialIcons name="search" size={20} color="#9CA3AF" />
                  <TextInput
                    placeholder="Search..."
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 ml-2 text-gray-800"
                  />
                </View>
              </View>

              <View className="px-6 py-6 bg-white">
                <Text className="text-gray-800 font-bold text-lg mb-4">Quick Actions</Text>
                <View className="flex-row flex-wrap gap-3">
                  <View className="w-[30%]">
                    <QuickActionButton
                      icon="qr-code-scanner"
                      label="QR Scanner"
                      onPress={() => Alert.alert('QR Scanner', 'Coming soon')}
                    />
                  </View>
                  <View className="w-[30%]">
                    <QuickActionButton
                      icon="restaurant-menu"
                      label="Food Menu"
                      onPress={() => router.push('/(tabs)/screen/menu')}
                    />
                  </View>
                  <View className="w-[30%]">
                    <QuickActionButton
                      icon="event-seat"
                      label="Table Reservation"
                      onPress={() => router.push('/(tabs)')}
                    />
                  </View>
                  <View className="w-[30%]">
                    <QuickActionButton
                      icon="receipt-long"
                      label="Order History"
                      onPress={() => router.push('/order-list')}
                    />
                  </View>
                  <View className="w-[30%]">
                    <QuickActionButton
                      icon="payment"
                      label="Payment Cards"
                      onPress={() => Alert.alert('Payment Cards', 'Coming soon')}
                    />
                  </View>
                  <View className="w-[30%]">
                    <QuickActionButton
                      icon="notifications"
                      iconLibrary="Ionicons"
                      label="Notifications"
                      onPress={() => Alert.alert('Notifications', 'Coming soon')}
                    />
                  </View>
                </View>
              </View>

              <View className="py-6 bg-gray-50">
                <Text className="text-gray-800 font-bold text-lg mb-4 px-6">
                  Featured Dishes
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="px-6"
                >
                  {featuredDishes.map((dish) => (
                    <FeaturedDishCard
                      key={dish.id}
                      name={dish.name}
                      price={dish.price}
                      image={dish.image}
                      description={dish.description}
                      onPress={() => router.push('/(tabs)/screen/menu')}
                    />
                  ))}
                </ScrollView>
              </View>

              <View className="px-6 py-6 bg-gray-50">
                <TouchableOpacity
                  className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl overflow-hidden active:opacity-90"
                  activeOpacity={0.7}
                  onPress={() => Alert.alert('About Us', 'Coming soon')}
                >
                  <View className="bg-orange-500 p-6">
                    <Text className="text-white font-bold text-2xl mb-2">About Us</Text>
                    <Text className="text-white/90 text-sm">
                      Discover our story, location, and what makes us special
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
        );
      case 'order':
        return (
          <View className="flex-1 items-center justify-center bg-gray-50">
            <MaterialIcons name="receipt-long" size={80} color="#F08B3C" />
            <Text className="text-gray-800 font-bold text-xl mt-4">Order History</Text>
            <TouchableOpacity
              className="mt-4 bg-orange-500 px-6 py-3 rounded-xl"
              onPress={() => router.push('/order-list')}
            >
              <Text className="text-white font-semibold">View Orders</Text>
            </TouchableOpacity>
          </View>
        );
      case 'dish':
        return (
          <View className="flex-1 items-center justify-center bg-gray-50">
            <MaterialIcons name="restaurant-menu" size={80} color="#F08B3C" />
            <Text className="text-gray-800 font-bold text-xl mt-4">Food Menu</Text>
            <TouchableOpacity
              className="mt-4 bg-orange-500 px-6 py-3 rounded-xl"
              onPress={() => router.push('/(tabs)/screen/menu')}
            >
              <Text className="text-white font-semibold">Browse Menu</Text>
            </TouchableOpacity>
          </View>
        );
      case 'dining':
        return (
          <View className="flex-1 items-center justify-center bg-gray-50">
            <MaterialIcons name="event-seat" size={80} color="#F08B3C" />
            <Text className="text-gray-800 font-bold text-xl mt-4">Table Management</Text>
            <TouchableOpacity
              className="mt-4 bg-orange-500 px-6 py-3 rounded-xl"
              onPress={() => router.push('/(tabs)')}
            >
              <Text className="text-white font-semibold">View Tables</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-white">
      {renderContent()}

      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-2">
        <View className="flex-row justify-around items-center pt-2">
          <TouchableOpacity
            className="items-center py-2 px-4 active:opacity-70"
            onPress={() => setActiveTab('home')}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="home"
              size={26}
              color={activeTab === 'home' ? '#F08B3C' : '#9CA3AF'}
            />
            <Text
              className={`text-xs mt-1 ${
                activeTab === 'home' ? 'text-orange-500 font-semibold' : 'text-gray-400'
              }`}
            >
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center py-2 px-4 active:opacity-70"
            onPress={() => setActiveTab('order')}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="receipt-long"
              size={26}
              color={activeTab === 'order' ? '#F08B3C' : '#9CA3AF'}
            />
            <Text
              className={`text-xs mt-1 ${
                activeTab === 'order' ? 'text-orange-500 font-semibold' : 'text-gray-400'
              }`}
            >
              Order
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center py-2 px-4 active:opacity-70"
            onPress={() => setActiveTab('dish')}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="restaurant-menu"
              size={26}
              color={activeTab === 'dish' ? '#F08B3C' : '#9CA3AF'}
            />
            <Text
              className={`text-xs mt-1 ${
                activeTab === 'dish' ? 'text-orange-500 font-semibold' : 'text-gray-400'
              }`}
            >
              Dish
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center py-2 px-4 active:opacity-70"
            onPress={() => setActiveTab('dining')}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="event-seat"
              size={26}
              color={activeTab === 'dining' ? '#F08B3C' : '#9CA3AF'}
            />
            <Text
              className={`text-xs mt-1 ${
                activeTab === 'dining' ? 'text-orange-500 font-semibold' : 'text-gray-400'
              }`}
            >
              Dining
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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
          <View
            className="absolute top-16 right-6 bg-white rounded-2xl overflow-hidden"
            style={{
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
              elevation: 8
            }}
          >
            <TouchableOpacity
              className="flex-row items-center px-6 py-4 border-b border-gray-100 active:bg-gray-50"
              onPress={() => {
                setMenuVisible(false);
                router.push('/profile');
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="person" size={20} color="#F08B3C" />
              <Text className="ml-3 text-gray-800 font-medium">Profile</Text>
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
              <Text className="ml-3 text-red-500 font-medium">Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
