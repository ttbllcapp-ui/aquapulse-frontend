import { LangCode } from './i18n';
import { ThemeId } from './themes';

export type DrinkType = 'water' | 'tea' | 'coffee' | 'juice' | 'custom';

export interface DrinkEntry {
  id: string;
  type: DrinkType;
  amount: number;
  hydration: number;
  timestamp: number;
  cupName?: string;
}

export type Gender = 'male' | 'female' | 'other';

export interface UserSettings {
  name?: string;
  weightKg: number;
  heightCm?: number;
  ageYears?: number;
  gender?: Gender;
  dailyGoalMl: number;
  wakeTime: string;
  sleepTime: string;
  reminderIntervalMin: number;
  remindersEnabled: boolean;
  unit: 'ml' | 'oz';
  onboarded: boolean;
  language: LangCode;
  themeId: ThemeId;
  countryCode: string;
  adaptiveGoalEnabled: boolean;
  soundEnabled: boolean;
}

export interface CustomCup {
  id: string;
  name: string;
  nameKey?: string; // i18n key for default cups
  amount: number;
  type: DrinkType;
  icon: string;
}

export interface AppState {
  settings: UserSettings;
  entries: DrinkEntry[];
  customCups: CustomCup[];
  streakDays: string[];
  achievements: string[];
  goalHistory: { date: string; goal: number }[]; // tracks goal at adaptive increase
}

export const DRINK_HYDRATION: Record<DrinkType, number> = {
  water: 1.0,
  tea: 0.9,
  coffee: 0.6,
  juice: 0.85,
  custom: 1.0,
};
