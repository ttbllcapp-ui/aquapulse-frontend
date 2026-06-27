import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, DrinkEntry, UserSettings, CustomCup } from './types';

const KEY = 'aqualife_state_v2';
const LEGACY_KEY = 'aqualife_state_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  weightKg: 70,
  heightCm: 170,
  ageYears: 30,
  gender: 'other',
  dailyGoalMl: 2500,
  wakeTime: '07:00',
  sleepTime: '23:00',
  reminderIntervalMin: 90,
  remindersEnabled: true,
  unit: 'ml',
  onboarded: false,
  language: 'tr',
  themeId: 'ocean',
  countryCode: 'TR',
  adaptiveGoalEnabled: true,
  soundEnabled: true,
};

export const DEFAULT_CUPS: CustomCup[] = [
  { id: 'c1', name: 'Bardak', nameKey: 'cup_glass', amount: 250, type: 'water', icon: 'GlassWater' },
  { id: 'c2', name: 'Şişe', nameKey: 'cup_bottle', amount: 500, type: 'water', icon: 'Milk' },
  { id: 'c3', name: 'Büyük Şişe', nameKey: 'cup_large_bottle', amount: 750, type: 'water', icon: 'Milk' },
  { id: 'c4', name: 'Çay', nameKey: 'cup_tea', amount: 200, type: 'tea', icon: 'CupSoda' },
  { id: 'c5', name: 'Kahve', nameKey: 'cup_coffee', amount: 180, type: 'coffee', icon: 'Coffee' },
];

const DEFAULT_STATE: AppState = {
  settings: DEFAULT_SETTINGS,
  entries: [],
  customCups: DEFAULT_CUPS,
  streakDays: [],
  achievements: [],
  goalHistory: [],
};

export async function loadState(): Promise<AppState> {
  try {
    let raw = await AsyncStorage.getItem(KEY);
    if (!raw) {
      const legacy = await AsyncStorage.getItem(LEGACY_KEY);
      if (legacy) raw = legacy;
    }
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    // Migrate legacy cups (add nameKey for known default names)
    const nameToKey: Record<string, string> = {
      'Bardak': 'cup_glass', 'Glass': 'cup_glass',
      'Şişe': 'cup_bottle', 'Bottle': 'cup_bottle',
      'Büyük Şişe': 'cup_large_bottle', 'Large Bottle': 'cup_large_bottle',
      'Çay': 'cup_tea', 'Tea': 'cup_tea',
      'Kahve': 'cup_coffee', 'Coffee': 'cup_coffee',
    };
    const migratedCups = (parsed.customCups && parsed.customCups.length)
      ? parsed.customCups.map((c) => c.nameKey ? c : ({ ...c, nameKey: nameToKey[c.name] }))
      : DEFAULT_CUPS;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
      customCups: migratedCups,
      goalHistory: parsed.goalHistory || [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export async function saveState(state: AppState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}

export async function resetState(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
  await AsyncStorage.removeItem(LEGACY_KEY);
}

export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function entriesForDay(entries: DrinkEntry[], day: string): DrinkEntry[] {
  return entries.filter((e) => todayKey(new Date(e.timestamp)) === day);
}

export function totalHydrationForDay(entries: DrinkEntry[], day: string): number {
  return entriesForDay(entries, day).reduce((s, e) => s + e.hydration, 0);
}

export function totalAmountForDay(entries: DrinkEntry[], day: string): number {
  return entriesForDay(entries, day).reduce((s, e) => s + e.amount, 0);
}

export function calculateGoal(weightKg: number, climateBoostMl: number = 0, opts?: { heightCm?: number; ageYears?: number; gender?: 'male' | 'female' | 'other' }): number {
  // Refined formula: weight * 33ml + age factor + gender factor + height factor + climate
  // Source: ISSN/EFSA approximations rounded for daily total fluid intake.
  let base = weightKg * 33;
  if (opts?.ageYears) {
    if (opts.ageYears < 30) base *= 1.05; // higher metabolism
    else if (opts.ageYears >= 55) base *= 0.95; // slightly lower
  }
  if (opts?.gender === 'male') base += 200;
  else if (opts?.gender === 'female') base -= 150;
  if (opts?.heightCm && opts.heightCm > 180) base += 100;
  base += climateBoostMl;
  // Round to nearest 50ml
  const total = Math.round(base / 50) * 50;
  return Math.max(1500, total);
}

// Returns the number of consecutive goal-met days ending today (or yesterday)
export function consecutiveStreak(streakDays: string[]): number {
  if (streakDays.length === 0) return 0;
  const sorted = [...new Set(streakDays)].sort();
  const today = todayKey();
  const yesterday = todayKey(new Date(Date.now() - 86400000));

  let ptrDate: string;
  if (sorted[sorted.length - 1] === today) ptrDate = today;
  else if (sorted[sorted.length - 1] === yesterday) ptrDate = yesterday;
  else return 0;

  let count = 0;
  let cur = new Date(ptrDate + 'T00:00:00');
  const set = new Set(sorted);
  while (set.has(todayKey(cur))) {
    count++;
    cur = new Date(cur.getTime() - 86400000);
  }
  return count;
}
