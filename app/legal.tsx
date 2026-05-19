import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useApp } from '../src/AppContext';
import { getPrivacyPolicy, getTerms } from '../src/legal';

export default function LegalScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const { palette, state, t } = useApp();
  const lang = state.settings.language;
  const isPrivacy = type === 'privacy';
  const body = isPrivacy ? getPrivacyPolicy(lang) : getTerms(lang);
  const title = isPrivacy
    ? (lang === 'tr' ? 'Gizlilik Politikası' : 'Privacy Policy')
    : (lang === 'tr' ? 'Kullanım Koşulları' : 'Terms of Service');

  return (
    <View style={[styles.root, { backgroundColor: palette.bgPrimary }]}>
      <LinearGradient colors={palette.bgGradient} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity testID="back-btn" onPress={() => router.back()} style={[styles.backBtn, { borderColor: palette.borderLight, backgroundColor: palette.glassBg }]}>
            <ArrowLeft color={palette.textPrimary} size={20} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: palette.textPrimary }]}>{title}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.body, { color: palette.textSecondary }]}>{body}</Text>
          <View style={{ height: 60 }} />
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
  scroll: { padding: 24, paddingBottom: 40 },
  body: { fontSize: 14, lineHeight: 22 },
});
