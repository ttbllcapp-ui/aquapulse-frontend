import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '../src/AppContext';
import { AuthProvider } from '../src/AuthContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#040F16' }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppProvider>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#040F16' }, animation: 'fade' }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="login" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="body-map" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="family" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="legal" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="about" options={{ animation: 'slide_from_right' }} />
            </Stack>
          </AppProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
