import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useApp } from '../AppContext';

export default function GlassCard({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { palette } = useApp();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.glassBg,
          borderColor: palette.borderLight,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 24, padding: 16 },
});
