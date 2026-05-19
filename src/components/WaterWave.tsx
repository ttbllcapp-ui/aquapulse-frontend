import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface Props {
  progress: number;
  height?: number;
  width?: number;
  colorTop?: string;
  colorMid?: string;
  colorDeep?: string;
}

const { width: SCREEN_W } = Dimensions.get('window');

export default function WaterWave({
  progress,
  height = 600,
  width = SCREEN_W,
  colorTop = '#00E5FF',
  colorMid = '#00B8FF',
  colorDeep = '#0088FF',
}: Props) {
  const phase = useSharedValue(0);
  const fillProgress = useSharedValue(0);

  useEffect(() => {
    phase.value = withRepeat(withTiming(1, { duration: 3500, easing: Easing.linear }), -1, false);
  }, [phase]);

  useEffect(() => {
    fillProgress.value = withSpring(Math.max(0, Math.min(1, progress)), { damping: 15, stiffness: 60 });
  }, [progress, fillProgress]);

  const w = width;
  const h = height;

  const wave1 = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(fillProgress.value, [0, 1], [h, h * 0.05]) },
      { translateX: interpolate(phase.value, [0, 1], [0, -w]) },
    ],
  }));

  const wave2 = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(fillProgress.value, [0, 1], [h + 8, h * 0.05 + 8]) },
      { translateX: interpolate(phase.value, [0, 1], [-w, 0]) },
    ],
    opacity: 0.55,
  }));

  const fillAnimated = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(fillProgress.value, [0, 1], [h, h * 0.05]) }],
  }));

  const wavePath = `M0 20 C ${w * 0.25} 0, ${w * 0.5} 40, ${w} 20 C ${w * 1.25} 0, ${w * 1.5} 40, ${w * 2} 20 L ${w * 2} ${h} L 0 ${h} Z`;

  return (
    <View style={[styles.container, { width: w, height: h }]} pointerEvents="none">
      <Animated.View style={[styles.fill, { width: w, height: h }, fillAnimated]}>
        <Svg width={w} height={h}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colorTop} stopOpacity="0.85" />
              <Stop offset="0.5" stopColor={colorMid} stopOpacity="0.9" />
              <Stop offset="1" stopColor={colorDeep} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Path d={`M0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`} fill="url(#grad)" />
        </Svg>
      </Animated.View>
      <Animated.View style={[styles.wave, wave1]}>
        <Svg width={w * 2} height={40} viewBox={`0 0 ${w * 2} 40`}>
          <Path d={wavePath} fill={colorTop} opacity={0.85} />
        </Svg>
      </Animated.View>
      <Animated.View style={[styles.wave, wave2]}>
        <Svg width={w * 2} height={40} viewBox={`0 0 ${w * 2} 40`}>
          <Path d={wavePath} fill={colorDeep} opacity={0.7} />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 0, left: 0, overflow: 'hidden' },
  fill: { position: 'absolute', top: 0, left: 0 },
  wave: { position: 'absolute', top: 0, left: 0 },
});
