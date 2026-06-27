import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../src/AppContext';
import { useAuth } from '../src/AuthContext';

export default function Index() {
  const router = useRouter();
  const { state, loading, palette } = useApp();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (loading || authLoading) return;
    // Flow: if user already finished onboarding → home
    if (state.settings.onboarded) {
      router.replace('/(tabs)/home');
      return;
    }
    // If user is signed in but not onboarded → onboarding directly
    if (user) {
      router.replace('/onboarding');
      return;
    }
    // Fresh user: show welcome/login screen FIRST
    router.replace('/welcome');
  }, [loading, authLoading, state.settings.onboarded, user, router]);

  return (
    <View style={[styles.container, { backgroundColor: palette.bgPrimary }]}>
      <ActivityIndicator color={palette.primary} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
