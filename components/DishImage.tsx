import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

interface DishImageProps {
  imageUrl?: string;
  style?: StyleProp<ImageStyle>;
  defaultImage?: any;
}

/**
 * Component hiển thị ảnh món ăn
 * Hỗ trợ base64, URL, và ảnh mặc định
 */
export default function DishImage({ imageUrl, style, defaultImage }: DishImageProps) {
  // Check if imageUrl is base64
  const isBase64 = imageUrl?.startsWith('data:image');

  // If no image or invalid base64
  if (!imageUrl || imageUrl.trim() === '') {
    return (
      <Image
        source={defaultImage || require('../assets/images/test.png')}
        style={style}
        defaultSource={defaultImage || require('../assets/images/test.png')}
      />
    );
  }

  // If base64, use directly
  if (isBase64) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={style}
        defaultSource={defaultImage || require('../assets/images/test.png')}
      />
    );
  }

  // If not base64, assume it's already base64 string without prefix
  // Add data:image/jpeg;base64, prefix
  const base64Image = `data:image/jpeg;base64,${imageUrl}`;

  return (
    <Image
      source={{ uri: base64Image }}
      style={style}
      defaultSource={defaultImage || require('../assets/images/test.png')}
    />
  );
}

