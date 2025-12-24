import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface WaterDropLoaderProps {
  size?: number;
  color?: string;
}

export const WaterDropLoader: React.FC<WaterDropLoaderProps> = ({
  size = 50,
  color = '#3b82f6'
}) => {
  const drop1 = useRef(new Animated.Value(0)).current;
  const drop2 = useRef(new Animated.Value(0)).current;
  const drop3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createDropAnimation = (animatedValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 600,
              useNativeDriver: false,
            }),
          ]),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 600,
            useNativeDriver: false,
          }),
        ])
      );
    };

    const animation1 = createDropAnimation(drop1, 0);
    const animation2 = createDropAnimation(drop2, 200);
    const animation3 = createDropAnimation(drop3, 400);

    animation1.start();
    animation2.start();
    animation3.start();

    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
    };
  }, [drop1, drop2, drop3]);

  const animateStyle = (animatedValue: Animated.Value) => {
    const translateY = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, size * 1.2],
    });

    const opacity = animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0.5, 0],
    });

    const scale = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.5],
    });

    return {
      transform: [{ translateY }, { scale }],
      opacity,
    };
  };

  const dropSize = size * 0.25;

  return (
    <View style={[styles.container, { height: size * 1.5 }]}>
      <View style={styles.dropsContainer}>
        <Animated.View
          style={[
            styles.drop,
            {
              width: dropSize,
              height: dropSize,
              backgroundColor: color,
              borderRadius: dropSize / 2,
            },
            animateStyle(drop1),
          ]}
        />
        <Animated.View
          style={[
            styles.drop,
            {
              width: dropSize,
              height: dropSize,
              backgroundColor: color,
              borderRadius: dropSize / 2,
            },
            animateStyle(drop2),
          ]}
        />
        <Animated.View
          style={[
            styles.drop,
            {
              width: dropSize,
              height: dropSize,
              backgroundColor: color,
              borderRadius: dropSize / 2,
            },
            animateStyle(drop3),
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropsContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  drop: {
    position: 'relative',
  },
});

