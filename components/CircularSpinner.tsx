import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularSpinnerProps {
  size?: number;
  color?: string;
  thickness?: number;
}

export const CircularSpinner: React.FC<CircularSpinnerProps> = ({
  size = 40,
  color = '#f97316',
  thickness = 4,
}) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (270 / 360) * circumference;
  const gap = circumference - arcLength;

  const animatedProps = useAnimatedProps(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[{ width: size, height: size }, animatedProps]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={thickness}
            strokeDasharray={`${arcLength} ${gap}`}
            strokeLinecap="round"
            fill="none"
            opacity={1}
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={thickness}
            strokeDasharray={`${arcLength} ${gap}`}
            strokeLinecap="round"
            fill="none"
            opacity={0.2}
            rotation={180}
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

