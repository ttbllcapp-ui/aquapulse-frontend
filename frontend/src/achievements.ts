import { AppState } from './types';
import { todayKey, totalHydrationForDay } from './storage';

export interface Achievement {
  id: string;
  titleKey: string;
  descKey: string;
  icon: string;
  color: string;
  check: (state: AppState) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_drop', titleKey: 'ach_first_drop', descKey: 'ach_first_drop_desc', icon: 'Droplet', color: '#00E5FF',
    check: (s) => s.entries.length >= 1 },
  { id: 'goal_met', titleKey: 'ach_goal_met', descKey: 'ach_goal_met_desc', icon: 'Flower', color: '#FF8A65',
    check: (s) => totalHydrationForDay(s.entries, todayKey()) >= s.settings.dailyGoalMl || s.streakDays.length > 0 },
  { id: 'streak_3', titleKey: 'ach_streak_3', descKey: 'ach_streak_3_desc', icon: 'Sprout', color: '#00FF87',
    check: (s) => s.streakDays.length >= 3 },
  { id: 'streak_7', titleKey: 'ach_streak_7', descKey: 'ach_streak_7_desc', icon: 'Fish', color: '#00B8FF',
    check: (s) => s.streakDays.length >= 7 },
  { id: 'streak_14', titleKey: 'ach_streak_14', descKey: 'ach_streak_14_desc', icon: 'Turtle', color: '#00FF87',
    check: (s) => s.streakDays.length >= 14 },
  { id: 'streak_30', titleKey: 'ach_streak_30', descKey: 'ach_streak_30_desc', icon: 'Anchor', color: '#00E5FF',
    check: (s) => s.streakDays.length >= 30 },
  { id: 'liters_10', titleKey: 'ach_liters_10', descKey: 'ach_liters_10_desc', icon: 'Waves', color: '#0088FF',
    check: (s) => s.entries.reduce((a, b) => a + b.amount, 0) >= 10000 },
  { id: 'liters_50', titleKey: 'ach_liters_50', descKey: 'ach_liters_50_desc', icon: 'Sailboat', color: '#00E5FF',
    check: (s) => s.entries.reduce((a, b) => a + b.amount, 0) >= 50000 },
  { id: 'variety', titleKey: 'ach_variety', descKey: 'ach_variety_desc', icon: 'Palette', color: '#FF5252',
    check: (s) => new Set(s.entries.map((e) => e.type)).size >= 3 },
];

export function evaluateAchievements(state: AppState): string[] {
  return ACHIEVEMENTS.filter((a) => a.check(state)).map((a) => a.id);
}
