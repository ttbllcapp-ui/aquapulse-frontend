import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Droplet, ChevronRight, Waves, Bell, Target, Globe, MapPin, User, Calendar, Ruler } from 'lucide-react-native';
import { useApp } from '../src/AppContext';
import { calculateGoal } from '../src/storage';
import { requestPermissions, scheduleReminders } from '../src/notifications';
import { LANGUAGES, LangCode } from '../src/i18n';
import { COUNTRIES, findCountry } from '../src/countries';
import Bubbles from '../src/components/Bubbles';
import { Gender } from '../src/types';

const STEPS = ['welcome', 'language', 'country', 'gender', 'age', 'height', 'weight', 'goal', 'schedule', 'notifications'] as const;
type Step = typeof STEPS[number];

export default function Onboarding() {
  const router = useRouter();
  const { palette, t, updateSettings, setLanguage, state } = useApp();
  const [step, setStep] = useState<Step>('welcome');
  const [weight, setWeight] = useState('70');
  const [heightCm, setHeightCm] = useState('170');
  const [age, setAge] = useState('30');
  const [gender, setGender] = useState<Gender>('other');
  const [country, setCountry] = useState('TR');
  const [goal, setGoal] = useState(String(calculateGoal(70, findCountry('TR')?.climateBoostMl || 0, { heightCm: 170, ageYears: 30, gender: 'other' })));
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepTime, setSleepTime] = useState('23:00');
  const [interval, setIntervalMin] = useState('90');
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [lang, setLang] = useState<LangCode>(state.settings.language);

  const recalcGoal = () => {
    const boost = findCountry(country)?.climateBoostMl || 0;
    setGoal(String(calculateGoal(parseFloat(weight) || 70, boost, {
      heightCm: parseFloat(heightCm) || 170,
      ageYears: parseFloat(age) || 30,
      gender,
    })));
  };

  const goNext = async () => {
    const idx = STEPS.indexOf(step);
    if (step === 'language') {
      await setLanguage(lang);
    }
    if (step === 'country' || step === 'gender' || step === 'age' || step === 'height' || step === 'weight') {
      recalcGoal();
    }
    if (idx < STEPS.length - 1) {
      setStep(STEPS[idx + 1]);
      return;
    }
    let allow = notifEnabled;
    if (notifEnabled) allow = await requestPermissions();
    const finalSettings = {
      weightKg: parseFloat(weight) || 70,
      heightCm: parseFloat(heightCm) || 170,
      ageYears: parseInt(age) || 30,
      gender,
      dailyGoalMl: parseInt(goal) || 2500,
      wakeTime, sleepTime,
      reminderIntervalMin: parseInt(interval) || 90,
      remindersEnabled: allow,
      countryCode: country,
      language: lang,
      onboarded: true,
    };
    await updateSettings(finalSettings);
    if (allow) {
      scheduleReminders({ ...state.settings, ...finalSettings } as any).catch(() => {});
    }
    router.replace('/(tabs)/home');
  };

  const isLast = step === 'notifications';
  const boost = findCountry(country)?.climateBoostMl || 0;
  const suggested = calculateGoal(parseFloat(weight) || 70, boost, {
    heightCm: parseFloat(heightCm) || 170,
    ageYears: parseFloat(age) || 30,
    gender,
  });

  const GENDERS: { key: Gender; labelKey: string; icon: string }[] = [
    { key: 'male', labelKey: 'gender_male', icon: '♂' },
    { key: 'female', labelKey: 'gender_female', icon: '♀' },
    { key: 'other', labelKey: 'gender_other', icon: '•' },
  ];

  return (
    <View style={[styles.root, { backgroundColor: palette.bgPrimary }]}>
      <LinearGradient colors={palette.bgGradient} style={StyleSheet.absoluteFill} />
      <Bubbles color={`${palette.primary}80`} />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.dots}>
              {STEPS.map((s, i) => (
                <View key={s} style={[styles.dot, { backgroundColor: palette.border }, STEPS.indexOf(step) >= i && { backgroundColor: palette.primary }]} />
              ))}
            </View>

            {step === 'welcome' && (
              <View style={styles.stepContainer}>
                <View style={[styles.iconBubble, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}>
                  <Waves color={palette.primary} size={56} strokeWidth={1.6} />
                </View>
                <Text style={[styles.title, { color: palette.textPrimary }]}>{t('welcome_title')}</Text>
                <Text style={[styles.subtitle, { color: palette.textSecondary }]}>{t('welcome_sub')}</Text>
              </View>
            )}

            {step === 'language' && (
              <View style={styles.stepContainer}>
                <Globe color={palette.primary} size={48} strokeWidth={1.6} />
                <Text style={[styles.title, { color: palette.textPrimary }]}>{t('lang_title')}</Text>
                <Text style={[styles.subtitle, { color: palette.textSecondary }]}>{t('lang_sub')}</Text>
                <ScrollView style={{ maxHeight: 380, width: '100%' }} contentContainerStyle={styles.countryList} showsVerticalScrollIndicator={false}>
                  {LANGUAGES.map((l) => (
                    <TouchableOpacity
                      key={l.code}
                      testID={`lang-${l.code}`}
                      style={[styles.langRow, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }, lang === l.code && { borderColor: palette.primary, backgroundColor: `${palette.primary}22` }]}
                      onPress={() => setLang(l.code)}
                    >
                      <Text style={{ fontSize: 22 }}>{l.flag}</Text>
                      <Text style={[styles.countryName, { color: palette.textPrimary }]}>{l.label}</Text>
                      {lang === l.code && <View style={[styles.checkDot, { backgroundColor: palette.primary }]} />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {step === 'country' && (
              <View style={styles.stepContainer}>
                <MapPin color={palette.primary} size={48} strokeWidth={1.6} />
                <Text style={[styles.title, { color: palette.textPrimary }]}>{t('country_title')}</Text>
                <Text style={[styles.subtitle, { color: palette.textSecondary }]}>{t('country_sub')}</Text>
                <ScrollView style={{ maxHeight: 360, width: '100%' }} contentContainerStyle={styles.countryList}>
                  {COUNTRIES.map((c) => (
                    <TouchableOpacity
                      key={c.code}
                      testID={`country-${c.code}`}
                      style={[styles.countryRow, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }, country === c.code && { borderColor: palette.primary }]}
                      onPress={() => setCountry(c.code)}
                    >
                      <Text style={{ fontSize: 22 }}>{c.flag}</Text>
                      <Text style={[styles.countryName, { color: palette.textPrimary }]} numberOfLines={1}>{lang === 'tr' ? c.nameTr : c.nameEn}</Text>
                      {c.climateBoostMl > 0 && (
                        <Text style={{ color: palette.accentCoral, fontSize: 11, fontWeight: '700' }}>+{c.climateBoostMl}ml</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {step === 'gender' && (
              <View style={styles.stepContainer}>
                <User color={palette.primary} size={48} strokeWidth={1.6} />
                <Text style={[styles.title, { color: palette.textPrimary }]}>{t('gender_title')}</Text>
                <Text style={[styles.subtitle, { color: palette.textSecondary }]}>{t('gender_sub')}</Text>
                <View style={{ width: '100%', gap: 10, marginTop: 14 }}>
                  {GENDERS.map((g) => (
                    <TouchableOpacity
                      key={g.key}
                      testID={`gender-${g.key}`}
                      onPress={() => setGender(g.key)}
                      style={[styles.choiceRow, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }, gender === g.key && { borderColor: palette.primary, backgroundColor: `${palette.primary}22` }]}
                    >
                      <Text style={{ fontSize: 22, color: palette.primary, width: 28, textAlign: 'center' }}>{g.icon}</Text>
                      <Text style={{ color: palette.textPrimary, fontSize: 15, fontWeight: '700', flex: 1 }}>{t(g.labelKey)}</Text>
                      {gender === g.key && <View style={[styles.checkDot, { backgroundColor: palette.primary }]} />}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {step === 'age' && (
              <View style={styles.stepContainer}>
                <Calendar color={palette.primary} size={48} strokeWidth={1.6} />
                <Text style={[styles.title, { color: palette.textPrimary }]}>{t('age_title')}</Text>
                <Text style={[styles.subtitle, { color: palette.textSecondary }]}>{t('age_sub')}</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    testID="onboarding-age-input"
                    style={[styles.input, { backgroundColor: palette.glassBg, borderColor: palette.borderLight, color: palette.textPrimary }]}
                    value={age} onChangeText={setAge} keyboardType="numeric" maxLength={3}
                    placeholderTextColor={palette.textMuted}
                  />
                </View>
              </View>
            )}

            {step === 'height' && (
              <View style={styles.stepContainer}>
                <Ruler color={palette.primary} size={48} strokeWidth={1.6} />
                <Text style={[styles.title, { color: palette.textPrimary }]}>{t('height_title')}</Text>
                <Text style={[styles.subtitle, { color: palette.textSecondary }]}>{t('height_sub')}</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    testID="onboarding-height-input"
                    style={[styles.input, { backgroundColor: palette.glassBg, borderColor: palette.borderLight, color: palette.textPrimary }]}
                    value={heightCm} onChangeText={setHeightCm} keyboardType="numeric" maxLength={3}
                    placeholderTextColor={palette.textMuted}
                  />
                  <Text style={[styles.unit, { color: palette.textSecondary }]}>cm</Text>
                </View>
              </View>
            )}

            {step === 'weight' && (
              <View style={styles.stepContainer}>
                <Droplet color={palette.primary} size={48} strokeWidth={1.6} />
                <Text style={[styles.title, { color: palette.textPrimary }]}>{t('weight_title')}</Text>
                <Text style={[styles.subtitle, { color: palette.textSecondary }]}>{t('weight_sub')}</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    testID="onboarding-weight-input"
                    style={[styles.input, { backgroundColor: palette.glassBg, borderColor: palette.borderLight, color: palette.textPrimary }]}
                    value={weight} onChangeText={setWeight} keyboardType="numeric" maxLength={4}
                    placeholderTextColor={palette.textMuted}
                  />
                  <Text style={[styles.unit, { color: palette.textSecondary }]}>kg</Text>
                </View>
              </View>
            )}

            {step === 'goal' && (
              <View style={styles.stepContainer}>
                <Target color={palette.primary} size={48} strokeWidth={1.6} />
                <Text style={[styles.title, { color: palette.textPrimary }]}>{t('goal_title')}</Text>
                <Text style={[styles.subtitle, { color: palette.textSecondary }]}>{t('suggested')}: {suggested} ml</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    testID="onboarding-goal-input"
                    style={[styles.input, { backgroundColor: palette.glassBg, borderColor: palette.borderLight, color: palette.textPrimary }]}
                    value={goal} onChangeText={setGoal} keyboardType="numeric" maxLength={5}
                    placeholderTextColor={palette.textMuted}
                  />
                  <Text style={[styles.unit, { color: palette.textSecondary }]}>ml</Text>
                </View>
              </View>
            )}

            {step === 'schedule' && (
              <View style={styles.stepContainer}>
                <Waves color={palette.primary} size={48} strokeWidth={1.6} />
                <Text style={[styles.title, { color: palette.textPrimary }]}>{t('schedule_title')}</Text>
                <Text style={[styles.subtitle, { color: palette.textSecondary }]}>{t('schedule_sub')}</Text>
                <View style={styles.timeRow}>
                  <View style={styles.timeBlock}>
                    <Text style={[styles.label, { color: palette.textSecondary }]}>{t('wake')}</Text>
                    <TextInput
                      testID="onboarding-wake-input"
                      style={[styles.timeInput, { backgroundColor: palette.glassBg, borderColor: palette.borderLight, color: palette.textPrimary }]}
                      value={wakeTime} onChangeText={setWakeTime} placeholderTextColor={palette.textMuted}
                    />
                  </View>
                  <View style={styles.timeBlock}>
                    <Text style={[styles.label, { color: palette.textSecondary }]}>{t('sleep')}</Text>
                    <TextInput
                      testID="onboarding-sleep-input"
                      style={[styles.timeInput, { backgroundColor: palette.glassBg, borderColor: palette.borderLight, color: palette.textPrimary }]}
                      value={sleepTime} onChangeText={setSleepTime} placeholderTextColor={palette.textMuted}
                    />
                  </View>
                </View>
              </View>
            )}

            {step === 'notifications' && (
              <View style={styles.stepContainer}>
                <Bell color={palette.primary} size={48} strokeWidth={1.6} />
                <Text style={[styles.title, { color: palette.textPrimary }]}>{t('reminders_title')}</Text>
                <Text style={[styles.subtitle, { color: palette.textSecondary }]}>{t('reminders_sub')}</Text>
                <View style={styles.intervalRow}>
                  {[60, 90, 120, 180].map((m) => (
                    <TouchableOpacity
                      key={m} testID={`interval-${m}`}
                      style={[styles.intervalChip, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }, parseInt(interval) === m && { backgroundColor: palette.primary, borderColor: palette.primary }]}
                      onPress={() => setIntervalMin(String(m))}
                    >
                      <Text style={[{ color: palette.textSecondary, fontWeight: '600' }, parseInt(interval) === m && { color: palette.onPrimary, fontWeight: '700' }]}>
                        {m < 60 ? `${m}dk` : `${m / 60}sa`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  testID="toggle-notifications"
                  style={[styles.toggleRow, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }, notifEnabled && { borderColor: palette.primary }]}
                  onPress={() => setNotifEnabled(!notifEnabled)}
                >
                  <Bell color={notifEnabled ? palette.primary : palette.textSecondary} size={20} />
                  <Text style={{ color: palette.textPrimary, fontSize: 15, fontWeight: '600' }}>
                    {notifEnabled ? t('notifications_on') : t('notifications_off')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity testID="onboarding-next-btn" activeOpacity={0.85} onPress={goNext} style={{ marginTop: 24, marginBottom: 12 }}>
              <LinearGradient colors={palette.primaryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaGrad}>
                <Text style={[styles.ctaText, { color: palette.onPrimary }]}>{isLast ? t('start') : t('continue')}</Text>
                <ChevronRight color={palette.onPrimary} size={20} />
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'space-between' },
  dots: { flexDirection: 'row', gap: 4, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' },
  dot: { width: 18, height: 4, borderRadius: 2 },
  stepContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 24, gap: 12 },
  iconBubble: { width: 120, height: 120, borderRadius: 60, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 21, paddingHorizontal: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  input: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 24, paddingVertical: 14, fontSize: 30, fontWeight: '700', minWidth: 140, textAlign: 'center' },
  unit: { fontSize: 22, fontWeight: '600' },
  timeRow: { flexDirection: 'row', gap: 14, marginTop: 16, width: '100%' },
  timeBlock: { flex: 1, alignItems: 'center' },
  label: { marginBottom: 6, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  timeInput: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 12, fontSize: 24, fontWeight: '700', width: '100%', textAlign: 'center' },
  intervalRow: { flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' },
  intervalChip: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 999, borderWidth: 1 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999, borderWidth: 1, marginTop: 14 },
  ctaGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 16, borderRadius: 999 },
  ctaText: { fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  countryList: { gap: 6, paddingVertical: 10 },
  countryRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, borderWidth: 1 },
  countryName: { flex: 1, fontWeight: '600', fontSize: 14 },
  langRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14, borderRadius: 14, borderWidth: 1 },
  choiceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 16, borderRadius: 16, borderWidth: 1 },
  checkDot: { width: 12, height: 12, borderRadius: 6 },
});
