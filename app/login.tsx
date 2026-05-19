import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Sparkles, Cloud, Shield, Apple } from 'lucide-react-native';
import { useApp } from '../src/AppContext';
import { useAuth } from '../src/AuthContext';
import Bubbles from '../src/components/Bubbles';

let AppleAuth: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  AppleAuth = require('expo-apple-authentication');
} catch {}

export default function LoginScreen() {
  const router = useRouter();
  const { palette, state } = useApp();
  const { signInWithGoogle, signInWithApple } = useAuth();
  const [busy, setBusy] = useState<'google' | 'apple' | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const lang = state.settings.language;
  const isTr = lang === 'tr';

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'ios' && AppleAuth?.isAvailableAsync) {
        try {
          const ok = await AppleAuth.isAvailableAsync();
          setAppleAvailable(!!ok);
        } catch {
          setAppleAvailable(false);
        }
      } else {
        setAppleAvailable(false);
      }
    })();
  }, []);

  const goBack = () => {
    try { router.back(); } catch { router.replace('/(tabs)/home'); }
  };

  const doGoogle = async () => {
    if (busy) return;
    setBusy('google');
    const res = await signInWithGoogle();
    setBusy(null);
    if (res.ok) goBack();
    else if (res.error && res.error !== 'cancelled') {
      Alert.alert(isTr ? 'Giriş başarısız' : 'Sign-in failed', res.error);
    }
  };

  const doApple = async () => {
    if (busy) return;
    if (!appleAvailable || !AppleAuth) {
      Alert.alert(
        isTr ? 'Apple ile giriş' : 'Sign in with Apple',
        isTr
          ? 'Apple ile giriş yalnızca iOS native sürümünde aktif. Bir sonraki TestFlight güncellemesiyle hazır olacak.'
          : 'Apple sign-in is only active on the native iOS build. Available in the next TestFlight update.',
      );
      return;
    }
    setBusy('apple');
    try {
      const credential = await AppleAuth.signInAsync({
        requestedScopes: [
          AppleAuth.AppleAuthenticationScope.FULL_NAME,
          AppleAuth.AppleAuthenticationScope.EMAIL,
        ],
      });
      const name = credential.fullName?.givenName || credential.fullName?.familyName || credential.email || 'Apple ID';
      if (credential.identityToken) {
        const res = await signInWithApple({ identityToken: credential.identityToken, fullName: name });
        if (res.ok) { goBack(); return; }
        Alert.alert(isTr ? 'Apple ile giriş başarısız' : 'Apple sign-in failed', res.error || 'unknown');
      } else {
        Alert.alert(isTr ? 'Apple ile bağlandın' : 'Connected with Apple', isTr ? `Hoş geldin ${name}!` : `Welcome ${name}!`);
        goBack();
      }
    } catch (e: any) {
      if (e?.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert(isTr ? 'Apple ile giriş başarısız' : 'Apple sign-in failed', String(e?.message || e));
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: palette.bgPrimary }]}>
      <LinearGradient colors={palette.bgGradient} style={StyleSheet.absoluteFill} />
      <Bubbles color={`${palette.primary}55`} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Close button — large hit area, always reachable */}
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
            {isTr ? 'AquaPulse hesabın' : 'Your AquaPulse account'}
          </Text>
          <Text style={[styles.sub, { color: palette.textSecondary }]}>
            {isTr
              ? 'Hidrasyon verilerini cihazlar arası senkronla ve AquaCoach sohbet geçmişini sakla.'
              : 'Sync your hydration across devices and keep your AquaCoach chat history.'}
          </Text>

          <View style={styles.featureList}>
            <FeatureRow palette={palette} icon={<Cloud color={palette.primary} size={18} />} text={isTr ? 'Sohbet geçmişin korunur' : 'Your chat history is preserved'} />
            <FeatureRow palette={palette} icon={<Sparkles color={palette.primary} size={18} />} text={isTr ? 'Tüm özellikler ücretsiz' : 'All features are free'} />
            <FeatureRow palette={palette} icon={<Shield color={palette.primary} size={18} />} text={isTr ? 'Yalnızca e-posta paylaşılır' : 'Only your email is shared'} />
          </View>

          <TouchableOpacity testID="apple-signin" activeOpacity={0.85} onPress={doApple} style={{ width: '100%', marginTop: 16 }}>
            <View style={styles.appleBtn}>
              {busy === 'apple' ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Apple color="#FFFFFF" size={20} fill="#FFFFFF" />
                  <Text style={styles.appleText}>{isTr ? 'Apple ile devam et' : 'Continue with Apple'}</Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity testID="google-signin" activeOpacity={0.85} onPress={doGoogle} style={{ width: '100%', marginTop: 10 }}>
            <View style={[styles.googleBtn, { backgroundColor: '#FFFFFF' }]}>
              {busy === 'google' ? (
                <ActivityIndicator color="#1A1A1A" />
              ) : (
                <>
                  <View style={styles.gIcon}><Text style={{ fontSize: 15, fontWeight: '900', color: '#4285F4' }}>G</Text></View>
                  <Text style={styles.googleText}>{isTr ? 'Google ile devam et' : 'Continue with Google'}</Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity testID="continue-guest" onPress={goBack} style={{ marginTop: 16, marginBottom: 4 }}>
            <Text style={{ color: palette.textSecondary, fontSize: 13, fontWeight: '600', textAlign: 'center' }}>
              {isTr ? 'Misafir olarak devam et' : 'Continue as guest'}
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
  googleBtn: { width: '100%', height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  appleBtn: { width: '100%', height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, backgroundColor: '#000000', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  appleText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  gIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#F1F3F4', alignItems: 'center', justifyContent: 'center' },
  googleText: { color: '#1A1A1A', fontSize: 15, fontWeight: '700' },
  legal: { fontSize: 11, textAlign: 'center', paddingHorizontal: 16, marginTop: 8 },
});
