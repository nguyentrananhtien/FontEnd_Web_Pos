import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

interface QuickActionButtonProps {
  icon: keyof typeof MaterialIcons.glyphMap | keyof typeof Ionicons.glyphMap;
  iconLibrary?: 'MaterialIcons' | 'Ionicons';
  label: string;
  onPress: () => void;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon,
  iconLibrary = 'MaterialIcons',
  label,
  onPress,
}) => {
  const IconComponent = iconLibrary === 'MaterialIcons' ? MaterialIcons : Ionicons;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl p-4 items-center justify-center active:scale-95"
      style={{
        minHeight: 100,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        elevation: 3
      }}
      activeOpacity={0.7}
    >
      <View className="bg-orange-100 rounded-full p-3 mb-2">
        <IconComponent name={icon as any} size={28} color="#F08B3C" />
      </View>
      <Text className="text-gray-800 font-medium text-center text-xs" numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

