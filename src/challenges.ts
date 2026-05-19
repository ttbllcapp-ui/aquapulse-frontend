import { AppState } from './types';
import { todayKey, totalHydrationForDay, entriesForDay } from './storage';

export interface Challenge {
  id: string;
  titleKey: string;
  descKey: string;
  icon: string;
  rewardXp: number;
  check: (state: AppState) => boolean;
}

// 15 challenges spanning daily, weekly, and lifetime goals
export const CHALLENGES: Challenge[] = [
  { id: 'ch_morning', titleKey: 'ch_morning_t', descKey: 'ch_morning_d', icon: 'Sunrise', rewardXp: 50,
    check: (s) => entriesForDay(s.entries, todayKey()).some((e) => new Date(e.timestamp).getHours() < 9) },
  { id: 'ch_3_drinks_today', titleKey: 'ch_3_today_t', descKey: 'ch_3_today_d', icon: 'Droplets', rewardXp: 50,
    check: (s) => entriesForDay(s.entries, todayKey()).length >= 3 },
  { id: 'ch_5_drinks_today', titleKey: 'ch_5_today_t', descKey: 'ch_5_today_d', icon: 'Droplets', rewardXp: 80,
    check: (s) => entriesForDay(s.entries, todayKey()).length >= 5 },
  { id: 'ch_8_drinks_today', titleKey: 'ch_8_today_t', descKey: 'ch_8_today_d', icon: 'Droplets', rewardXp: 120,
    check: (s) => entriesForDay(s.entries, todayKey()).length >= 8 },
  { id: 'ch_goal_today', titleKey: 'ch_goal_today_t', descKey: 'ch_goal_today_d', icon: 'Target', rewardXp: 100,
    check: (s) => totalHydrationForDay(s.entries, todayKey()) >= s.settings.dailyGoalMl },
  { id: 'ch_variety_today', titleKey: 'ch_variety_t', descKey: 'ch_variety_d', icon: 'Palette', rewardXp: 80,
    check: (s) => new Set(entriesForDay(s.entries, todayKey()).map((e) => e.type)).size >= 3 },
  { id: 'ch_no_coffee', titleKey: 'ch_no_coffee_t', descKey: 'ch_no_coffee_d', icon: 'CoffeeOff', rewardXp: 100,
    check: (s) => {
      const today = entriesForDay(s.entries, todayKey());
      return today.length > 0 && !today.some((e) => e.type === 'coffee');
    } },
  { id: 'ch_streak_3', titleKey: 'ch_streak_3_t', descKey: 'ch_streak_3_d', icon: 'Flame', rewardXp: 150,
    check: (s) => s.streakDays.length >= 3 },
  { id: 'ch_streak_7', titleKey: 'ch_streak_7_t', descKey: 'ch_streak_7_d', icon: 'Flame', rewardXp: 250,
    check: (s) => s.streakDays.length >= 7 },
  { id: 'ch_streak_30', titleKey: 'ch_streak_30_t', descKey: 'ch_streak_30_d', icon: 'Flame', rewardXp: 1000,
    check: (s) => s.streakDays.length >= 30 },
  { id: 'ch_early_bird', titleKey: 'ch_early_bird_t', descKey: 'ch_early_bird_d', icon: 'Sunrise', rewardXp: 80,
    check: (s) => entriesForDay(s.entries, todayKey()).some((e) => {
      const h = new Date(e.timestamp).getHours();
      return h >= 5 && h < 8;
    }) },
  { id: 'ch_night_owl', titleKey: 'ch_night_owl_t', descKey: 'ch_night_owl_d', icon: 'Moon', rewardXp: 60,
    check: (s) => {
      const today = entriesForDay(s.entries, todayKey());
      return today.length > 0 && today.every((e) => new Date(e.timestamp).getHours() < 22);
    } },
  { id: 'ch_total_50l', titleKey: 'ch_total_50l_t', descKey: 'ch_total_50l_d', icon: 'Waves', rewardXp: 500,
    check: (s) => s.entries.reduce((a, b) => a + b.amount, 0) >= 50000 },
  { id: 'ch_total_100l', titleKey: 'ch_total_100l_t', descKey: 'ch_total_100l_d', icon: 'Sailboat', rewardXp: 1000,
    check: (s) => s.entries.reduce((a, b) => a + b.amount, 0) >= 100000 },
  { id: 'ch_morning_500', titleKey: 'ch_morning_500_t', descKey: 'ch_morning_500_d', icon: 'Sunrise', rewardXp: 100,
    check: (s) => {
      const morning = entriesForDay(s.entries, todayKey()).filter((e) => new Date(e.timestamp).getHours() < 10);
      return morning.reduce((a, b) => a + b.hydration, 0) >= 500;
    } },
];

export function evaluateChallenges(state: AppState): string[] {
  return CHALLENGES.filter((c) => c.check(state)).map((c) => c.id);
}
