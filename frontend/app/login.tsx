import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Sparkles, Cloud, Shield, Globe } from 'lucide-react-native';
import { useApp } from '../src/AppContext';
import { useAuth, warmupBackend } from '../src/AuthContext';
import Bubbles from '../src/components/Bubbles';

// expo-apple-authentication is a native-only module.
// On web preview we silently fall back to an explanatory alert.
let AppleAuth: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  AppleAuth = require('expo-apple-authentication');
} catch {}

export default function LoginScreen() {
  const router = useRouter();
  const { palette, state } = useApp();
  const { signInWithApple } = useAuth();
  const [busy, setBusy] = useState<'apple' | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const lang = state.settings.language;
  const isTr = lang === 'tr';

  useEffect(() => {
    // Warm up Render free-tier backend immediately so the auth request below
    // doesn't hit a 30-60s cold start (root cause of the first App Review 2.1(a) reject).
    warmupBackend();
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
    if (router.canGoBack()) router.back();
    else router.replace('/welcome');
  };

  const doApple = async () => {
    if (busy) return;
    if (!appleAvailable || !AppleAuth) {
      Alert.alert(
        isTr ? 'Apple ile giriş' : 'Sign in with Apple',
        isTr
          ? 'Apple ile giriş yalnızca iOS cihazlarda kullanılabilir. Bu önizleme web tarayıcısında çalıştığı için butonu aktif gösteremedik. iOS uygulamasında sorunsuz çalışır.'
          : 'Sign in with Apple is only available on iOS devices. This preview runs in a web browser so the button is shown as inactive — it works perfectly in the native iOS app.',
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
        Alert.alert(
          isTr ? 'Giriş başarısız' : 'Sign-in failed',
          (res.error || 'unknown') + (isTr ? '\n\nLütfen tekrar deneyin.' : '\n\nPlease try again.'),
        );
      } else {
        Alert.alert(
          isTr ? 'Giriş başarısız' : 'Sign-in failed',
          isTr ? 'Apple bir kimlik doğrulama jetonu sağlamadı.' : 'Apple did not return an identity token.',
        );
      }
    } catch (e: any) {
      if (e?.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert(
          isTr ? 'Apple ile giriş başarısız' : 'Apple sign-in failed',
          String(e?.message || e),
        );
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
        {/* Close button */}
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
              ? 'Hidrasyon verilerini cihazlar arası senkronla, AquaCoach sohbet geçmişini sakla. Veya hesap açmadan misafir olarak devam et.'
              : 'Sync your hydration across devices and keep your AquaCoach history. Or skip sign-in and continue as guest.'}
          </Text>

          <View style={styles.featureList}>
            <FeatureRow palette={palette} icon={<Cloud color={palette.primary} size={18} />} text={isTr ? 'Sohbet geçmişin korunur' : 'Your chat history is preserved'} />
            <FeatureRow palette={palette} icon={<Shield color={palette.primary} size={18} />} text={isTr ? 'Yalnızca adın ve e-posta paylaşılır' : 'Only your name and email are shared'} />
            <FeatureRow palette={palette} icon={<Globe color={palette.primary} size={18} />} text={isTr ? '18 dilde tam çeviri' : 'Fully translated in 18 languages'} />
          </View>

          {/* Native Apple Sign-In button only — no web fallback, no guest. */}
          {Platform.OS === 'ios' && appleAvailable && AppleAuth?.AppleAuthenticationButton && (
            <View style={{ width: '100%', marginTop: 16 }}>
              <AppleAuth.AppleAuthenticationButton
                testID="apple-signin"
                buttonType={AppleAuth.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuth.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={14}
                style={styles.appleNative}
                onPress={doApple}
              />
              {busy === 'apple' && (
                <View style={styles.busyRow}>
                  <ActivityIndicator color={palette.textPrimary} />
                  <Text style={{ color: palette.textPrimary, fontSize: 13, fontWeight: '600' }}>
                    {isTr ? 'Giriş yapılıyor…' : 'Signing in…'}
                  </Text>
                </View>
              )}
            </View>
          )}

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
  appleNative: { width: '100%', height: 52, marginTop: 16 },
  busyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 12 },
  appleBtnFallback: { width: '100%', height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, backgroundColor: '#000000', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', marginTop: 16 },
  appleText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  legal: { fontSize: 11, textAlign: 'center', paddingHorizontal: 16, marginTop: 8 },
});
