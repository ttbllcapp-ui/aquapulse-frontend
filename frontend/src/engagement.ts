/**
 * Engagement helpers: rate-the-app prompt, share, founding-member tracking.
 * All on-device, no external services. Designed to maximize feedback + downloads.
 */
import * as StoreReview from 'expo-store-review';
import { Share, Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  GOAL_HIT_COUNT: 'aqua_goal_hit_count',
  LAST_RATE_PROMPT_AT: 'aqua_last_rate_prompt_at',
  HAS_RATED: 'aqua_has_rated',
  FOUNDING_AT: 'aqua_founding_at',
};

/** Mark user as Founding Member on first launch (used later when we monetize). */
export async function ensureFoundingMember(): Promise<number> {
  const v = await AsyncStorage.getItem(KEYS.FOUNDING_AT);
  if (v) return Number(v);
  const now = Date.now();
  await AsyncStorage.setItem(KEYS.FOUNDING_AT, String(now));
  return now;
}

/** Returns true if user joined before <cutoff>. Founding members get lifetime free in future versions. */
export async function isFoundingMember(cutoffMs: number = Date.UTC(2025, 11, 31)): Promise<boolean> {
  const v = await AsyncStorage.getItem(KEYS.FOUNDING_AT);
  if (!v) return false;
  return Number(v) <= cutoffMs;
}

/** Record that the user just hit their daily hydration goal. */
export async function trackGoalHit(): Promise<number> {
  const raw = await AsyncStorage.getItem(KEYS.GOAL_HIT_COUNT);
  const count = (Number(raw) || 0) + 1;
  await AsyncStorage.setItem(KEYS.GOAL_HIT_COUNT, String(count));
  return count;
}

/** Smart in-app rate prompt: only after the user has had 2+ positive moments + 5 days gap + once total. */
export async function maybePromptRate(): Promise<boolean> {
  try {
    const has = await AsyncStorage.getItem(KEYS.HAS_RATED);
    if (has === '1') return false;
    const cntRaw = await AsyncStorage.getItem(KEYS.GOAL_HIT_COUNT);
    const count = Number(cntRaw) || 0;
    if (count < 2) return false; // Need 2 successful goal hits

    const lastRaw = await AsyncStorage.getItem(KEYS.LAST_RATE_PROMPT_AT);
    const last = Number(lastRaw) || 0;
    const fiveDays = 5 * 24 * 60 * 60 * 1000;
    if (last && Date.now() - last < fiveDays) return false;

    const isAvail = await StoreReview.isAvailableAsync();
    if (!isAvail) return false;
    const hasAction = await StoreReview.hasAction();
    if (!hasAction) return false;

    await StoreReview.requestReview();
    await AsyncStorage.setItem(KEYS.LAST_RATE_PROMPT_AT, String(Date.now()));
    await AsyncStorage.setItem(KEYS.HAS_RATED, '1'); // assume yes; Apple only allows 3/year anyway
    return true;
  } catch {
    return false;
  }
}

/** Manual rate trigger — for Settings "Rate AquaPulse" button */
export async function openRateInAppStore(): Promise<void> {
  try {
    const isAvail = await StoreReview.isAvailableAsync();
    if (isAvail) {
      await StoreReview.requestReview();
      return;
    }
  } catch {}
  // Fallback to App Store URL (replace with real APP_STORE_ID after first submit)
  const APP_STORE_ID = '0000000000'; // TODO replace with real numeric app id post-submit
  const url = Platform.OS === 'ios'
    ? `itms-apps://itunes.apple.com/app/id${APP_STORE_ID}?action=write-review`
    : `https://apps.apple.com/app/id${APP_STORE_ID}`;
  try { await Linking.openURL(url); } catch {}
}

/** Share the app — viral mechanic. */
export async function shareApp(language: 'tr' | 'en' = 'en'): Promise<void> {
  const APP_STORE_URL = 'https://apps.apple.com/app/aquapulse-water-tracker/id0000000000';
  const msg = language === 'tr'
    ? `AquaPulse — günde 2 dakika, daha sağlıklı bir hayat. AI hidrasyon koçu, vücut su haritası, aile modu — tamamen ücretsiz: ${APP_STORE_URL}`
    : `I'm using AquaPulse to stay hydrated — AI coach, body water map, family mode, all free. Try it: ${APP_STORE_URL}`;
  try {
    await Share.share({ message: msg, url: APP_STORE_URL, title: 'AquaPulse — Water Tracker' });
  } catch {}
}

/** Open mail composer with prefilled subject/body */
export async function sendFeedbackEmail(language: 'tr' | 'en' = 'en', appVersion: string = '1.0.0'): Promise<void> {
  const subject = language === 'tr' ? 'AquaPulse Geri Bildirim' : 'AquaPulse Feedback';
  const body = language === 'tr'
    ? `Merhaba AquaPulse ekibi,%0D%0A%0D%0A(Yorumun buraya)%0D%0A%0D%0A----%0D%0AApp version: ${appVersion}%0D%0APlatform: ${Platform.OS}`
    : `Hi AquaPulse team,%0D%0A%0D%0A(Your feedback here)%0D%0A%0D%0A----%0D%0AApp version: ${appVersion}%0D%0APlatform: ${Platform.OS}`;
  const url = `mailto:info@ttbinternationalllc.com?subject=${encodeURIComponent(subject)}&body=${body}`;
  try { await Linking.openURL(url); } catch {}
}
