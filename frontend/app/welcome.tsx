import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Droplets, Shield, Globe } from 'lucide-react-native';
import { useApp } from '../src/AppContext';
import Bubbles from '../src/components/Bubbles';
import AquaMascot from '../src/components/AquaMascot';

export default function WelcomeScreen() {
  const router = useRouter();
  const { palette, state } = useApp();
  const lang = state.settings.language;
  const isTr = lang === 'tr';

  const goNext = () => router.replace('/onboarding');

  return (
    <View style={[styles.root, { backgroundColor: palette.bgPrimary }]}>
      <LinearGradient colors={palette.bgGradient} style={StyleSheet.absoluteFill} />
      <Bubbles color={`${palette.primary}55`} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 6 }}>
            <AquaMascot mood="happy" primary={palette.primary} size={140} />
          </View>

          <Text style={[styles.brand, { color: palette.textPrimary }]}>AquaPulse</Text>
          <Text style={[styles.title, { color: palette.textPrimary }]}>
            {isTr ? 'Hoş geldin 🌊' : 'Welcome 🌊'}
          </Text>
          <Text style={[styles.sub, { color: palette.textSecondary }]}>
            {isTr
              ? 'Günlük su takibine başla. Tüm özellikler ücretsiz.'
              : 'Start tracking your daily hydration. All features are free.'}
          </Text>

          <View style={styles.featureList}>
            <FeatureRow palette={palette} icon={<Droplets color={palette.primary} size={18} />} text={isTr ? 'Kişisel su hedefi hesapla' : 'Calculate your personal water goal'} />
            <FeatureRow palette={palette} icon={<Shield color={palette.primary} size={18} />} text={isTr ? 'Veriler yalnızca cihazında saklanır' : 'Data stored only on your device'} />
            <FeatureRow palette={palette} icon={<Globe color={palette.primary} size={18} />} text={isTr ? '18 dilde tam çeviri' : 'Fully translated in 18 languages'} />
          </View>

          <TouchableOpacity
            testID="welcome-start"
            style={[styles.startBtn, { backgroundColor: palette.primary }]}
            onPress={goNext}
            activeOpacity={0.85}
          >
            <Text style={styles.startText}>
              {isTr ? 'Başla' : 'Get Started'}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.legal, { color: palette.textMuted }]}>
            {isTr
              ? 'Devam ederek Gizlilik Politikamızı ve Koşullarımızı kabul edersin.'
              : 'By continuing you accept our Privacy Policy and Terms.'}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function FeatureRow({ icon, text, palette }: any) {
  return (
    <View style={[styles.featRow, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}>
      {icon}
      <Text style={{ color: palette.textPrimary, fontSize: 13, fontWeight: '600', flex: 1 }} numberOfLines={2}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 28, alignItems: 'center', gap: 10 },
  brand: { fontSize: 14, fontWeight: '800', letterSpacing: 2, opacity: 0.7, marginBottom: -2 },
  title: { fontSize: 26, fontWeight: '900', textAlign: 'center', letterSpacing: -0.4, paddingHorizontal: 8 },
  sub: { fontSize: 13, textAlign: 'center', lineHeight: 19, paddingHorizontal: 4 },
  featureList: { width: '100%', gap: 8, marginTop: 8 },
  featRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
  startBtn: { width: '100%', height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  startText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  legal: { fontSize: 11, textAlign: 'center', paddingHorizontal: 16, marginTop: 12 },
});
