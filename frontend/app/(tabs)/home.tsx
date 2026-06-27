import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Pressable, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Droplet, Coffee, CupSoda, Plus, GlassWater, Milk, Trash2, Flame, X, Check, Quote, Activity, Wind } from 'lucide-react-native';
import { useApp } from '../../src/AppContext';
import { todayKey, totalHydrationForDay, totalAmountForDay, entriesForDay } from '../../src/storage';
import { DRINK_HYDRATION, DrinkType } from '../../src/types';
import WaterWave from '../../src/components/WaterWave';
import Bubbles from '../../src/components/Bubbles';
import SplashRing from '../../src/components/SplashRing';
import AquaMascot, { pickMood, moodEmoji } from '../../src/components/AquaMascot';
import WaterMeditationModal from '../../src/components/WaterMeditationModal';
import { getQuoteForDay } from '../../src/quotes';
import { playWaterDrop, celebrateGoal } from '../../src/sound';
import { useRouter } from 'expo-router';

const { height: SCREEN_H } = Dimensions.get('window');
const ICON_MAP: Record<string, any> = { Droplet, Coffee, CupSoda, GlassWater, Milk };

export default function HomeScreen() {
  const { state, palette, t, addDrink, removeEntry } = useApp();
  const router = useRouter();
  const [customOpen, setCustomOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('300');
  const [customType, setCustomType] = useState<DrinkType>('water');
  const [splashTick, setSplashTick] = useState(0);
  const [meditationOpen, setMeditationOpen] = useState(false);
  const [drinkToast, setDrinkToast] = useState<string | null>(null);

  const today = todayKey();
  const hydration = totalHydrationForDay(state.entries, today);
  const totalAmount = totalAmountForDay(state.entries, today);
  const goal = state.settings.dailyGoalMl;
  const progress = Math.min(1, hydration / goal);
  const percent = Math.round(progress * 100);
  const remaining = Math.max(0, goal - hydration);

  const todayEntries = useMemo(
    () => entriesForDay(state.entries, today).slice().reverse(),
    [state.entries, today]
  );
  const quote = useMemo(() => getQuoteForDay(state.settings.language), [state.settings.language]);
  const streakCount = state.streakDays.length;

  // Minutes since the user's last drink today (used by mascot mood)
  const lastDrinkMinutesAgo = useMemo(() => {
    const todays = entriesForDay(state.entries, today);
    if (todays.length === 0) return 999;
    const latest = todays.reduce((max, e) => (e.timestamp > max ? e.timestamp : max), 0);
    return Math.floor((Date.now() - latest) / 60000);
  }, [state.entries, today]);

  const onAdd = async (cup: { amount: number; type: DrinkType; cupName?: string }) => {
    playWaterDrop(state.settings.soundEnabled);
    setSplashTick((v) => v + 1);
    const res = await addDrink({
      amount: cup.amount,
      type: cup.type,
      hydration: DRINK_HYDRATION[cup.type],
      cupName: cup.cupName,
    });
    if (res.goalMet) {
      celebrateGoal(state.settings.soundEnabled);
      // Engagement: track goal hit, maybe prompt rate after 2nd goal hit
      try {
        const { trackGoalHit, maybePromptRate } = await import('../../src/engagement');
        await trackGoalHit();
        // Small delay so the celebration sound plays first
        setTimeout(() => { maybePromptRate().catch(() => {}); }, 1800);
      } catch {}
    }
    if (res.goalIncreased) {
      Alert.alert(t('goal_increased'), t('goal_increased_body', { goal: res.goalIncreased }));
    }
    // Premium feedback: floating toast describing where the water goes
    const isTr = state.settings.language === 'tr';
    const msgs = isTr
      ? ['💧 Beynine ve kalbine gidiyor…', '🌊 Böbreklerin teşekkür ediyor', '🫧 Kasların ferahlıyor', '✨ Cildin canlanıyor']
      : ['💧 Heading to your brain & heart…', '🌊 Your kidneys say thanks', '🫧 Muscles refreshing', '✨ Your skin glows'];
    setDrinkToast(msgs[Math.floor(Math.random() * msgs.length)]);
    setTimeout(() => setDrinkToast(null), 2400);
  };

  const onCustomAdd = async () => {
    const amt = parseInt(customAmount);
    if (!amt || amt <= 0) return;
    await onAdd({ amount: amt, type: customType });
    setCustomOpen(false);
  };

  const dateStr = new Date().toLocaleDateString(state.settings.language === 'tr' ? 'tr-TR' : state.settings.language, {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <View style={[styles.root, { backgroundColor: palette.bgPrimary }]}>
      <LinearGradient colors={palette.bgGradient} style={StyleSheet.absoluteFill} />
      <WaterWave progress={progress} height={SCREEN_H} colorTop={palette.waterLight} colorMid={palette.waterMid} colorDeep={palette.waterDeep} />
      <Bubbles color={`${palette.primary}80`} />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: palette.overlay }]} pointerEvents="none" />
      <SplashRing trigger={splashTick} color={palette.primary} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.greeting, { color: palette.textPrimary }]}>{t('hello')} 🌊</Text>
              <Text style={[styles.date, { color: palette.textSecondary }]}>{dateStr}</Text>
            </View>
            <View style={[styles.streakPill, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]} testID="streak-pill">
              <Flame color={palette.accentCoral} size={16} fill={palette.accentCoral} />
              <Text style={[styles.streakText, { color: palette.textPrimary }]}>{streakCount} {t('streak_days')}</Text>
            </View>
          </View>

          <View style={styles.progressBlock}>
            <View style={{ marginBottom: 6 }}>
              <AquaMascot
                mood={pickMood(percent, lastDrinkMinutesAgo)}
                primary={palette.primary}
                size={150}
              />
            </View>
            <Text style={[styles.percent, { color: palette.textPrimary }]} testID="daily-percent">{percent}%</Text>
            <Text style={styles.amounts} testID="daily-amounts">
              <Text style={[styles.amountsBig, { color: palette.textPrimary }]}>{hydration}</Text>
              <Text style={[styles.amountsSep, { color: palette.textSecondary }]}> / {goal} ml</Text>
            </Text>
            <Text style={[styles.remaining, { color: palette.primary }]}>
              {remaining > 0 ? `${remaining} ${t('remaining')}` : `${t('goal_reached')} 🪸`}
            </Text>
          </View>

          {/* Motivational quote */}
          <View style={[styles.quoteCard, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}>
            <Quote color={palette.primary} size={18} strokeWidth={2} />
            <Text style={[styles.quoteText, { color: palette.textPrimary }]}>{quote}</Text>
          </View>

          {/* Discover row: Body Map + Meditation */}
          <View style={styles.discoverRow}>
            <TouchableOpacity
              testID="open-body-map"
              activeOpacity={0.85}
              onPress={() => router.push('/body-map')}
              style={[styles.discoverCard, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}
            >
              <View style={[styles.discoverIcon, { backgroundColor: `${palette.primary}22` }]}>
                <Activity color={palette.primary} size={22} strokeWidth={2} />
              </View>
              <Text style={[styles.discoverTitle, { color: palette.textPrimary }]} numberOfLines={1}>
                {state.settings.language === 'tr' ? 'Vücut Haritası' : 'Body Map'}
              </Text>
              <Text style={[styles.discoverSub, { color: palette.textSecondary }]} numberOfLines={2}>
                {state.settings.language === 'tr' ? 'Organlarındaki su seviyesi' : 'Water level in your organs'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="open-meditation"
              activeOpacity={0.85}
              onPress={() => setMeditationOpen(true)}
              style={[styles.discoverCard, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}
            >
              <View style={[styles.discoverIcon, { backgroundColor: `${palette.primary}22` }]}>
                <Wind color={palette.primary} size={22} strokeWidth={2} />
              </View>
              <Text style={[styles.discoverTitle, { color: palette.textPrimary }]} numberOfLines={1}>
                {state.settings.language === 'tr' ? 'Su Nefesi' : 'Water Breath'}
              </Text>
              <Text style={[styles.discoverSub, { color: palette.textSecondary }]} numberOfLines={2}>
                {state.settings.language === 'tr' ? '30 saniyelik sakin anlar' : '30s of calm breathing'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Family discover card — full width */}
          <TouchableOpacity
            testID="open-family"
            activeOpacity={0.85}
            onPress={() => router.push('/family')}
            style={[styles.familyDiscoverCard, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}
          >
            <View style={[styles.discoverIcon, { backgroundColor: `${palette.primary}22` }]}>
              <Activity color={palette.primary} size={22} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.discoverTitle, { color: palette.textPrimary, marginTop: 0 }]} numberOfLines={1}>
                {state.settings.language === 'tr' ? '👨‍👩‍👧 Aile Modu' : '👨‍👩‍👧 Family Mode'}
              </Text>
              <Text style={[styles.discoverSub, { color: palette.textSecondary }]} numberOfLines={2}>
                {state.settings.language === 'tr' ? 'Sevdiklerinle birlikte hedefe ulaş — tamamen ücretsiz' : 'Reach the goal together — fully free'}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={[styles.quickAddBar, { backgroundColor: palette.glassBgLight, borderColor: palette.borderLight }]}>
            <QuickButton palette={palette} testID="add-water-250" icon={<Droplet color={palette.primary} size={26} strokeWidth={2} />} label={t('water')} amount={250} onPress={() => onAdd({ amount: 250, type: 'water' })} />
            <QuickButton palette={palette} testID="add-water-500" icon={<GlassWater color={palette.primary} size={26} strokeWidth={2} />} label={t('cup')} amount={500} onPress={() => onAdd({ amount: 500, type: 'water' })} />
            <QuickButton palette={palette} testID="add-tea" icon={<CupSoda color={palette.accentPlant} size={26} strokeWidth={2} />} label={t('tea')} amount={200} onPress={() => onAdd({ amount: 200, type: 'tea' })} />
            <QuickButton palette={palette} testID="add-coffee" icon={<Coffee color="#C68F65" size={26} strokeWidth={2} />} label={t('coffee')} amount={180} onPress={() => onAdd({ amount: 180, type: 'coffee' })} />
            <QuickButton palette={palette} testID="add-custom" icon={<Plus color={palette.textPrimary} size={26} strokeWidth={2.5} />} label={t('custom')} onPress={() => setCustomOpen(true)} />
          </View>

          {state.customCups.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>{t('your_cups')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
                {state.customCups.map((cup) => {
                  const Icon = ICON_MAP[cup.icon] || Droplet;
                  return (
                    <TouchableOpacity
                      key={cup.id} testID={`cup-${cup.id}`}
                      style={[styles.cupCard, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}
                      onPress={() => onAdd({ amount: cup.amount, type: cup.type, cupName: cup.name })}
                      activeOpacity={0.8}
                    >
                      <Icon color={palette.primary} size={22} strokeWidth={1.8} />
                      <Text style={[styles.cupName, { color: palette.textPrimary }]} numberOfLines={1}>{cup.nameKey ? t(cup.nameKey) : cup.name}</Text>
                      <Text style={[styles.cupAmount, { color: palette.textSecondary }]}>{cup.amount} ml</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>{t('today_flow')}</Text>
            {todayEntries.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}>
                <Text style={{ color: palette.textSecondary, fontSize: 14 }}>{t('no_entries')} 💧</Text>
              </View>
            ) : (
              todayEntries.map((e) => {
                const time = new Date(e.timestamp).toLocaleTimeString(state.settings.language === 'tr' ? 'tr-TR' : state.settings.language, { hour: '2-digit', minute: '2-digit' });
                const Icon = e.type === 'coffee' ? Coffee : e.type === 'tea' ? CupSoda : Droplet;
                const tint = e.type === 'coffee' ? '#C68F65' : e.type === 'tea' ? palette.accentPlant : palette.primary;
                return (
                  <View key={e.id} style={[styles.logRow, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}>
                    <View style={[styles.logIcon, { borderColor: tint }]}>
                      <Icon color={tint} size={20} strokeWidth={1.8} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: palette.textPrimary, fontSize: 14, fontWeight: '600' }}>{e.cupName || labelOf(t, e.type)} • {e.amount} ml</Text>
                      <Text style={{ color: palette.textSecondary, fontSize: 12, marginTop: 2 }}>+{e.hydration} ml {t('hydration')} · {time}</Text>
                    </View>
                    <TouchableOpacity testID={`remove-${e.id}`} onPress={() => removeEntry(e.id)} style={{ padding: 8 }}>
                      <Trash2 color={palette.textMuted} size={18} />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>

          <Text style={[styles.footerStat, { color: palette.textSecondary }]} testID="total-amount">
            {t('total_today', { amount: totalAmount })}
          </Text>
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Premium toast after drink add */}
      {drinkToast && (
        <View pointerEvents="none" style={styles.toastWrap}>
          <View style={[styles.toast, { backgroundColor: palette.glassBg, borderColor: palette.primary }]}>
            <Text style={[styles.toastText, { color: palette.textPrimary }]}>{drinkToast}</Text>
          </View>
        </View>
      )}

      <Modal visible={customOpen} animationType="fade" transparent onRequestClose={() => setCustomOpen(false)}>
        <Pressable style={styles.modalRoot} onPress={() => setCustomOpen(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: palette.bgCard, borderColor: palette.borderLight }]} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>{t('custom_amount')}</Text>
              <TouchableOpacity onPress={() => setCustomOpen(false)}>
                <X color={palette.textSecondary} size={22} />
              </TouchableOpacity>
            </View>
            <View style={styles.typeRow}>
              {(['water', 'tea', 'coffee', 'juice'] as DrinkType[]).map((tp) => (
                <TouchableOpacity
                  key={tp} testID={`type-${tp}`}
                  style={[styles.typeChip, { borderColor: palette.borderLight }, customType === tp ? { backgroundColor: palette.primary, borderColor: palette.primary } : { backgroundColor: 'rgba(255,255,255,0.05)' }]}
                  onPress={() => setCustomType(tp)}
                >
                  <Text style={{ color: customType === tp ? palette.onPrimary : palette.textSecondary, fontWeight: '600' }}>{labelOf(t, tp)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalInputRow}>
              <TextInput
                testID="custom-amount-input"
                style={[styles.modalInput, { borderColor: palette.borderLight, color: palette.textPrimary }]}
                value={customAmount} onChangeText={setCustomAmount} keyboardType="numeric"
              />
              <Text style={{ color: palette.textSecondary, fontSize: 18, fontWeight: '600' }}>ml</Text>
            </View>
            <View style={styles.presetRow}>
              {[100, 150, 200, 300, 500, 750].map((p) => (
                <TouchableOpacity key={p} style={[styles.preset, { borderColor: palette.borderLight }]} onPress={() => setCustomAmount(String(p))}>
                  <Text style={{ color: palette.textPrimary, fontWeight: '600' }}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity testID="custom-confirm" onPress={onCustomAdd} activeOpacity={0.85}>
              <LinearGradient colors={palette.primaryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.confirmBtn}>
                <Check color={palette.onPrimary} size={20} strokeWidth={3} />
                <Text style={{ color: palette.onPrimary, fontSize: 16, fontWeight: '800' }}>{t('add')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Water Meditation */}
      <WaterMeditationModal
        visible={meditationOpen}
        onClose={() => setMeditationOpen(false)}
        primary={palette.primary}
        primaryGradient={palette.primaryGradient}
        bg={palette.bgPrimary}
        textPrimary={palette.textPrimary}
        textSecondary={palette.textSecondary}
        borderLight={palette.borderLight}
        glassBg={palette.glassBg}
        language={state.settings.language}
      />
    </View>
  );
}

function QuickButton({ icon, label, amount, onPress, testID, palette }: any) {
  return (
    <TouchableOpacity testID={testID} style={styles.quickBtn} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.quickIconWrap, { borderColor: palette.borderLight }]}>{icon}</View>
      <Text style={{ color: palette.textPrimary, fontSize: 12, fontWeight: '600', marginTop: 4 }}>{label}</Text>
      {amount !== undefined && <Text style={{ color: palette.textMuted, fontSize: 10, fontWeight: '500' }}>{amount}ml</Text>}
    </TouchableOpacity>
  );
}

function labelOf(t: (k: string) => string, tp: DrinkType): string {
  if (tp === 'water') return t('water');
  if (tp === 'tea') return t('tea');
  if (tp === 'coffee') return t('coffee');
  if (tp === 'juice') return t('juice');
  return t('custom');
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  greeting: { fontSize: 22, fontWeight: '700' },
  date: { fontSize: 13, marginTop: 2, textTransform: 'capitalize' },
  streakPill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  streakText: { fontWeight: '700', fontSize: 13 },
  progressBlock: { alignItems: 'center', marginVertical: 20 },
  percent: { fontSize: 72, fontWeight: '900', letterSpacing: -2 },
  moodChip: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  amounts: { marginTop: -6 },
  amountsBig: { fontSize: 22, fontWeight: '800' },
  amountsSep: { fontSize: 17, fontWeight: '500' },
  remaining: { fontSize: 14, marginTop: 6, fontWeight: '600' },
  quoteCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 14 },
  quoteText: { flex: 1, fontSize: 13, lineHeight: 18, fontStyle: 'italic' },
  discoverRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  discoverCard: { flex: 1, padding: 14, borderRadius: 18, borderWidth: 1, gap: 6 },
  discoverIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  discoverTitle: { fontSize: 14, fontWeight: '800', marginTop: 4 },
  discoverSub: { fontSize: 11, lineHeight: 15 },
  familyDiscoverCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 18, borderWidth: 1, marginBottom: 14 },
  toastWrap: { position: 'absolute', top: 60, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  toast: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, borderWidth: 1.5 },
  toastText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },
  quickAddBar: { flexDirection: 'row', justifyContent: 'space-between', gap: 6, paddingVertical: 14, paddingHorizontal: 6, borderWidth: 1, borderRadius: 24, marginBottom: 16 },
  quickBtn: { alignItems: 'center', flex: 1, gap: 4 },
  quickIconWrap: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255, 255, 255, 0.06)', borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  section: { marginTop: 12, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  cupCard: { width: 110, padding: 14, borderWidth: 1, borderRadius: 16, gap: 4 },
  cupName: { fontWeight: '600', fontSize: 14, marginTop: 4 },
  cupAmount: { fontSize: 12 },
  emptyCard: { borderWidth: 1, borderRadius: 16, padding: 20, alignItems: 'center' },
  logRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 8, gap: 12 },
  logIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  footerStat: { textAlign: 'center', fontSize: 13, marginTop: 12 },
  modalRoot: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, gap: 14, borderTopWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '800' },
  typeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  modalInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 4 },
  modalInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderRadius: 16, padding: 14, fontSize: 26, fontWeight: '800', minWidth: 140, textAlign: 'center' },
  presetRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  preset: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 999, borderWidth: 1 },
  confirmBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 16, borderRadius: 999, marginTop: 6 },
});
