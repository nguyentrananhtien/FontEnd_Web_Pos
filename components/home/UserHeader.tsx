import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface UserHeaderProps {
  userName?: string;
  userAvatar?: string;
  onProfilePress: () => void;
  onMenuPress: () => void;
}

export const UserHeader: React.FC<UserHeaderProps> = ({
  userName,
  userAvatar,
  onProfilePress,
  onMenuPress,
}) => {
  return (
    <View className="flex-row justify-between items-center px-6 pt-12 pb-4 bg-white">
      <TouchableOpacity
        onPress={onProfilePress}
        className="flex-row items-center active:opacity-70"
        activeOpacity={0.7}
      >
        {userAvatar ? (
          <Image
            source={{ uri: userAvatar }}
            className="w-12 h-12 rounded-full mr-3"
          />
        ) : (
          <View className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center mr-3">
            <MaterialIcons name="person" size={28} color="#F08B3C" />
          </View>
        )}
        <View>
          <Text className="text-gray-500 text-xs">Welcome</Text>
          <Text className="text-gray-800 font-bold text-base">
            {userName || 'Guest'}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onMenuPress}
        className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center active:opacity-70"
        activeOpacity={0.7}
      >
        <MaterialIcons name="menu" size={24} color="#F08B3C" />
      </TouchableOpacity>
    </View>
  );
};

