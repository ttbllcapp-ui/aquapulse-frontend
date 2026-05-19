import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, Globe, Heart, Code, Waves } from 'lucide-react-native';
import { useApp } from '../src/AppContext';
import Constants from 'expo-constants';

export default function AboutScreen() {
  const router = useRouter();
  const { palette, state } = useApp();
  const lang = state.settings.language;
  const version = (Constants.expoConfig?.version) || '1.0.0';
  const company = (Constants.expoConfig?.extra as any)?.companyName || 'TTB International LLC';
  const email = (Constants.expoConfig?.extra as any)?.supportEmail || 'info@ttbinternationalllc.com';

  return (
    <View style={[styles.root, { backgroundColor: palette.bgPrimary }]}>
      <LinearGradient colors={palette.bgGradient} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity testID="back-btn" onPress={() => router.back()} style={[styles.backBtn, { borderColor: palette.borderLight, backgroundColor: palette.glassBg }]}>
            <ArrowLeft color={palette.textPrimary} size={20} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: palette.textPrimary }]}>{lang === 'tr' ? 'Hakkında' : 'About'}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.logoWrap, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}>
            <Waves color={palette.primary} size={56} strokeWidth={1.8} />
          </View>
          <Text style={[styles.appName, { color: palette.textPrimary }]}>AquaPulse</Text>
          <Text style={[styles.version, { color: palette.textSecondary }]}>v{version}</Text>

          <View style={[styles.card, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}>
            <View style={styles.row}><Code color={palette.primary} size={18} /><Text style={[styles.rowText, { color: palette.textPrimary }]}>{lang === 'tr' ? 'Geliştirici' : 'Developer'}: {company}</Text></View>
            <TouchableOpacity onPress={() => Linking.openURL(`mailto:${email}`)} style={styles.row}>
              <Mail color={palette.primary} size={18} />
              <Text style={[styles.rowText, { color: palette.primary }]}>{email}</Text>
            </TouchableOpacity>
            <View style={styles.row}><Globe color={palette.primary} size={18} /><Text style={[styles.rowText, { color: palette.textPrimary }]}>18 {lang === 'tr' ? 'dil destekli' : 'languages'}</Text></View>
            <View style={styles.row}><Heart color={palette.accentCoral} size={18} /><Text style={[styles.rowText, { color: palette.textPrimary }]}>{lang === 'tr' ? 'Sağlığınız için tasarlandı' : 'Designed for your health'}</Text></View>
          </View>

          <Text style={[styles.copyright, { color: palette.textMuted }]}>© 2026 {company}. {lang === 'tr' ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  title: { fontSize: 22, fontWeight: '800' },
  scroll: { padding: 24, alignItems: 'center' },
  logoWrap: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', borderWidth: 2, marginTop: 12 },
  appName: { fontSize: 28, fontWeight: '900', marginTop: 16, letterSpacing: -0.5 },
  version: { fontSize: 14, marginTop: 4 },
  card: { width: '100%', padding: 18, borderRadius: 16, borderWidth: 1, marginTop: 24, gap: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { fontSize: 14, fontWeight: '500' },
  copyright: { fontSize: 12, marginTop: 32, textAlign: 'center' },
});
