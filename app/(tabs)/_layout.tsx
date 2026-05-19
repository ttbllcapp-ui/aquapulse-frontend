import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Home, BarChart3, Award, Settings as SettingsIcon, Sparkles } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useApp } from '../../src/AppContext';

export default function TabsLayout() {
  const { palette, t, state, loading } = useApp();
  const router = useRouter();

  // Hard guard: never allow tabs without completed onboarding.
  useEffect(() => {
    if (loading) return;
    if (!state.settings.onboarded) {
      router.replace('/welcome');
    }
  }, [loading, state.settings.onboarded, router]);

  if (loading || !state.settings.onboarded) {
    return <View style={{ flex: 1, backgroundColor: palette.bgPrimary }} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.textSecondary,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: palette.isDark ? 'rgba(4, 15, 22, 0.85)' : 'rgba(255,255,255,0.9)',
          borderTopColor: palette.border,
          borderTopWidth: 1,
          height: 78,
          paddingTop: 10,
          paddingBottom: 18,
          elevation: 0,
        },
        tabBarBackground: () => (
          <BlurView intensity={40} tint={palette.isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        ),
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', letterSpacing: 0.1 },
        tabBarItemStyle: { paddingHorizontal: 2 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('today_short'),
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconWrap}><Home color={color} size={size} strokeWidth={2} /></View>
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: t('stats_title'),
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconWrap}><BarChart3 color={color} size={size} strokeWidth={2} /></View>
          ),
        }}
      />
      <Tabs.Screen
        name="aichat"
        options={{
          title: t('ai_tab'),
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconWrap}><Sparkles color={color} size={size} strokeWidth={2} /></View>
          ),
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: t('ach_title'),
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconWrap}><Award color={color} size={size} strokeWidth={2} /></View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings_title'),
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconWrap}><SettingsIcon color={color} size={size} strokeWidth={2} /></View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
});
