import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Sparkles, Droplets, Shield, Globe } from 'lucide-react-native';
import { useApp } from '../src/AppContext';
import Bubbles from '../src/components/Bubbles';

export default function LoginScreen() {
  const router = useRouter();
  const { palette, state } = useApp();
  const lang = state.settings.language;
  const isTr = lang === 'tr';

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/welcome');
  };

  const goOnboarding = () => router.replace('/onboarding');

  return (
    <View style={[styles.root, { backgroundColor: palette.bgPrimary }]}>
      <LinearGradient colors={palette.bgGradient} style={StyleSheet.absoluteFill} />
      <Bubbles color={`${palette.primary}55`} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.topBar}>
          <TouchableOpacity
            testID="login-close"
            onPress={goBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={[styles.iconBtn, { borderColor: palette.borderLight, backgroundColor: palette.glassBg }]}
          >
            <X color={palette.textPrimary} size={22} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.logoWrap, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}>
            <Sparkles color={palette.primary} size={42} strokeWidth={1.6} />
          </View>

          <Text style={[styles.title, { color: palette.textPrimary }]}>
            {isTr ? 'AquaPulse' : 'AquaPulse'}
          </Text>
          <Text style={[styles.sub, { color: palette.textSecondary }]}>
            {isTr
              ? 'Su takibini başlat. Tüm özellikler ücretsiz, hesap gerekmez.'
              : 'Start tracking your hydration. All features are free, no account needed.'}
          </Text>

          <View style={styles.featureList}>
            <FeatureRow palette={palette} icon={<Droplets color={palette.primary} size={18} />} text={isTr ? 'Kişisel su hedefi hesapla' : 'Calculate your personal water goal'} />
            <FeatureRow palette={palette} icon={<Shield color={palette.primary} size={18} />} text={isTr ? 'Veriler yalnızca cihazında saklanır' : 'Data stored only on your device'} />
            <FeatureRow palette={palette} icon={<Globe color={palette.primary} size={18} />} text={isTr ? '18 dilde tam çeviri' : 'Fully translated in 18 languages'} />
          </View>

          <TouchableOpacity
            testID="login-start"
            style={[styles.startBtn, { backgroundColor: palette.primary }]}
            onPress={goOnboarding}
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
  topBar: { padding: 14, alignItems: 'flex-end' },
  iconBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 4, paddingBottom: 32, alignItems: 'center', gap: 12 },
  logoWrap: { width: 88, height: 88, borderRadius: 44, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 4, marginTop: 4 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center', letterSpacing: -0.4, paddingHorizontal: 8 },
  sub: { fontSize: 13, textAlign: 'center', lineHeight: 19, paddingHorizontal: 4 },
  featureList: { width: '100%', gap: 8, marginTop: 4 },
  featRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
  startBtn: { width: '100%', height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  startText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  legal: { fontSize: 11, textAlign: 'center', paddingHorizontal: 16, marginTop: 8 },
});
