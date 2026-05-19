import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Check, ListChecks, Clock } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../AppContext';
import { DAILY_TASKS, getTaskLabel } from '../dailyTasks';

const STORAGE_KEY = 'aquapulse_daily_tasks';

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export default function DailyTasksCard() {
  const { palette, t, state } = useApp();
  const lang = state.settings.language;
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        if (parsed && parsed.date === todayKey()) setDone(parsed.ids || []);
        else setDone([]);
      } catch {}
    })();
  }, []);

  const persist = async (ids: string[]) => {
    try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey(), ids })); } catch {}
  };

  const toggle = (id: string) => {
    const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id];
    setDone(next);
    persist(next);
  };

  const completion = useMemo(() => Math.round((done.length / DAILY_TASKS.length) * 100), [done.length]);

  const title = lang === 'tr' ? 'Bugünkü Görevler' : t('today_short') === 'Today' ? "Today's Tasks" : `${t('today_short')}`;
  const subtitle = lang === 'tr' ? `${done.length}/${DAILY_TASKS.length} tamamlandı · %${completion}` : `${done.length}/${DAILY_TASKS.length} · ${completion}%`;

  return (
    <View style={[styles.card, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ListChecks color={palette.primary} size={20} />
          <View>
            <Text style={[styles.title, { color: palette.textPrimary }]}>{title}</Text>
            <Text style={{ color: palette.textSecondary, fontSize: 11 }}>{subtitle}</Text>
          </View>
        </View>
        <View style={[styles.progress, { backgroundColor: palette.glassBgLight }]}>
          <View style={[styles.progressFill, { backgroundColor: palette.primary, width: `${completion}%` }]} />
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }} contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
        {DAILY_TASKS.map((task) => {
          const isDone = done.includes(task.id);
          return (
            <TouchableOpacity
              key={task.id}
              testID={`task-${task.id}`}
              onPress={() => toggle(task.id)}
              activeOpacity={0.85}
              style={[styles.task, { backgroundColor: isDone ? `${palette.primary}33` : palette.glassBgLight, borderColor: isDone ? palette.primary : palette.borderLight }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Clock color={palette.textMuted} size={11} />
                <Text style={{ color: palette.textMuted, fontSize: 11, fontWeight: '600' }}>{String(task.hour).padStart(2, '0')}:00</Text>
                <Text style={{ color: palette.primary, fontSize: 11, fontWeight: '700' }}>{task.amountMl} ml</Text>
              </View>
              <Text style={[styles.taskLabel, { color: palette.textPrimary, textDecorationLine: isDone ? 'line-through' : 'none' }]} numberOfLines={2}>
                {getTaskLabel(task, lang)}
              </Text>
              {isDone && (
                <View style={[styles.checkBadge, { backgroundColor: palette.primary }]}>
                  <Check color={palette.onPrimary} size={12} strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 18, borderWidth: 1, marginTop: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  title: { fontSize: 15, fontWeight: '800' },
  progress: { width: 80, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  task: { width: 168, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, borderWidth: 1, gap: 6, position: 'relative' },
  taskLabel: { fontSize: 12, fontWeight: '700', lineHeight: 16 },
  checkBadge: { position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
