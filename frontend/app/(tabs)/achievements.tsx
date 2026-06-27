import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Lucide from 'lucide-react-native';
import { useApp } from '../../src/AppContext';
import { ACHIEVEMENTS } from '../../src/achievements';
import DailyTasksCard from '../../src/components/DailyTasksCard';

export default function AchievementsScreen() {
  const { state, palette, t } = useApp();
  const unlockedSet = new Set(state.achievements);
  const unlockedCount = ACHIEVEMENTS.filter((a) => unlockedSet.has(a.id)).length;

  return (
    <View style={[styles.root, { backgroundColor: palette.bgPrimary }]}>
      <LinearGradient colors={palette.bgGradient} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.h1, { color: palette.textPrimary }]}>{t('ach_title')}</Text>
          <Text style={[styles.sub, { color: palette.textSecondary }]}>{t('ach_sub')}</Text>

          {/* Daily tasks moved here from Home */}
          <DailyTasksCard />

          <View style={[styles.summaryCard, { backgroundColor: palette.glassBg, borderColor: palette.borderLight, marginTop: 14 }]}>
            <Text style={[styles.summaryNum, { color: palette.primary }]}>{unlockedCount} / {ACHIEVEMENTS.length}</Text>
            <Text style={[styles.summaryLabel, { color: palette.textSecondary }]}>{t('collected')}</Text>
            <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
              <View style={[styles.progressFill, { width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%`, backgroundColor: palette.primary }]} />
            </View>
          </View>

          <View style={styles.grid}>
            {ACHIEVEMENTS.map((a) => {
              const unlocked = unlockedSet.has(a.id);
              const Icon = (Lucide as any)[a.icon] || Lucide.Award;
              return (
                <View key={a.id} testID={`achv-${a.id}`} style={[styles.badge, unlocked ? { backgroundColor: palette.glassBg, borderColor: palette.borderLight } : { backgroundColor: 'rgba(15, 58, 112, 0.15)', borderColor: 'rgba(255,255,255,0.05)' }]}>
                  <View style={[styles.badgeIconWrap, { borderColor: unlocked ? a.color : 'rgba(255,255,255,0.1)' }]}>
                    <Icon color={unlocked ? a.color : palette.textMuted} size={32} strokeWidth={unlocked ? 1.7 : 1.4} />
                  </View>
                  <Text style={{ color: unlocked ? palette.textPrimary : palette.textMuted, fontSize: 14, fontWeight: '700', textAlign: 'center' }} numberOfLines={1}>{t(a.titleKey)}</Text>
                  <Text style={{ color: unlocked ? palette.textSecondary : palette.textMuted, fontSize: 11, textAlign: 'center', lineHeight: 14 }} numberOfLines={2}>{t(a.descKey)}</Text>
                </View>
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
  scroll: { padding: 24, paddingBottom: 60 },
  h1: { fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
  sub: { marginTop: 4, fontSize: 14 },
  summaryCard: { marginTop: 20, padding: 20, borderWidth: 1, borderRadius: 24, alignItems: 'center' },
  summaryNum: { fontSize: 36, fontWeight: '900' },
  summaryLabel: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
  progressTrack: { width: '100%', height: 6, borderRadius: 3, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 20 },
  badge: { width: '47%', padding: 16, alignItems: 'center', gap: 6, borderRadius: 16, borderWidth: 1 },
  badgeIconWrap: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
});
