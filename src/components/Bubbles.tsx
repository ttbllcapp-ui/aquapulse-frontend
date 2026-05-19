import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

function Bubble({ delay, leftPct, size, color }: { delay: number; leftPct: number; size: number; color: string }) {
  const y = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(delay, withRepeat(withTiming(-SCREEN_H * 0.6, { duration: 7000 + delay, easing: Easing.linear }), -1, false));
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.5, { duration: 800 }),
          withTiming(0.3, { duration: 5000 }),
          withTiming(0, { duration: 1200 })
        ),
        -1,
        false
      )
    );
  }, [delay, y, opacity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.bubble,
        { left: `${leftPct}%`, width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        style,
      ]}
    />
  );
}

export default function Bubbles({ color = 'rgba(0, 229, 255, 0.5)' }: { color?: string }) {
  const config = [
    { delay: 0, leftPct: 12, size: 8 },
    { delay: 1500, leftPct: 78, size: 12 },
    { delay: 3000, leftPct: 35, size: 6 },
    { delay: 800, leftPct: 60, size: 10 },
    { delay: 4200, leftPct: 88, size: 7 },
    { delay: 2200, leftPct: 22, size: 14 },
  ];
  return (
    <View pointerEvents="none" style={styles.layer}>
      {config.map((c, i) => (
        <Bubble key={i} {...c} color={color} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', left: 0, right: 0, bottom: 0, height: SCREEN_H, width: SCREEN_W },
  bubble: {
    position: 'absolute',
    bottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
});
