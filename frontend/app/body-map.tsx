import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Brain, Heart, Wind, Activity, Droplet, Bone, User } from 'lucide-react-native';
import { useApp } from '../src/AppContext';
import { todayKey, totalHydrationForDay } from '../src/storage';
import BodySilhouette from '../src/components/BodySilhouette';
import Bubbles from '../src/components/Bubbles';

const { width: SCREEN_W } = Dimensions.get('window');

type OrganKey = 'brain' | 'heart' | 'lungs' | 'kidneys' | 'muscles' | 'skin' | 'blood' | 'bones';

// Anatomical water percentages (medical references averaged)
const ORGAN_WATER: Record<OrganKey, number> = {
  blood: 92, lungs: 83, kidneys: 79, muscles: 79, brain: 73, heart: 73, skin: 64, bones: 31,
};

const ORGAN_ICONS: Record<OrganKey, any> = {
  brain: Brain, heart: Heart, lungs: Wind, kidneys: Droplet, muscles: Activity, skin: User, blood: Droplet, bones: Bone,
};

// Local translations (kept in-file to avoid expanding i18n.ts for one screen).
const LOCAL: Record<string, Record<string, string>> = {
  tr: {
    title: 'Vücut Su Haritası', sub: 'Bedeninin sıvı dengesini gör',
    cur_lvl: 'Anlık seviye', tip_low: 'Vücudun susuzluk sinyali veriyor. Bir bardak su iyi gelir.',
    tip_mid: 'Güzel gidiyorsun. Düzenli içmeye devam et.', tip_high: 'Mükemmel hidrasyon. Bedenin teşekkür ediyor.',
    organ_brain: 'Beyin', organ_heart: 'Kalp', organ_lungs: 'Akciğer', organ_kidneys: 'Böbrek',
    organ_muscles: 'Kas', organ_skin: 'Cilt', organ_blood: 'Kan', organ_bones: 'Kemik',
    fact_brain: 'Az su konsantrasyonu ve odağı düşürür.',
    fact_heart: 'Kalp ritmi sıvı dengesine bağlıdır.',
    fact_lungs: 'Solunum su buharı yoluyla nem kaybı yaratır.',
    fact_kidneys: 'Toksinlerin atılması bol suya ihtiyaç duyar.',
    fact_muscles: '%2 sıvı kaybı dahi performansı düşürür.',
    fact_skin: 'Su, cildin elastikiyetini korur.',
    fact_blood: 'Kan plazmasının çoğu sudur.',
    fact_bones: 'Kemiklerin esnekliği için bile su gerekir.',
  },
  en: {
    title: 'Body Water Map', sub: 'See your body fluid balance',
    cur_lvl: 'Current level', tip_low: 'Your body needs water. A glass would help.',
    tip_mid: 'Doing well. Keep sipping regularly.', tip_high: 'Excellent hydration. Your body thanks you.',
    organ_brain: 'Brain', organ_heart: 'Heart', organ_lungs: 'Lungs', organ_kidneys: 'Kidneys',
    organ_muscles: 'Muscles', organ_skin: 'Skin', organ_blood: 'Blood', organ_bones: 'Bones',
    fact_brain: 'Low water reduces concentration and focus.',
    fact_heart: 'Heart rhythm depends on fluid balance.',
    fact_lungs: 'Breathing causes constant moisture loss.',
    fact_kidneys: 'Toxin removal requires plenty of water.',
    fact_muscles: 'Even 2% loss reduces performance.',
    fact_skin: 'Water maintains skin elasticity.',
    fact_blood: 'Most of blood plasma is water.',
    fact_bones: 'Bones need water for flexibility.',
  },
};

function tx(lang: string, key: string): string {
  return (LOCAL[lang] && LOCAL[lang][key]) || LOCAL.en[key] || key;
}

