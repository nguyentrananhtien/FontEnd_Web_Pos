import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { searchApi } from '@/services/api';
import { SearchResultDTO, GlobalSearchResponseDTO } from '@/services/types';
import { useCart } from '@/providers/cart-provider';
import { formatPrice } from '@/services/utils';
import DishImage from '@/components/DishImage';

export default function SearchResultsScreen() {
  const params = useLocalSearchParams<{ query: string }>();
  const [searchResults, setSearchResults] = useState<GlobalSearchResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  // Local search state
  const [localSearchText, setLocalSearchText] = useState(params.query || '');
  const [currentQuery, setCurrentQuery] = useState(params.query || '');

  // Filter states (0 = off, 1 = ascending, 2 = descending)
  const [priceFilter, setPriceFilter] = useState(0);
  const [nameFilter, setNameFilter] = useState(0);

  useEffect(() => {
    if (params.query) {
      setLocalSearchText(params.query);
      setCurrentQuery(params.query);
      performSearch(params.query);
    }
  }, [params.query]);

  const performSearch = async (query: string) => {
    try {
      setLoading(true);
      const results = await searchApi.search(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to perform search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocalSearch = () => {
    if (localSearchText.trim()) {
      setCurrentQuery(localSearchText.trim());
      performSearch(localSearchText.trim());
    }
  };

  // Cycle filter: 0 (off) -> 1 (asc) -> 2 (desc) -> 0
  const cyclePriceFilter = () => {
    setPriceFilter((prev) => (prev + 1) % 3);
    setNameFilter(0); // Reset name filter
  };

  const cycleNameFilter = () => {
    setNameFilter((prev) => (prev + 1) % 3);
    setPriceFilter(0); // Reset price filter
  };

  const getFilteredDishes = () => {
    if (!searchResults?.results) return [];

    // Filter only dishes from results
    let dishes = searchResults.results.filter(r => r.resultType === 'DISH');

    // Apply price filter
    if (priceFilter === 1) {
      dishes.sort((a, b) => (a.price || 0) - (b.price || 0)); // Ascending
    } else if (priceFilter === 2) {
      dishes.sort((a, b) => (b.price || 0) - (a.price || 0)); // Descending
    }

    // Apply name filter
    if (nameFilter === 1) {
      dishes.sort((a, b) => a.name.localeCompare(b.name)); // A-Z
    } else if (nameFilter === 2) {
      dishes.sort((a, b) => b.name.localeCompare(a.name)); // Z-A
    }

    return dishes;
  };

  const getTables = () => {
    if (!searchResults?.results) return [];
    // Filter only tables from results
    return searchResults.results.filter(r => r.resultType === 'TABLE');
  };

  const handleDishPress = (dishId: number, dish: SearchResultDTO) => {
    // Add to cart
    if (dish.price) {
      addToCart({
        id: dishId,
        categoryId: 0,
        categoryName: '',
        name: dish.name,
        description: dish.description || '',
        price: dish.price,
        imageUrl: dish.imageUrl || '',
        isVegetarian: false,
        isVegan: false,
        isSpicy: false,
        active: true,
      });

      // Navigate to menu to continue ordering
      Alert.alert(
        'Đã thêm vào giỏ',
        `${dish.name} đã được thêm vào giỏ hàng.\n\nBạn có muốn xem menu để đặt thêm món?`,
        [
          { text: 'Xem giỏ hàng', onPress: () => router.push('/(tabs)/cart') },
          { text: 'Đặt thêm món', onPress: () => router.push('/(tabs)/menu') },
          { text: 'Đóng', style: 'cancel' }
        ]
      );
    }
  };

  const handleTablePress = (tableId: number, table: SearchResultDTO) => {
    // Show table info and navigate to dining to book
    Alert.alert(
      `Bàn ${table.name}`,
      `Khu vực: ${table.area || 'N/A'}\nSức chứa: ${table.seatingCapacity || 'N/A'} người\nTrạng thái: ${table.status}\n\nBạn có muốn xem trang đặt bàn?`,
      [
        {
          text: 'Đặt bàn',
          onPress: () => router.push('/(tabs)/dining')
        },
        {
          text: 'Đóng',
          style: 'cancel'
        }
      ]
    );
  };

  const renderDishCard = (result: SearchResultDTO) => (
    <TouchableOpacity
      key={`dish-${result.id}`}
      className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm active:opacity-80"
      onPress={() => handleDishPress(result.id, result)}
      activeOpacity={0.7}
    >
      <View className="flex-row">
        <DishImage
          imageUrl={result.imageUrl}
          style={{ width: 112, height: 112, resizeMode: 'cover' }}
        />

        <View className="flex-1 p-4">
          <View className="flex-row items-start justify-between mb-1">
            <Text className="text-gray-800 font-semibold text-base flex-1" numberOfLines={2}>
              {result.name}
            </Text>
            <View className="ml-2 bg-green-100 px-2 py-1 rounded-full">
              <Text className="text-green-700 text-xs font-semibold">
                {result.status === 'active' ? 'Available' : 'Unavailable'}
              </Text>
            </View>
          </View>

          {result.description && (
            <Text className="text-gray-500 text-sm mb-2" numberOfLines={2}>
              {result.description}
            </Text>
          )}

          <View className="flex-row items-center justify-between">
            <Text className="text-orange-500 font-bold text-lg">
              {formatPrice(result.price || 0)}
            </Text>

            {result.matchedFields.includes('ingredients') && (
              <View className="bg-blue-100 px-2 py-1 rounded">
                <Text className="text-blue-700 text-xs">Matched by ingredients</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTableCard = (result: SearchResultDTO) => (
    <TouchableOpacity
      key={`table-${result.id}`}
      className="bg-white rounded-2xl mb-4 p-4 shadow-sm active:opacity-80"
      onPress={() => handleTablePress(result.id, result)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <View className="w-20 h-20 bg-orange-100 rounded-xl items-center justify-center mr-4">
          <MaterialIcons name="event-seat" size={40} color="#F08B3C" />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-800 font-semibold text-base">
              {result.name}
            </Text>
            <View
              className={`px-3 py-1 rounded-full ${
                result.status === 'EMPTY' 
                  ? 'bg-green-100' 
                  : result.status === 'OCCUPIED'
                  ? 'bg-red-100'
                  : 'bg-yellow-100'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  result.status === 'EMPTY'
                    ? 'text-green-700'
                    : result.status === 'OCCUPIED'
                    ? 'text-red-700'
                    : 'text-yellow-700'
                }`}
              >
                {result.status}
              </Text>
            </View>
          </View>

          {result.description && (
            <Text className="text-gray-500 text-sm mb-2">
              {result.description}
            </Text>
          )}

          <View className="flex-row items-center">
            <View className="flex-row items-center mr-4">
              <Ionicons name="people" size={16} color="#666" />
              <Text className="text-gray-600 text-sm ml-1">
                {result.seatingCapacity} seats
              </Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="location" size={16} color="#666" />
              <Text className="text-gray-600 text-sm ml-1">
                {result.area}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-200">
        <View className="flex-row items-center mb-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 active:opacity-70"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-gray-800 font-bold text-xl">Kết quả tìm kiếm</Text>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2 mb-3">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="Tìm kiếm món ăn, bàn..."
            value={localSearchText}
            onChangeText={setLocalSearchText}
            onSubmitEditing={handleLocalSearch}
            returnKeyType="search"
          />
          {localSearchText !== currentQuery && localSearchText.length > 0 && (
            <TouchableOpacity onPress={handleLocalSearch}>
              <Ionicons name="arrow-forward-circle" size={24} color="#F97316" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Buttons */}
        {searchResults && searchResults.dishCount > 0 && (
          <View className="flex-row items-center">
            <Text className="text-gray-600 text-sm mr-3">Sắp xếp:</Text>

            {/* Price Filter */}
            <TouchableOpacity
              onPress={cyclePriceFilter}
              className={`flex-row items-center px-3 py-1.5 rounded-lg mr-2 ${
                priceFilter > 0 ? 'bg-orange-100' : 'bg-gray-100'
              }`}
            >
              <Ionicons
                name={
                  priceFilter === 0
                    ? 'cash-outline'
                    : priceFilter === 1
                    ? 'trending-up'
                    : 'trending-down'
                }
                size={16}
                color={priceFilter > 0 ? '#F97316' : '#6B7280'}
              />
              <Text
                className={`text-xs ml-1 ${
                  priceFilter > 0 ? 'text-orange-600 font-semibold' : 'text-gray-600'
                }`}
              >
                Giá
              </Text>
            </TouchableOpacity>

            {/* Name Filter */}
            <TouchableOpacity
              onPress={cycleNameFilter}
              className={`flex-row items-center px-3 py-1.5 rounded-lg ${
                nameFilter > 0 ? 'bg-orange-100' : 'bg-gray-100'
              }`}
            >
              <Ionicons
                name={
                  nameFilter === 0
                    ? 'text-outline'
                    : nameFilter === 1
                    ? 'arrow-up'
                    : 'arrow-down'
                }
                size={16}
                color={nameFilter > 0 ? '#F97316' : '#6B7280'}
              />
              <Text
                className={`text-xs ml-1 ${
                  nameFilter > 0 ? 'text-orange-600 font-semibold' : 'text-gray-600'
                }`}
              >
                Tên
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {searchResults && (
          <Text className="text-gray-600 text-sm">
            Found {searchResults.totalResults} results for "{searchResults.query}"
          </Text>
        )}
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F08B3C" />
          <Text className="text-gray-500 mt-4">Searching...</Text>
        </View>
      ) : searchResults ? (
        <ScrollView className="flex-1 px-6 py-4">
          {/* Summary */}
          {searchResults.totalResults > 0 && (
            <View className="bg-orange-50 rounded-xl p-4 mb-4">
              <Text className="text-orange-800 text-sm">
                {searchResults.dishCount} {searchResults.dishCount === 1 ? 'dish' : 'dishes'} • {' '}
                {searchResults.tableCount} {searchResults.tableCount === 1 ? 'table' : 'tables'}
              </Text>
            </View>
          )}

          {/* Results */}
          {searchResults.totalResults > 0 ? (
            <>
              {/* Filtered dishes */}
              {getFilteredDishes().map((result) => renderDishCard(result))}

              {/* Tables (no filter) */}
              {getTables().map((result) => renderTableCard(result))}
            </>
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <MaterialIcons name="search-off" size={80} color="#D1D5DB" />
              <Text className="text-gray-500 text-lg font-semibold mt-4">
                Không tìm thấy kết quả
              </Text>
              <Text className="text-gray-400 text-sm mt-2 text-center px-8">
                Thử tìm kiếm với từ khóa khác
              </Text>
            </View>
          )}
        </ScrollView>
      ) : null}
    </View>
  );
}

