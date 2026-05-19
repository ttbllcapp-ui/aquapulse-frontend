import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sprout, TrendingUp, Calendar, Droplets, Share2 } from 'lucide-react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useApp } from '../../src/AppContext';
import { todayKey, totalHydrationForDay } from '../../src/storage';
import GlassCard from '../../src/components/GlassCard';

export default function StatsScreen() {
  const { state, palette, t } = useApp();
  const shotRef = useRef<ViewShot>(null);

  const last7 = useMemo(() => buildLastDays(state.entries, 7, state.settings.language), [state.entries, state.settings.language]);
  const last30 = useMemo(() => buildLastDays(state.entries, 30, state.settings.language), [state.entries, state.settings.language]);

  const goal = state.settings.dailyGoalMl;
  const weeklyAvg = Math.round(last7.reduce((s, d) => s + d.amount, 0) / 7);
  const weeklyTotal = last7.reduce((s, d) => s + d.amount, 0);
  const monthlyTotal = last30.reduce((s, d) => s + d.amount, 0);
  const goalsMet7 = last7.filter((d) => d.amount >= goal).length;
  const streakStage = stageForStreak(state.streakDays.length, state.settings.language);

  const handleShare = async () => {
    try {
      if (!shotRef.current?.capture) {
        Alert.alert(t('share_report'), 'Not supported in this environment.');
        return;
      }
      const uri = await shotRef.current.capture();
      if (Platform.OS === 'web') {
        // Web: open in new tab
        if (typeof window !== 'undefined') (window as any).open(uri, '_blank');
        return;
      }
      const available = await Sharing.isAvailableAsync();
      if (available) await Sharing.shareAsync(uri);
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: palette.bgPrimary }]}>
      <LinearGradient colors={palette.bgGradient} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.h1, { color: palette.textPrimary }]}>{t('stats_title')}</Text>
              <Text style={[styles.sub, { color: palette.textSecondary }]}>{t('stats_sub')}</Text>
            </View>
            <TouchableOpacity testID="share-report" onPress={handleShare} style={[styles.shareBtn, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}>
              <Share2 color={palette.primary} size={20} />
            </TouchableOpacity>
          </View>

          <ViewShot ref={shotRef} options={{ format: 'png', quality: 0.9 }} style={{ backgroundColor: palette.bgPrimary }}>
            <GlassCard style={{ marginTop: 20, padding: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View style={[styles.plantBubble, { borderColor: streakStage.color }]}>
                  <Sprout color={streakStage.color} size={32} strokeWidth={1.6} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.streakLabel, { color: palette.textSecondary }]}>{t('current_streak')}</Text>
                  <Text style={[styles.streakBig, { color: palette.textPrimary }]} testID="streak-count">{state.streakDays.length} {t('streak_days')}</Text>
                  <Text style={{ color: palette.accentPlant, fontSize: 13, fontWeight: '600' }}>{streakStage.name}</Text>
                </View>
              </View>
              <View style={[styles.progressBar, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                <View style={[styles.progressBarFill, { width: `${Math.min(100, (state.streakDays.length / streakStage.next) * 100)}%`, backgroundColor: streakStage.color }]} />
              </View>
              <Text style={{ color: palette.textSecondary, fontSize: 12, marginTop: 8 }}>{streakStage.nextLabel}</Text>
            </GlassCard>

            <View style={styles.kpiRow}>
              <KpiCard icon={<TrendingUp color={palette.primary} size={20} />} label={t('weekly_avg')} value={`${weeklyAvg} ml`} palette={palette} />
              <KpiCard icon={<Calendar color={palette.accentPlant} size={20} />} label={t('goal_hit_rate')} value={`${goalsMet7} / 7`} palette={palette} />
            </View>
            <View style={styles.kpiRow}>
              <KpiCard icon={<Droplets color={palette.primary} size={20} />} label={t('total_7d')} value={`${(weeklyTotal / 1000).toFixed(1)} L`} palette={palette} />
              <KpiCard icon={<Droplets color={palette.accentPlant} size={20} />} label={t('total_30d')} value={`${(monthlyTotal / 1000).toFixed(1)} L`} palette={palette} />
            </View>

            <GlassCard style={{ marginTop: 16, padding: 20 }}>
              <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>{t('last_7_days')}</Text>
              <View style={styles.chart}>
                {last7.map((d, i) => {
                  const max = Math.max(goal, ...last7.map((x) => x.amount));
                  const h = max > 0 ? (d.amount / max) * 130 : 0;
                  const met = d.amount >= goal;
                  return (
                    <View key={i} style={styles.barCol}>
                      <View style={styles.barTrack}>
                        <LinearGradient
                          colors={met ? ['#00FF87', '#00B8A4'] : palette.primaryGradient}
                          style={[styles.bar, { height: Math.max(4, h) }]}
                        />
                      </View>
                      <Text style={{ color: palette.textSecondary, fontSize: 11, fontWeight: '500' }}>{d.label}</Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: palette.primary }]} />
                  <Text style={{ color: palette.textSecondary, fontSize: 12 }}>{t('below_goal')}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: palette.accentPlant }]} />
                  <Text style={{ color: palette.textSecondary, fontSize: 12 }}>{t('met_goal')}</Text>
                </View>
              </View>
            </GlassCard>

            <GlassCard style={{ marginTop: 16, padding: 20 }}>
              <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>{t('last_30_days')}</Text>
              <View style={[styles.chart, { gap: 2 }]}>
                {last30.map((d, i) => {
                  const max = Math.max(goal, ...last30.map((x) => x.amount));
                  const h = max > 0 ? (d.amount / max) * 90 : 0;
                  const met = d.amount >= goal;
                  return (
                    <View key={i} style={styles.barColMini}>
                      <View style={styles.barTrackMini}>
                        <View style={[styles.barMini, { height: Math.max(2, h), backgroundColor: met ? palette.accentPlant : palette.primaryDark }]} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </GlassCard>
          </ViewShot>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function KpiCard({ icon, label, value, palette }: any) {
  return (
    <GlassCard style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>{icon}<Text style={{ color: palette.textSecondary, fontSize: 12, fontWeight: '600' }}>{label}</Text></View>
      <Text style={{ color: palette.textPrimary, fontSize: 22, fontWeight: '800', marginTop: 6 }}>{value}</Text>
    </GlassCard>
  );
}

function buildLastDays(entries: { timestamp: number; hydration: number }[], n: number, lang: string) {
  const out: { key: string; label: string; amount: number }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = todayKey(d);
    const amount = totalHydrationForDay(entries as any, key);
    out.push({
      key,
      label: i === 0 ? '•' : d.toLocaleDateString(lang === 'tr' ? 'tr-TR' : lang, { weekday: 'short' }).slice(0, 2),
      amount,
    });
  }
  return out;
}

function stageForStreak(n: number, lang: string) {
  const L: Record<string, { names: string[]; hints: string[] }> = {
    tr: { names: ['Tohum', 'Filiz', 'Yunus', 'Kaplumbağa', 'Balina Bilgesi'], hints: ['gün sonra Filiz 🌱', 'gün sonra Yunus 🐬', 'gün sonra Kaplumbağa 🐢', 'gün sonra Balina 🐋', 'Efsane seri!'] },
    en: { names: ['Seed', 'Sprout', 'Dolphin', 'Turtle', 'Whale Sage'], hints: ['days to Sprout 🌱', 'days to Dolphin 🐬', 'days to Turtle 🐢', 'days to Whale 🐋', 'Legendary streak!'] },
    de: { names: ['Samen', 'Spross', 'Delfin', 'Schildkröte', 'Wal-Weiser'], hints: ['Tage bis Spross 🌱', 'Tage bis Delfin 🐬', 'Tage bis Schildkröte 🐢', 'Tage bis Wal 🐋', 'Legendäre Serie!'] },
    fr: { names: ['Graine', 'Pousse', 'Dauphin', 'Tortue', 'Sage Baleine'], hints: ['jours pour Pousse 🌱', 'jours pour Dauphin 🐬', 'jours pour Tortue 🐢', 'jours pour Baleine 🐋', 'Série légendaire !'] },
    es: { names: ['Semilla', 'Brote', 'Delfín', 'Tortuga', 'Sabio Ballena'], hints: ['días para Brote 🌱', 'días para Delfín 🐬', 'días para Tortuga 🐢', 'días para Ballena 🐋', '¡Racha legendaria!'] },
    it: { names: ['Seme', 'Germoglio', 'Delfino', 'Tartaruga', 'Balena Saggia'], hints: ['giorni al Germoglio 🌱', 'giorni al Delfino 🐬', 'giorni alla Tartaruga 🐢', 'giorni alla Balena 🐋', 'Serie leggendaria!'] },
    ar: { names: ['بذرة', 'برعم', 'دلفين', 'سلحفاة', 'حوت حكيم'], hints: ['أيام للبرعم 🌱', 'أيام للدلفين 🐬', 'أيام للسلحفاة 🐢', 'أيام للحوت 🐋', 'سلسلة أسطورية!'] },
  };
  const loc = L[lang] || L.tr;
  if (n < 3) return { name: loc.names[0], color: '#6B85B0', next: 3, nextLabel: `${3 - n} ${loc.hints[0]}` };
  if (n < 7) return { name: loc.names[1], color: '#00FF87', next: 7, nextLabel: `${7 - n} ${loc.hints[1]}` };
  if (n < 14) return { name: loc.names[2], color: '#00B8FF', next: 14, nextLabel: `${14 - n} ${loc.hints[2]}` };
  if (n < 30) return { name: loc.names[3], color: '#00FF87', next: 30, nextLabel: `${30 - n} ${loc.hints[3]}` };
  return { name: loc.names[4], color: '#00E5FF', next: n + 1, nextLabel: loc.hints[4] };
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 60 },
  h1: { fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
  sub: { marginTop: 4, fontSize: 14 },
  shareBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  plantBubble: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, backgroundColor: 'rgba(0, 255, 135, 0.05)', alignItems: 'center', justifyContent: 'center' },
  streakLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  streakBig: { fontSize: 26, fontWeight: '800', marginTop: 2 },
  progressBar: { height: 6, borderRadius: 3, marginTop: 12, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  kpiRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 160, justifyContent: 'space-between' },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  barTrack: { width: '100%', height: 130, justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: '85%', borderRadius: 6, minHeight: 4 },
  chartLegend: { flexDirection: 'row', gap: 16, marginTop: 12, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  barColMini: { flex: 1, alignItems: 'center', height: 90, justifyContent: 'flex-end' },
  barTrackMini: { width: '100%', alignItems: 'center', justifyContent: 'flex-end', height: 90 },
  barMini: { width: '70%', borderRadius: 2 },
});
