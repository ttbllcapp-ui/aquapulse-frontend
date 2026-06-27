import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Modal, Pressable, Alert, Platform, Share, Linking, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as StoreReview from 'expo-store-review';
import Constants from 'expo-constants';
import { Bell, Target, Clock, Plus, Trash2, RotateCcw, Droplet, X, Check, Globe, Palette as PaletteIcon, MapPin, Volume2, Zap, Shield, FileText, Star, Share2, Mail, Info, LogIn, LogOut, ChevronRight, User, AlertTriangle, Trash } from 'lucide-react-native';
import { useApp } from '../../src/AppContext';
import { useAuth } from '../../src/AuthContext';
import { calculateGoal } from '../../src/storage';
import { DrinkType } from '../../src/types';
import GlassCard from '../../src/components/GlassCard';
import { requestPermissions } from '../../src/notifications';
import { LANGUAGES, LangCode } from '../../src/i18n';
import { COUNTRIES, findCountry } from '../../src/countries';
import { THEME_LIST, ThemeId, THEMES } from '../../src/themes';
import { apiDelete } from '../../src/api';

export default function SettingsScreen() {
  const router = useRouter();
  const { state, palette, t, updateSettings, setTheme, setLanguage, addCustomCup, removeCustomCup, resetAll } = useApp();
  const { user, signOut } = useAuth();
  const s = state.settings;

  const [weight, setWeight] = useState(String(s.weightKg));
  const [goal, setGoal] = useState(String(s.dailyGoalMl));
  const [wake, setWake] = useState(s.wakeTime);
  const [sleep, setSleep] = useState(s.sleepTime);
  const [interval, setIntervalMin] = useState(String(s.reminderIntervalMin));

  const [cupModal, setCupModal] = useState(false);
  const [langModal, setLangModal] = useState(false);
  const [countryModal, setCountryModal] = useState(false);
  const [themeModal, setThemeModal] = useState(false);
  const [newCupName, setNewCupName] = useState('');
  // Delete-account flow state (Apple Store requirement)
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const doDeleteAccount = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await apiDelete('/auth/me');
    } catch (e: any) {
      Alert.alert(s.language === 'tr' ? 'Hata' : 'Error', e?.message || 'Failed');
      setDeleting(false);
      return;
    }
    try { await signOut(); } catch {}
    try { await resetAll(); } catch {}
    setDeleteOpen(false);
    setDeleting(false);
    setDeleteText('');
    router.replace('/welcome');
  };
  const [newCupAmount, setNewCupAmount] = useState('300');
  const [newCupType, setNewCupType] = useState<DrinkType>('water');

  const saveSettings = async () => {
    await updateSettings({
      weightKg: parseFloat(weight) || 70,
      dailyGoalMl: parseInt(goal) || 2500,
      wakeTime: wake, sleepTime: sleep,
      reminderIntervalMin: parseInt(interval) || 90,
    });
    Alert.alert(t('saved'), t('saved_body'));
  };

  const toggleNotif = async (val: boolean) => {
    if (val) {
      const ok = await requestPermissions();
      if (!ok && Platform.OS !== 'web') {
        Alert.alert(t('perm_required'), t('perm_required_body'));
        return;
      }
    }
    await updateSettings({ remindersEnabled: val });
  };

  const onAddCup = async () => {
    if (!newCupName.trim()) return;
    const amount = parseInt(newCupAmount);
    if (!amount) return;
    await addCustomCup({ name: newCupName.trim(), amount, type: newCupType, icon: 'Droplet' });
    setNewCupName(''); setNewCupAmount('300'); setCupModal(false);
  };

  const onResetAll = () => {
    Alert.alert(t('reset_confirm_title'), t('reset_confirm_body'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('reset'), style: 'destructive', onPress: async () => { await resetAll(); } },
    ]);
  };

  const currentLang = LANGUAGES.find((l) => l.code === s.language);
  const currentCountry = findCountry(s.countryCode);
  const boost = findCountry(s.countryCode)?.climateBoostMl || 0;

  return (
    <View style={[styles.root, { backgroundColor: palette.bgPrimary }]}>
      <LinearGradient colors={palette.bgGradient} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.h1, { color: palette.textPrimary }]}>{t('settings_title')}</Text>
          <Text style={[styles.sub, { color: palette.textSecondary }]}>{t('settings_sub')}</Text>

          {/* Account */}
          <GlassCard style={{ marginTop: 20, padding: 18, gap: 12 }}>
            <View style={styles.rowHead}>
              <User color={palette.primary} size={20} />
              <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>{t('account')}</Text>
            </View>
            {user ? (
              <View style={{ gap: 12 }}>
                <View style={[styles.userRow, { backgroundColor: palette.glassBgLight, borderColor: palette.borderLight }]}>
                  {user.picture ? (
                    <Image source={{ uri: user.picture }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, { backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' }]}>
                      <Text style={{ color: palette.onPrimary, fontWeight: '800', fontSize: 18 }}>{(user.name || user.email).slice(0, 1).toUpperCase()}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: palette.textPrimary, fontWeight: '700', fontSize: 14 }} numberOfLines={1}>{user.name || user.email}</Text>
                    <Text style={{ color: palette.textSecondary, fontSize: 12 }} numberOfLines={1}>{user.email}</Text>
                  </View>
                </View>
                <TouchableOpacity testID="logout-btn" onPress={signOut} style={[styles.authBtn, { borderColor: palette.accentCoral }]}>
                  <LogOut color={palette.accentCoral} size={18} />
                  <Text style={{ color: palette.accentCoral, fontWeight: '700' }}>{t('sign_out')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: 8 }}>
                <Text style={{ color: palette.textSecondary, fontSize: 13 }}>{t('account_guest_desc')}</Text>
                <TouchableOpacity testID="login-btn" onPress={() => router.push('/login')} activeOpacity={0.85}>
                  <LinearGradient colors={palette.primaryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.saveBtn}>
                    <LogIn color={palette.onPrimary} size={18} strokeWidth={2.4} />
                    <Text style={{ color: palette.onPrimary, fontSize: 15, fontWeight: '800' }}>{s.language === 'tr' ? 'Giriş yap / Kayıt ol' : 'Sign in / Sign up'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
            {/* Always-visible reset / logout button */}
            <TouchableOpacity
              testID="reset-account-btn"
              onPress={() => {
                Alert.alert(
                  s.language === 'tr' ? 'Çıkış / Sıfırla' : 'Sign out / Reset',
                  s.language === 'tr'
                    ? 'Hesabından çıkış yapıp tüm yerel verileri silmek istiyor musun? Onboarding ekranı tekrar açılır.'
                    : 'Sign out and clear all local data? Onboarding will reopen.',
                  [
                    { text: t('cancel'), style: 'cancel' },
                    {
                      text: s.language === 'tr' ? 'Evet, çıkış yap' : 'Yes, sign out',
                      style: 'destructive',
                      onPress: async () => {
                        try { await signOut(); } catch {}
                        try { await resetAll(); } catch {}
                        router.replace('/welcome');
                      },
                    },
                  ]
                );
              }}
              style={[styles.authBtn, { borderColor: palette.accentCoral, marginTop: 4 }]}
            >
              <LogOut color={palette.accentCoral} size={18} />
              <Text style={{ color: palette.accentCoral, fontWeight: '700' }}>
                {user ? t('sign_out') : (s.language === 'tr' ? 'Hesabı sıfırla' : 'Reset account')}
              </Text>
            </TouchableOpacity>

            {/* Permanent account deletion (required by Apple App Store) — only for signed-in users */}
            {user && (
              <TouchableOpacity
                testID="delete-account-btn"
                onPress={() => { setDeleteText(''); setDeleteOpen(true); }}
                style={[styles.authBtn, { borderColor: '#FF4757', borderStyle: 'dashed', marginTop: 4 }]}
              >
                <Trash color="#FF4757" size={18} />
                <Text style={{ color: '#FF4757', fontWeight: '800' }}>
                  {s.language === 'tr' ? 'Hesabımı kalıcı olarak sil' : 'Permanently delete my account'}
                </Text>
              </TouchableOpacity>
            )}
          </GlassCard>

          {/* Appearance */}
          <GlassCard style={{ marginTop: 14, padding: 18, gap: 14 }}>
            <View style={styles.rowHead}>
              <PaletteIcon color={palette.primary} size={20} />
              <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>{t('theme')}</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-start' }}>
              {THEME_LIST.map((th) => {
                const tp = THEMES[th.id];
                const selected = s.themeId === th.id;
                return (
                  <TouchableOpacity
                    key={th.id} testID={`theme-${th.id}`}
                    style={[styles.themeSwatch, { borderColor: selected ? palette.primary : palette.borderLight }]}
                    onPress={() => setTheme(th.id)}
                  >
                    <LinearGradient colors={tp.primaryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.themeSwatchGrad} />
                    <Text style={{ color: palette.textPrimary, fontSize: 11, fontWeight: '600', marginTop: 6, textAlign: 'center', minHeight: 30 }} numberOfLines={2}>{t(th.key)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </GlassCard>

          {/* Language */}
          <GlassCard style={{ marginTop: 14, padding: 18, gap: 12 }}>
            <TouchableOpacity onPress={() => setLangModal(true)} style={styles.settingRow}>
              <View style={styles.rowHead}>
                <Globe color={palette.primary} size={20} />
                <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>{t('language')}</Text>
              </View>
              <Text style={{ color: palette.textSecondary, fontWeight: '600' }}>
                {currentLang?.flag} {currentLang?.label}
              </Text>
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: palette.border }} />
            <TouchableOpacity onPress={() => setCountryModal(true)} style={styles.settingRow}>
              <View style={styles.rowHead}>
                <MapPin color={palette.primary} size={20} />
                <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>{t('country')}</Text>
              </View>
              <Text style={{ color: palette.textSecondary, fontWeight: '600' }}>
                {currentCountry?.flag} {s.language === 'tr' ? currentCountry?.nameTr : currentCountry?.nameEn}
              </Text>
            </TouchableOpacity>
          </GlassCard>

          {/* Goal & body */}
          <GlassCard style={{ marginTop: 14, padding: 18, gap: 14 }}>
            <View style={styles.rowHead}>
              <Target color={palette.primary} size={20} />
              <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>{t('goal_and_body')}</Text>
            </View>
            <View style={styles.formRow}>
              <Text style={{ color: palette.textSecondary, flex: 1 }} numberOfLines={1}>{t('weight')}</Text>
              <View style={[styles.inputBox, { borderColor: palette.borderLight }]}>
                <TextInput testID="settings-weight" style={[styles.input, { color: palette.textPrimary }]} value={weight} onChangeText={setWeight} keyboardType="numeric" />
                <Text style={{ color: palette.textSecondary, fontSize: 13 }}>kg</Text>
              </View>
            </View>
            <View style={styles.formRow}>
              <Text style={{ color: palette.textSecondary, flex: 1 }} numberOfLines={1}>{t('daily_goal')}</Text>
              <View style={[styles.inputBox, { borderColor: palette.borderLight }]}>
                <TextInput testID="settings-goal" style={[styles.input, { color: palette.textPrimary }]} value={goal} onChangeText={setGoal} keyboardType="numeric" />
                <Text style={{ color: palette.textSecondary, fontSize: 13 }}>ml</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setGoal(String(calculateGoal(parseFloat(weight) || 70, boost)))}>
              <Text style={{ color: palette.primary, fontSize: 13, fontWeight: '600' }}>{t('suggested')}: {calculateGoal(parseFloat(weight) || 70, boost)} ml</Text>
            </TouchableOpacity>
            <View style={[styles.formRow, { alignItems: 'flex-start' }]}>
              <View style={{ flex: 1, paddingRight: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Zap color={palette.accentPlant} size={16} />
                  <Text style={{ color: palette.textPrimary, fontWeight: '600' }}>{t('adaptive_goal')}</Text>
                </View>
                <Text style={{ color: palette.textSecondary, fontSize: 12, marginTop: 4 }}>{t('adaptive_goal_desc')}</Text>
              </View>
              <Switch
                testID="toggle-adaptive"
                value={s.adaptiveGoalEnabled}
                onValueChange={(v) => updateSettings({ adaptiveGoalEnabled: v })}
                thumbColor={s.adaptiveGoalEnabled ? palette.primary : '#888'}
                trackColor={{ false: '#333', true: `${palette.primary}60` }}
              />
            </View>
          </GlassCard>

          {/* Reminders */}
          <GlassCard style={{ marginTop: 14, padding: 18, gap: 14 }}>
            <View style={styles.rowHead}>
              <Bell color={palette.primary} size={20} />
              <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>{t('reminders')}</Text>
            </View>
            <View style={[styles.formRow, { alignItems: 'center' }]}>
              <Text style={{ color: palette.textSecondary }}>{t('notifications')}</Text>
              <Switch
                testID="toggle-reminders"
                value={s.remindersEnabled}
                onValueChange={toggleNotif}
                thumbColor={s.remindersEnabled ? palette.primary : '#888'}
                trackColor={{ false: '#333', true: `${palette.primary}60` }}
              />
            </View>
            <View style={[styles.formRow, { alignItems: 'center' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Volume2 color={palette.textSecondary} size={18} />
                <Text style={{ color: palette.textSecondary }}>{t('sound')}</Text>
              </View>
              <Switch
                testID="toggle-sound"
                value={s.soundEnabled}
                onValueChange={(v) => updateSettings({ soundEnabled: v })}
                thumbColor={s.soundEnabled ? palette.primary : '#888'}
                trackColor={{ false: '#333', true: `${palette.primary}60` }}
              />
            </View>
            <View style={styles.formRow}>
              <Text style={{ color: palette.textSecondary, flex: 1 }} numberOfLines={2}>{t('wake')}</Text>
              <View style={[styles.inputBox, { borderColor: palette.borderLight }]}>
                <Clock color={palette.textMuted} size={16} />
                <TextInput testID="settings-wake" style={[styles.input, { color: palette.textPrimary }]} value={wake} onChangeText={setWake} />
              </View>
            </View>
            <View style={styles.formRow}>
              <Text style={{ color: palette.textSecondary, flex: 1 }} numberOfLines={2}>{t('sleep')}</Text>
              <View style={[styles.inputBox, { borderColor: palette.borderLight }]}>
                <Clock color={palette.textMuted} size={16} />
                <TextInput testID="settings-sleep" style={[styles.input, { color: palette.textPrimary }]} value={sleep} onChangeText={setSleep} />
              </View>
            </View>
            <View style={styles.formRow}>
              <Text style={{ color: palette.textSecondary, flex: 1 }} numberOfLines={2}>{t('interval_min')}</Text>
              <View style={[styles.inputBox, { borderColor: palette.borderLight }]}>
                <TextInput testID="settings-interval" style={[styles.input, { color: palette.textPrimary }]} value={interval} onChangeText={setIntervalMin} keyboardType="numeric" />
              </View>
            </View>
          </GlassCard>

          {/* Cups */}
          <GlassCard style={{ marginTop: 14, padding: 18, gap: 12 }}>
            <View style={styles.rowHead}>
              <Droplet color={palette.primary} size={20} />
              <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>{t('your_cups_s')}</Text>
            </View>
            {state.customCups.map((cup) => (
              <View key={cup.id} style={[styles.cupRow, { borderBottomColor: palette.border }]}>
                <View>
                  <Text style={{ color: palette.textPrimary, fontSize: 15, fontWeight: '600' }}>{cup.nameKey ? t(cup.nameKey) : cup.name}</Text>
                  <Text style={{ color: palette.textSecondary, fontSize: 12, marginTop: 2 }}>{cup.amount} ml</Text>
                </View>
                <TouchableOpacity testID={`del-cup-${cup.id}`} onPress={() => removeCustomCup(cup.id)} style={{ padding: 8 }}>
                  <Trash2 color={palette.accentCoral} size={18} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity testID="add-cup-btn" style={[styles.addCupBtn, { borderColor: palette.primary }]} onPress={() => setCupModal(true)}>
              <Plus color={palette.primary} size={18} />
              <Text style={{ color: palette.primary, fontWeight: '700' }}>{t('add_cup_cta')}</Text>
            </TouchableOpacity>
          </GlassCard>

          <TouchableOpacity testID="save-settings" onPress={saveSettings} activeOpacity={0.85} style={{ marginTop: 14 }}>
            <LinearGradient colors={palette.primaryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.saveBtn}>
              <Check color={palette.onPrimary} size={20} strokeWidth={3} />
              <Text style={{ color: palette.onPrimary, fontSize: 16, fontWeight: '800' }}>{t('save_settings')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Info & legal links */}
          <View style={{ marginTop: 16, gap: 6 }}>
            <LinkRow testID="link-privacy" icon={<Shield color={palette.primary} size={18} />} label={s.language === 'tr' ? 'Gizlilik Politikası' : 'Privacy Policy'} onPress={() => router.push({ pathname: '/legal', params: { type: 'privacy' } })} palette={palette} />
            <LinkRow testID="link-terms" icon={<FileText color={palette.primary} size={18} />} label={s.language === 'tr' ? 'Kullanım Koşulları' : 'Terms of Service'} onPress={() => router.push({ pathname: '/legal', params: { type: 'terms' } })} palette={palette} />
            <LinkRow testID="link-rate" icon={<Star color="#FFD166" size={18} />} label={s.language === 'tr' ? 'Bize Yıldız Ver' : 'Rate AquaPulse'} onPress={async () => {
              try { const { openRateInAppStore } = await import('../../src/engagement'); await openRateInAppStore(); } catch {}
            }} palette={palette} />
            <LinkRow testID="link-share" icon={<Share2 color={palette.primary} size={18} />} label={s.language === 'tr' ? 'Arkadaşlarınla Paylaş' : 'Share with Friends'} onPress={async () => {
              try { const { shareApp } = await import('../../src/engagement'); await shareApp(s.language === 'tr' ? 'tr' : 'en'); } catch {}
            }} palette={palette} />
            <LinkRow testID="link-feedback" icon={<Mail color={palette.primary} size={18} />} label={s.language === 'tr' ? 'Geri Bildirim Gönder' : 'Send Feedback'} onPress={async () => {
              try { const { sendFeedbackEmail } = await import('../../src/engagement'); await sendFeedbackEmail(s.language === 'tr' ? 'tr' : 'en', '1.0.0'); } catch {}
            }} palette={palette} />
            <LinkRow testID="link-contact" icon={<Mail color={palette.primary} size={18} />} label={s.language === 'tr' ? 'Destek / İletişim' : 'Contact Support'} onPress={() => {
              const email = (Constants.expoConfig?.extra as any)?.supportEmail || 'info@ttbinternationalllc.com';
              Linking.openURL(`mailto:${email}?subject=AquaPulse%20Support`);
            }} palette={palette} />
            <LinkRow testID="link-about" icon={<Info color={palette.primary} size={18} />} label={s.language === 'tr' ? 'Hakkında' : 'About'} onPress={() => router.push('/about')} palette={palette} />
          </View>

          <TouchableOpacity testID="reset-all" onPress={onResetAll} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, marginTop: 10 }}>
            <RotateCcw color={palette.accentCoral} size={16} />
            <Text style={{ color: palette.accentCoral, fontWeight: '600' }}>{t('reset_all')}</Text>
          </TouchableOpacity>

          <Text style={{ color: palette.textMuted, fontSize: 12, textAlign: 'center', marginTop: 20 }}>AquaPulse • {t('app_tagline')} 🌊</Text>
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Add cup modal */}
      <Modal visible={cupModal} animationType="fade" transparent onRequestClose={() => setCupModal(false)}>
        <Pressable style={styles.modalRoot} onPress={() => setCupModal(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: palette.bgCard, borderColor: palette.borderLight }]} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={{ color: palette.textPrimary, fontSize: 22, fontWeight: '800' }}>{t('new_cup')}</Text>
              <TouchableOpacity onPress={() => setCupModal(false)}><X color={palette.textSecondary} size={22} /></TouchableOpacity>
            </View>
            <TextInput
              testID="new-cup-name"
              placeholder={t('new_cup')}
              placeholderTextColor={palette.textMuted}
              value={newCupName} onChangeText={setNewCupName}
              style={[styles.modalText, { color: palette.textPrimary, borderColor: palette.borderLight }]}
            />
            <View style={styles.modalAmountRow}>
              <TextInput
                testID="new-cup-amount"
                style={[styles.modalAmountInput, { color: palette.textPrimary, borderColor: palette.borderLight }]}
                value={newCupAmount} onChangeText={setNewCupAmount} keyboardType="numeric"
              />
              <Text style={{ color: palette.textSecondary }}>ml</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {(['water', 'tea', 'coffee', 'juice'] as DrinkType[]).map((tp) => (
                <TouchableOpacity
                  key={tp}
                  style={[styles.typeChip, { borderColor: palette.borderLight }, newCupType === tp ? { backgroundColor: palette.primary, borderColor: palette.primary } : { backgroundColor: 'rgba(255,255,255,0.05)' }]}
                  onPress={() => setNewCupType(tp)}
                >
                  <Text style={{ color: newCupType === tp ? palette.onPrimary : palette.textSecondary, fontWeight: '600' }}>
                    {tp === 'water' ? t('water') : tp === 'tea' ? t('tea') : tp === 'coffee' ? t('coffee') : t('juice')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity testID="confirm-add-cup" onPress={onAddCup} activeOpacity={0.85}>
              <LinearGradient colors={palette.primaryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.saveBtn}>
                <Plus color={palette.onPrimary} size={20} strokeWidth={3} />
                <Text style={{ color: palette.onPrimary, fontSize: 16, fontWeight: '800' }}>{t('add')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Language modal */}
      <Modal visible={langModal} animationType="fade" transparent onRequestClose={() => setLangModal(false)}>
        <Pressable style={styles.modalRoot} onPress={() => setLangModal(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: palette.bgCard, borderColor: palette.borderLight, maxHeight: '75%' }]} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={{ color: palette.textPrimary, fontSize: 22, fontWeight: '800' }}>{t('language')}</Text>
              <TouchableOpacity testID="lang-close" onPress={() => setLangModal(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X color={palette.textPrimary} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={true}>
              {LANGUAGES.map((l) => (
                <TouchableOpacity
                  key={l.code}
                  testID={`lang-row-${l.code}`}
                  style={[styles.modalListRow, { borderColor: palette.borderLight }, s.language === l.code && { borderColor: palette.primary, backgroundColor: `${palette.primary}22` }]}
                  onPress={async () => { await setLanguage(l.code as LangCode); setLangModal(false); }}
                >
                  <Text style={{ fontSize: 22 }}>{l.flag}</Text>
                  <Text style={{ color: palette.textPrimary, fontWeight: '600', fontSize: 15, flex: 1 }}>{l.label}</Text>
                  {s.language === l.code && <Check color={palette.primary} size={18} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Country modal */}
      <Modal visible={countryModal} animationType="fade" transparent onRequestClose={() => setCountryModal(false)}>
        <Pressable style={styles.modalRoot} onPress={() => setCountryModal(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: palette.bgCard, borderColor: palette.borderLight, maxHeight: '75%' }]} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={{ color: palette.textPrimary, fontSize: 22, fontWeight: '800' }}>{t('country')}</Text>
              <TouchableOpacity onPress={() => setCountryModal(false)}><X color={palette.textSecondary} size={22} /></TouchableOpacity>
            </View>
            <ScrollView>
              {COUNTRIES.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  style={[styles.modalListRow, { borderColor: palette.borderLight }, s.countryCode === c.code && { borderColor: palette.primary }]}
                  onPress={async () => { await updateSettings({ countryCode: c.code }); setCountryModal(false); }}
                >
                  <Text style={{ fontSize: 22 }}>{c.flag}</Text>
                  <Text style={{ color: palette.textPrimary, fontWeight: '600', fontSize: 15, flex: 1 }}>{s.language === 'tr' ? c.nameTr : c.nameEn}</Text>
                  {s.countryCode === c.code && <Check color={palette.primary} size={18} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Permanent Account Deletion Modal */}
      <Modal visible={deleteOpen} transparent animationType="fade" onRequestClose={() => setDeleteOpen(false)}>
        <Pressable style={[styles.modalRoot, { justifyContent: 'center', alignItems: 'center', padding: 18 }]} onPress={() => !deleting && setDeleteOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} style={[styles.deleteCard, { backgroundColor: palette.bgCard, borderColor: '#FF4757' }]}>
            <View style={[styles.deleteIcon, { backgroundColor: 'rgba(255,71,87,0.18)' }]}>
              <AlertTriangle color="#FF4757" size={28} />
            </View>
            <Text style={[styles.deleteTitle, { color: palette.textPrimary }]}>
              {s.language === 'tr' ? 'Hesabını kalıcı olarak sil?' : 'Permanently delete your account?'}
            </Text>
            <Text style={[styles.deleteBody, { color: palette.textSecondary }]}>
              {s.language === 'tr'
                ? 'Bu işlem GERİ ALINAMAZ. Profilin, içecek kayıtların, AquaCoach sohbetlerin, aile üyeliğin ve cihazdaki tüm yerel veriler silinir.'
                : 'This action CANNOT be undone. Your profile, drink history, AquaCoach chats, family memberships and all local data on this device will be removed.'}
            </Text>
            <Text style={[styles.deleteHint, { color: palette.textMuted }]}>
              {s.language === 'tr'
                ? 'Onaylamak için aşağıya SİL yaz.'
                : 'Type DELETE below to confirm.'}
            </Text>
            <TextInput
              testID="delete-confirm-input"
              value={deleteText}
              onChangeText={setDeleteText}
              autoCapitalize="characters"
              placeholder={s.language === 'tr' ? 'SİL' : 'DELETE'}
              placeholderTextColor={palette.textMuted}
              style={[styles.deleteInput, { backgroundColor: palette.glassBg, borderColor: palette.borderLight, color: palette.textPrimary }]}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity
                testID="delete-cancel"
                disabled={deleting}
                onPress={() => setDeleteOpen(false)}
                activeOpacity={0.85}
                style={[styles.modalBtnGhost, { borderColor: palette.borderLight }]}
              >
                <Text style={{ color: palette.textPrimary, fontWeight: '700' }}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="delete-confirm-btn"
                disabled={deleting || (deleteText.trim().toUpperCase() !== (s.language === 'tr' ? 'SİL' : 'DELETE'))}
                onPress={doDeleteAccount}
                activeOpacity={0.85}
                style={[styles.modalBtnDanger, { backgroundColor: '#FF4757', opacity: (deleting || (deleteText.trim().toUpperCase() !== (s.language === 'tr' ? 'SİL' : 'DELETE'))) ? 0.4 : 1 }]}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>
                  {deleting ? (s.language === 'tr' ? 'Siliniyor…' : 'Deleting…') : (s.language === 'tr' ? 'Hesabımı sil' : 'Delete account')}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 60 },
  h1: { fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
  sub: { marginTop: 4, fontSize: 14 },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  formRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingRight: 2 },
  formRowLabel: { color: 'transparent', flexShrink: 1 },
  inputBox: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, width: 116, height: 42, overflow: 'hidden' },
  input: { fontSize: 15, fontWeight: '700', paddingVertical: 0, flex: 1, textAlign: 'center', includeFontPadding: false },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  cupRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1 },
  addCupBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12, justifyContent: 'center', borderWidth: 1, borderRadius: 999, borderStyle: 'dashed' },
  saveBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 16, borderRadius: 999 },
  modalRoot: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, gap: 12, borderTopWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalText: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, fontWeight: '600' },
  modalAmountRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
  modalAmountInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderRadius: 16, padding: 14, fontSize: 24, fontWeight: '800', minWidth: 120, textAlign: 'center' },
  modalListRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginVertical: 4 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  themeSwatch: { width: '31%', alignItems: 'center', padding: 8, borderRadius: 16, borderWidth: 2, minHeight: 110 },
  themeSwatchGrad: { width: '100%', height: 56, borderRadius: 12 },
  authBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 999, borderWidth: 1 },
  deleteCard: { width: '92%', maxWidth: 380, alignSelf: 'center', padding: 22, borderRadius: 22, borderWidth: 1.5, gap: 6, marginVertical: 'auto' },
  deleteIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 6 },
  deleteTitle: { fontSize: 18, fontWeight: '900', textAlign: 'center', marginTop: 4 },
  deleteBody: { fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 6 },
  deleteHint: { fontSize: 11, textAlign: 'center', marginTop: 10, letterSpacing: 0.4 },
  deleteInput: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, fontWeight: '800', letterSpacing: 4, textAlign: 'center', marginTop: 8 },
  modalBtnGhost: { flex: 1, paddingVertical: 12, borderRadius: 999, borderWidth: 1, alignItems: 'center' },
  modalBtnDanger: { flex: 1, paddingVertical: 12, borderRadius: 999, alignItems: 'center' },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, borderWidth: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1 },
});

function LinkRow({ icon, label, onPress, palette, testID }: any) {
  return (
    <TouchableOpacity testID={testID} onPress={onPress} activeOpacity={0.7} style={[styles.linkRow, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}>
      {icon}
      <Text style={{ color: palette.textPrimary, fontSize: 14, fontWeight: '600', flex: 1 }}>{label}</Text>
      <ChevronRight color={palette.textMuted} size={18} />
    </TouchableOpacity>
  );
}
