import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
// (Localization removed — language is user-chosen during onboarding instead of auto-detected,
// to prevent mixed-language UI when device locale differs from user preference.)
import { AppState, DrinkEntry, UserSettings, CustomCup } from './types';
import {
  DEFAULT_CUPS,
  DEFAULT_SETTINGS,
  loadState,
  saveState,
  todayKey,
  totalHydrationForDay,
  consecutiveStreak,
} from './storage';
import { evaluateAchievements } from './achievements';
import { scheduleReminders } from './notifications';
import { THEMES, ThemeId, Palette } from './themes';
import { LangCode, tr_fn } from './i18n';

interface Ctx {
  state: AppState;
  loading: boolean;
  palette: Palette;
  t: (key: string, vars?: Record<string, string | number>) => string;
  addDrink: (cup: { type: DrinkEntry['type']; amount: number; hydration?: number; cupName?: string }) => Promise<{ goalMet: boolean; goalIncreased?: number }>;
  removeEntry: (id: string) => Promise<void>;
  updateSettings: (s: Partial<UserSettings>) => Promise<void>;
  setTheme: (id: ThemeId) => Promise<void>;
  setLanguage: (code: LangCode) => Promise<void>;
  addCustomCup: (c: Omit<CustomCup, 'id'>) => Promise<void>;
  removeCustomCup: (id: string) => Promise<void>;
  resetAll: () => Promise<void>;
}

const AppCtx = createContext<Ctx | null>(null);

const INITIAL_STATE: AppState = {
  settings: DEFAULT_SETTINGS,
  entries: [],
  customCups: DEFAULT_CUPS,
  streakDays: [],
  achievements: [],
  goalHistory: [],
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const stateRef = useRef<AppState>(INITIAL_STATE);

  useEffect(() => {
    (async () => {
      const s = await loadState();
      // KEEP user's chosen language; only fallback to Turkish on very first launch
      // (no automatic device-language detection — caused confusing mixed-language UI)
      stateRef.current = s;
      setState(s);
      setLoading(false);
      // Founding Member tracking — first-launch timestamp is recorded so we can later
      // grant lifetime free access to early users when v1.1 introduces paid tier.
      try {
        const { ensureFoundingMember } = await import('./engagement');
        await ensureFoundingMember();
      } catch {}
    })();
  }, []);

  const persist = useCallback(async (compute: (prev: AppState) => AppState): Promise<AppState> => {
    const prev = stateRef.current;
    let next = compute(prev);
    const today = todayKey();
    const todayHydration = totalHydrationForDay(next.entries, today);
    let streakDays = next.streakDays;
    if (todayHydration >= next.settings.dailyGoalMl && !streakDays.includes(today)) {
      streakDays = [...streakDays, today];
    }
    const achievementIds = evaluateAchievements({ ...next, streakDays });
    next = { ...next, streakDays, achievements: achievementIds };
    stateRef.current = next;
    setState(next);
    await saveState(next);
    return next;
  }, []);

  const addDrink: Ctx['addDrink'] = async (cup) => {
    const hydrationFactor = cup.hydration ?? 1;
    const entry: DrinkEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: cup.type,
      amount: cup.amount,
      hydration: Math.round(cup.amount * hydrationFactor),
      timestamp: Date.now(),
      cupName: cup.cupName,
    };
    const before = stateRef.current;
    const beforeHydration = totalHydrationForDay(before.entries, todayKey());
    const wasMet = beforeHydration >= before.settings.dailyGoalMl;

    let next = await persist((prev) => ({ ...prev, entries: [...prev.entries, entry] }));

    const nowHydration = totalHydrationForDay(next.entries, todayKey());
    const nowMet = nowHydration >= next.settings.dailyGoalMl;
    const goalMetNow = nowMet && !wasMet;

    let goalIncreased: number | undefined;
    if (goalMetNow && next.settings.adaptiveGoalEnabled) {
      const streak = consecutiveStreak(next.streakDays);
      if (streak > 0 && streak % 7 === 0) {
        const newGoal = next.settings.dailyGoalMl + 100;
        next = await persist((prev) => ({
          ...prev,
          settings: { ...prev.settings, dailyGoalMl: newGoal },
          goalHistory: [...prev.goalHistory, { date: todayKey(), goal: newGoal }],
        }));
        goalIncreased = newGoal;
      }
    }

    return { goalMet: goalMetNow, goalIncreased };
  };

  const removeEntry: Ctx['removeEntry'] = async (id) => {
    await persist((prev) => ({ ...prev, entries: prev.entries.filter((e) => e.id !== id) }));
  };

  const updateSettings: Ctx['updateSettings'] = async (s) => {
    const next = await persist((prev) => ({ ...prev, settings: { ...prev.settings, ...s } }));
    if (s.remindersEnabled !== undefined || s.reminderIntervalMin !== undefined || s.wakeTime || s.sleepTime || s.language) {
      scheduleReminders(next.settings).catch(() => {});
    }
  };

  const setTheme: Ctx['setTheme'] = async (id) => {
    await updateSettings({ themeId: id });
  };

  const setLanguage: Ctx['setLanguage'] = async (code) => {
    await updateSettings({ language: code });
  };

  const addCustomCup: Ctx['addCustomCup'] = async (c) => {
    const cup: CustomCup = { ...c, id: `cup-${Date.now()}` };
    await persist((prev) => ({ ...prev, customCups: [...prev.customCups, cup] }));
  };

  const removeCustomCup: Ctx['removeCustomCup'] = async (id) => {
    await persist((prev) => ({ ...prev, customCups: prev.customCups.filter((c) => c.id !== id) }));
  };

  const resetAll: Ctx['resetAll'] = async () => {
    const fresh: AppState = { ...INITIAL_STATE };
    stateRef.current = fresh;
    setState(fresh);
    await saveState(fresh);
  };

  const palette = THEMES[state.settings.themeId] || THEMES.ocean;
  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => tr_fn(state.settings.language, key, vars),
    [state.settings.language]
  );

  const value = useMemo<Ctx>(
    () => ({
      state, loading, palette, t,
      addDrink, removeEntry, updateSettings, setTheme, setLanguage,
      addCustomCup, removeCustomCup, resetAll,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, loading, palette, t]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): Ctx {
  const v = useContext(AppCtx);
  if (!v) throw new Error('useApp must be used within AppProvider');
  return v;
}
