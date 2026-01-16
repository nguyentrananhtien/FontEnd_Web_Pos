import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, Href, useLocalSearchParams } from 'expo-router';
import { DishDTO, CategoryDTO } from '@/services/types';
import { dishApi, categoryApi } from '@/services/api';
import { useCart } from '@/providers/cart-provider';
import { formatPrice } from '@/services/utils';
import DishImage from '@/components/DishImage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MenuScreen() {
  const params = useLocalSearchParams();
  const tableCode = params.tableCode as string | undefined;
  const reservationId = params.reservationId as string | undefined;

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dishes, setDishes] = useState<DishDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<DishDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'price' | 'name' | null>(null);
  const [showCartPopup, setShowCartPopup] = useState(false);

  const { cart, addToCart, removeFromCart, updateQuantity, getQuantityInCart, getTotalItems, getTotalAmount } = useCart();

  useEffect(() => {
    fetchDishesAndCategories();
  }, []);

  useEffect(() => {
    filterAndSortDishes();
  }, [dishes, selectedCategory, searchQuery, sortBy]);

  const fetchDishesAndCategories = async () => {
    try {
      setLoading(true);

      const [dishesData, categoriesData] = await Promise.all([
        dishApi.getActive(),
        categoryApi.getActive()
      ]);

      setDishes(dishesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert(
        "API Connection Error",
        "Failed to load menu data. Please check your connection and try again.",
        [
          { text: "Retry", onPress: fetchDishesAndCategories },
          { text: "OK" }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortDishes = () => {
    let filtered = dishes;

    if (selectedCategory !== null) {
      filtered = filtered.filter(dish => dish.categoryId === selectedCategory);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(dish =>
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    if (sortBy === 'price') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'name') {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredDishes(filtered);
  };

  const handleAddToCart = (dish: DishDTO) => {
    addToCart(dish);
    Alert.alert("Added to Cart", `${dish.name} has been added to your cart`, [
      { text: "OK", style: "default" }
    ]);
  };

  const handleGoToCart = () => {
    router.push("/(tabs)/screen/cart" as Href);
  };

  const incrementQuantity = (dishId: number) => {
    const currentQuantity = getQuantityInCart(dishId);
    updateQuantity(dishId, currentQuantity + 1);
  };

  const decrementQuantity = (dishId: number) => {
    const currentQuantity = getQuantityInCart(dishId);
    if (currentQuantity > 1) {
      updateQuantity(dishId, currentQuantity - 1);
    } else {
      removeFromCart(dishId);
    }
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      Alert.alert("Empty Cart", "Please add items to your cart before placing an order.");
      return;
    }
    setShowCartPopup(false);
    router.push("/order-confirmation" as Href);
  };

  if (loading) {
    return (
      <SafeAreaView className="menu-loading flex-1 bg-gray-100 justify-center items-center">
        <Ionicons name="restaurant" size={50} color="#f97316" />
        <Text className="menu-loading__text text-lg text-gray-600 mt-4">Loading menu...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="menu flex-1 bg-[#F8F8F8]">
      {/* Header - Show table info if came from table */}
      <View className="menu__header px-4 py-4 bg-white shadow-sm">
        <View className="menu__header-content flex-row items-center">
          {tableCode ? (
            <>
              <TouchableOpacity
                className="menu__btn-back"
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={24} color="#000000" />
              </TouchableOpacity>
              <View className="flex-1 mx-4">
                <Text className="text-center text-lg font-bold text-[#000000]">
                  Đặt món - {tableCode}
                </Text>
                {reservationId && (
                  <Text className="text-center text-xs text-gray-500 mt-1">
                    Mã đặt bàn: #{reservationId}
                  </Text>
                )}
              </View>
              <View className="w-6" />
            </>
          ) : (
            <Text className="flex-1 text-center text-lg font-bold text-[#000000]">
              Menu
            </Text>
          )}
        </View>
      </View>

      {/* Search Bar */}
      <View className="menu__search mx-4 mt-4 mb-3 bg-white rounded-xl px-4 py-3 flex-row items-center shadow-sm">
        <Ionicons name="search" size={20} color="#666666" />
        <TextInput
          className="menu__search-input flex-1 ml-3 text-sm text-[#000000]"
          placeholder="Search Dishes"
          placeholderTextColor="#666666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#666666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Tabs - Fixed Section */}
      <View className="menu__categories-container bg-white pb-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="menu__categories"
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        >
          <TouchableOpacity
            className={`menu__category-tab mr-2 px-4 py-2 rounded-full ${
              selectedCategory === null 
                ? 'bg-[#D97639]' 
                : 'bg-transparent border border-[#D97639]'
            }`}
            onPress={() => setSelectedCategory(null)}
            activeOpacity={0.8}
          >
            <Text
              className={`menu__category-text text-sm font-normal ${
                selectedCategory === null 
                  ? 'text-white' 
                  : 'text-[#D97639]'
              }`}
            >
              Tất cả
            </Text>
          </TouchableOpacity>

          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              className={`menu__category-tab mr-2 px-4 py-2 rounded-full ${
                selectedCategory === category.id 
                  ? 'bg-[#D97639]' 
                  : 'bg-transparent border border-[#D97639]'
              }`}
              onPress={() => setSelectedCategory(category.id)}
              activeOpacity={0.8}
            >
              <Text
                className={`menu__category-text text-sm font-normal ${
                  selectedCategory === category.id 
                    ? 'text-white' 
                    : 'text-[#D97639]'
                }`}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filter Bar */}
      <View className="menu__filter-bar flex-row px-4 mb-3 space-x-2 bg-[#F8F8F8]">
        <TouchableOpacity
          className={`menu__filter-btn flex-row items-center px-4 py-2 rounded-lg bg-white border ${
            sortBy === 'price' ? 'border-[#D97639]' : 'border-[#E5E5E5]'
          }`}
          onPress={() => setSortBy(sortBy === 'price' ? null : 'price')}
          activeOpacity={0.7}
        >
          <Text className={`menu__filter-text text-sm ${sortBy === 'price' ? 'text-[#D97639] font-semibold' : 'text-[#666666]'}`}>
            Price
          </Text>
          <Ionicons
            name={sortBy === 'price' ? 'arrow-up' : 'arrow-down'}
            size={16}
            color={sortBy === 'price' ? '#D97639' : '#666666'}
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          className={`menu__filter-btn flex-row items-center px-4 py-2 rounded-lg bg-white border ${
            sortBy === 'name' ? 'border-[#D97639]' : 'border-[#E5E5E5]'
          }`}
          onPress={() => setSortBy(sortBy === 'name' ? null : 'name')}
          activeOpacity={0.7}
        >
          <Text className={`menu__filter-text text-sm ${sortBy === 'name' ? 'text-[#D97639] font-semibold' : 'text-[#666666]'}`}>
            A-Z
          </Text>
          <Ionicons
            name={sortBy === 'name' ? 'arrow-up' : 'arrow-down'}
            size={16}
            color={sortBy === 'name' ? '#D97639' : '#666666'}
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
      </View>

      {/* Dishes Grid - 2 Columns */}
      <ScrollView className="menu__dishes-list px-4 pb-32">
        {filteredDishes.length === 0 ? (
          <View className="menu__empty flex-1 items-center justify-center py-12">
            <Ionicons name="restaurant-outline" size={64} color="#E5E5E5" />
            <Text className="menu__empty-text text-[#666666] mt-4 text-base">No dishes found</Text>
          </View>
        ) : (
          <View className="menu__dishes-grid flex-row flex-wrap justify-between">
            {filteredDishes.map((dish) => {
              const quantityInCart = getQuantityInCart(dish.id);
              return (
                <View key={dish.id} className="menu__dish-card w-[48%] bg-white rounded-xl mb-4 overflow-hidden shadow-sm">
                  {/* Dish Image - Now supports base64 */}
                  <DishImage
                    imageUrl={dish.imageUrl}
                    style={{ width: '100%', aspectRatio: 1, resizeMode: 'cover' }}
                    defaultImage={require('../../assets/images/test.png')}
                  />

                  {/* Dish Info */}
                  <View className="menu__dish-info p-3">
                    <Text className="menu__dish-name text-base font-medium text-[#000000] mb-1" numberOfLines={1}>
                      {dish.name}
                    </Text>
                    <Text className="menu__dish-price text-base font-semibold text-[#D97639] mb-2">
                      {formatPrice(dish.price)}
                    </Text>

                    {/* Counter or Add Button */}
                    {quantityInCart > 0 ? (
                      <View className="menu__dish-counter flex-row items-center justify-between bg-[#D97639] rounded-lg py-1.5 px-2">
                        <TouchableOpacity
                          className="menu__btn-decrement w-7 h-7 items-center justify-center active:scale-95"
                          onPress={() => decrementQuantity(dish.id)}
                          activeOpacity={0.8}
                        >
                          <Text className="text-white text-lg font-bold">-</Text>
                        </TouchableOpacity>

                        <Text className="menu__dish-quantity text-white font-semibold text-base">
                          {quantityInCart}
                        </Text>

                        <TouchableOpacity
                          className="menu__btn-increment w-7 h-7 items-center justify-center active:scale-95"
                          onPress={() => incrementQuantity(dish.id)}
                          activeOpacity={0.8}
                        >
                          <Text className="text-white text-lg font-bold">+</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        className="menu__btn-add border-2 border-[#D97639] bg-transparent rounded-lg py-1.5 items-center active:bg-[#D97639]/10"
                        onPress={() => handleAddToCart(dish)}
                        activeOpacity={0.7}
                      >
                        <Text className="menu__btn-add-text text-[#D97639] font-semibold text-sm">+ Add</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Bottom Bar */}
      {cart.length > 0 && (
        <View className="menu__bottom-bar absolute bottom-0 left-0 right-0 px-4 py-3 bg-white border-t border-[#E5E5E5] flex-row items-center space-x-3">
          <TouchableOpacity
            className="menu__cart-summary flex-1 flex-row items-center justify-between"
            onPress={() => setShowCartPopup(true)}
            activeOpacity={0.7}
          >
            <Text className="menu__cart-info text-sm text-[#000000]">
              You have added <Text className="font-semibold">{getTotalItems()} Items</Text>
            </Text>
            <Ionicons name="chevron-down" size={20} color="#000000" />
          </TouchableOpacity>

          <TouchableOpacity
            className="menu__btn-order bg-[#D97639] rounded-lg px-6 py-3 active:bg-[#C86830]"
            onPress={handlePlaceOrder}
            activeOpacity={0.9}
          >
            <Text className="menu__btn-order-text text-white font-bold text-base">Order</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Cart Popup Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCartPopup}
        onRequestClose={() => setShowCartPopup(false)}
      >
        <TouchableOpacity
          className="cart-modal flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setShowCartPopup(false)}
        >
          <TouchableOpacity
            className="cart-modal__container absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[70%]"
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View className="cart-modal__header px-4 py-4 border-b border-[#E5E5E5]">
              <View className="cart-modal__header-content flex-row items-center justify-between mb-2">
                <Text className="cart-modal__title text-lg font-bold text-[#000000]">Order Summary</Text>
                <TouchableOpacity
                  className="cart-modal__btn-close w-8 h-8 bg-[#F8F8F8] rounded-full items-center justify-center"
                  onPress={() => setShowCartPopup(false)}
                >
                  <Ionicons name="close" size={20} color="#666666" />
                </TouchableOpacity>
              </View>

              {/* Table Header Row */}
              <View className="cart-modal__table-header flex-row py-2 border-b border-[#E5E5E5]">
                <Text className="cart-modal__header-col text-[#666666] text-xs font-semibold w-10">No.</Text>
                <Text className="cart-modal__header-col text-[#666666] text-xs font-semibold flex-1">Dishes</Text>
                <Text className="cart-modal__header-col text-[#666666] text-xs font-semibold w-24 text-center">Count</Text>
                <Text className="cart-modal__header-col text-[#666666] text-xs font-semibold w-16 text-right">Price</Text>
              </View>
            </View>

            {/* Cart Items List */}
            <ScrollView className="cart-modal__list px-4 py-2">
              {cart.map((item, index) => (
                <View key={item.dishId} className="cart-modal__item flex-row items-center py-3 border-b border-[#F8F8F8]">
                  <Text className="cart-modal__item-number text-[#666666] text-sm w-10">{index + 1}</Text>

                  <View className="cart-modal__item-info flex-1 flex-row items-center">
                    <DishImage
                      imageUrl={item.imageUrl}
                      style={{ width: 62, height: 62, borderRadius: 8, marginRight: 8, resizeMode: 'cover' }}
                      defaultImage={require('../../assets/images/test.png')}
                    />
                    <Text className="cart-modal__item-name text-[#000000] text-sm font-medium flex-1" numberOfLines={2}>
                      {item.name}
                    </Text>
                  </View>

                  <View className="cart-modal__item-counter flex-row items-center w-24 justify-center">
                    <TouchableOpacity
                      className="cart-modal__btn-decrement bg-[#D97639] rounded-full items-center justify-center active:scale-95"
                      style={{ width: 24, height: 24 }}
                      onPress={() => decrementQuantity(item.dishId)}
                      activeOpacity={0.8}
                    >
                      <Text className="text-white text-xs font-bold">-</Text>
                    </TouchableOpacity>

                    <Text className="cart-modal__item-count text-[#000000] font-semibold text-sm mx-2">
                      {item.quantity}
                    </Text>

                    <TouchableOpacity
                      className="cart-modal__btn-increment bg-[#D97639] rounded-full items-center justify-center active:scale-95"
                      style={{ width: 24, height: 24 }}
                      onPress={() => incrementQuantity(item.dishId)}
                      activeOpacity={0.8}
                    >
                      <Text className="text-white text-xs font-bold">+</Text>
                    </TouchableOpacity>
                  </View>

                  <Text className="cart-modal__item-price text-[#000000] text-sm font-semibold w-16 text-right">
                    {formatPrice(item.price * item.quantity)}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* Footer */}
            <View className="cart-modal__footer px-4 py-4 border-t border-[#E5E5E5]">
              <View className="cart-modal__total-row flex-row items-center justify-between mb-4">
                <Text className="cart-modal__total-label text-lg font-bold text-[#000000]">Total</Text>
                <Text className="cart-modal__total-amount text-xl font-bold text-[#D97639]">
                  {formatPrice(getTotalAmount())}
                </Text>
              </View>

              <TouchableOpacity
                className="cart-modal__btn-confirm bg-[#D97639] rounded-xl py-4 items-center active:bg-[#C86830]"
                onPress={handlePlaceOrder}
                activeOpacity={0.9}
              >
                <Text className="cart-modal__btn-confirm-text text-white font-bold text-base">Confirm</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