export default function BodyMapScreen() {
  const router = useRouter();
  const { state, palette } = useApp();
  const lang = state.settings.language;
  const today = todayKey();
  const hydration = totalHydrationForDay(state.entries, today);
  const goal = state.settings.dailyGoalMl;
  const progress = Math.min(1, hydration / goal);

  const [active, setActive] = useState<OrganKey | null>(null);

  // Auto-pulse the silhouette if user just drank in last 8 seconds.
  const lastDrinkAt = useMemo(() => {
    if (!state.entries || state.entries.length === 0) return 0;
    return state.entries.reduce((mx, e) => (e.timestamp > mx ? e.timestamp : mx), 0);
  }, [state.entries]);

  const justDrank = Date.now() - lastDrinkAt < 8000;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!justDrank) return;
    pulse.setValue(0.85);
    const seq = Animated.sequence([
      Animated.timing(pulse, { toValue: 1.08, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1.0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1.05, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1.0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]);
    seq.start();
    return () => seq.stop();
  }, [lastDrinkAt, pulse, justDrank]);

  const tip = useMemo(() => {
    if (progress < 0.4) return tx(lang, 'tip_low');
    if (progress < 0.85) return tx(lang, 'tip_mid');
    return tx(lang, 'tip_high');
  }, [progress, lang]);

  const ORGANS: OrganKey[] = ['blood', 'lungs', 'kidneys', 'muscles', 'brain', 'heart', 'skin', 'bones'];

  return (
    <View style={[styles.root, { backgroundColor: palette.bgPrimary }]}>
      <LinearGradient colors={palette.bgGradient} style={StyleSheet.absoluteFill} />
      <Bubbles color={`${palette.primary}55`} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            testID="body-map-back"
            onPress={() => { try { router.back(); } catch { router.replace('/(tabs)/home'); } }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={[styles.iconBtn, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}
          >
            <ArrowLeft color={palette.textPrimary} size={20} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: palette.textPrimary }]}>{tx(lang, 'title')}</Text>
            <Text style={[styles.sub, { color: palette.textSecondary }]}>{tx(lang, 'sub')}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Silhouette */}
          <View style={{ alignItems: 'center', marginTop: 6 }}>
            <Animated.View style={{ transform: [{ scale: pulse }] }}>
              <BodySilhouette
                width={Math.min(SCREEN_W * 0.65, 260)}
                height={Math.min(SCREEN_W * 1.2, 460)}
                hydration={progress}
                primary={palette.primary}
                waterMid={palette.waterMid}
                waterDeep={palette.waterDeep}
                outline={palette.borderLight}
                highlight={active}
              />
            </Animated.View>
            {justDrank && (
              <Text style={{ color: palette.primary, fontSize: 12, fontWeight: '700', marginTop: 4, letterSpacing: 0.5 }}>
                {lang === 'tr' ? '💧 Az önce içtin — su dağılıyor' : '💧 Just drank — water is spreading'}
              </Text>
            )}
          </View>

          {/* Current % pill */}
          <View style={[styles.pill, { backgroundColor: palette.glassBg, borderColor: palette.primary }]}>
            <Droplet color={palette.primary} size={18} fill={palette.primary} />
            <Text style={[styles.pillTitle, { color: palette.textSecondary }]}>{tx(lang, 'cur_lvl')}</Text>
            <Text style={[styles.pillValue, { color: palette.textPrimary }]}>{Math.round(progress * 100)}%</Text>
          </View>

          {/* Tip */}
          <View style={[styles.tipCard, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}>
            <Text style={[styles.tipText, { color: palette.textPrimary }]}>{tip}</Text>
          </View>

          {/* Organ grid */}
          <View style={styles.grid}>
            {ORGANS.map((k) => {
              const Icon = ORGAN_ICONS[k];
              const selected = active === k;
              const water = ORGAN_WATER[k];
              // Per-organ "filled" level — keep it interesting: blood/lungs/kidneys/muscles influenced more strongly by current hydration
              const orgScore = Math.round(progress * water);
              return (
                <TouchableOpacity
                  key={k}
                  testID={`organ-${k}`}
                  activeOpacity={0.85}
                  onPress={() => setActive(selected ? null : k)}
                  style={[
                    styles.organCard,
                    { backgroundColor: palette.glassBg, borderColor: palette.borderLight },
                    selected && { borderColor: palette.primary, backgroundColor: `${palette.primary}22` },
                  ]}
                >
                  <View style={[styles.organIconWrap, { backgroundColor: `${palette.primary}22` }]}>
                    <Icon color={palette.primary} size={20} strokeWidth={2} />
                  </View>
                  <Text style={[styles.organName, { color: palette.textPrimary }]} numberOfLines={1}>
                    {tx(lang, `organ_${k}`)}
                  </Text>
                  <Text style={[styles.organPct, { color: palette.primary }]}>{water}%</Text>
                  <View style={[styles.bar, { backgroundColor: palette.borderLight }]}>
                    <View style={{ height: '100%', width: `${(orgScore / water) * 100}%`, backgroundColor: palette.primary, borderRadius: 4 }} />
                  </View>
                  {selected && (
                    <Text style={[styles.organFact, { color: palette.textSecondary }]}>
                      {tx(lang, `fact_${k}`)}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, gap: 12 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  sub: { fontSize: 12, marginTop: 2 },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  pill: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, borderWidth: 1, marginTop: 6 },
  pillTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase' },
  pillValue: { fontSize: 16, fontWeight: '800' },
  tipCard: { marginTop: 14, padding: 16, borderRadius: 18, borderWidth: 1 },
  tipText: { fontSize: 14, lineHeight: 22, fontWeight: '500', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16, justifyContent: 'space-between' },
  organCard: { width: '48%', padding: 14, borderRadius: 18, borderWidth: 1, gap: 6 },
  organIconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  organName: { fontSize: 14, fontWeight: '700', marginTop: 6 },
  organPct: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  bar: { height: 6, borderRadius: 4, overflow: 'hidden', marginTop: 4 },
  organFact: { fontSize: 11, lineHeight: 16, marginTop: 8 },
});
