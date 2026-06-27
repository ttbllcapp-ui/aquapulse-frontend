import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, Easing } from 'react-native-reanimated';

export default function SplashRing({ trigger, color = '#00E5FF' }: { trigger: number; color?: string }) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale2 = useSharedValue(0);
  const opacity2 = useSharedValue(0);

  useEffect(() => {
    if (trigger === 0) return;
    scale.value = 0;
    opacity.value = 0.9;
    scale.value = withTiming(4, { duration: 900, easing: Easing.out(Easing.cubic) });
    opacity.value = withSequence(
      withTiming(0.9, { duration: 80 }),
      withTiming(0, { duration: 820, easing: Easing.out(Easing.ease) })
    );
    scale2.value = 0;
    opacity2.value = 0.6;
    scale2.value = withTiming(3.2, { duration: 1100, easing: Easing.out(Easing.cubic) });
    opacity2.value = withSequence(
      withTiming(0.6, { duration: 120 }),
      withTiming(0, { duration: 980 })
    );
  }, [trigger, scale, opacity, scale2, opacity2]);

  const ring1 = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  const ring2 = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
    opacity: opacity2.value,
  }));

  return (
    <View pointerEvents="none" style={styles.root}>
      <Animated.View style={[styles.ring, { borderColor: color }, ring1]} />
      <Animated.View style={[styles.ring, { borderColor: color, borderWidth: 2 }, ring2]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { position: 'absolute', top: '30%', left: '50%', width: 0, height: 0, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 3,
    left: -60, top: -60,
  },
});
