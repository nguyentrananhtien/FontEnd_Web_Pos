import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

interface FeaturedDishCardProps {
  image: string;
  name: string;
  price: number;
  description?: string;
  onPress?: () => void;
}

export const FeaturedDishCard: React.FC<FeaturedDishCardProps> = ({
  image,
  name,
  price,
  description,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl mr-4 active:scale-95"
      style={{
        width: 200,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        elevation: 3
      }}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: image }}
        className="w-full h-32 rounded-t-2xl"
        resizeMode="cover"
      />
      <View className="p-3">
        <Text className="text-gray-800 font-bold text-base mb-1" numberOfLines={1}>
          {name}
        </Text>
        <Text className="text-orange-600 font-semibold text-lg mb-1">
          {price.toLocaleString('vi-VN')}đ
        </Text>
        {description && (
          <Text className="text-gray-500 text-xs" numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

