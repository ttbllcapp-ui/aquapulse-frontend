import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { UserSettings } from './types';
import { getRandomQuote } from './quotes';
import { tr_fn } from './i18n';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let final = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      final = status;
    }
    return final === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleReminders(settings: UserSettings): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!settings.remindersEnabled) return;

    const [wakeH, wakeM] = settings.wakeTime.split(':').map(Number);
    const [sleepH, sleepM] = settings.sleepTime.split(':').map(Number);
    const intervalMin = Math.max(15, settings.reminderIntervalMin);

    const wakeMinutes = wakeH * 60 + wakeM;
    let sleepMinutes = sleepH * 60 + sleepM;
    if (sleepMinutes <= wakeMinutes) sleepMinutes += 24 * 60;

    let cur = wakeMinutes + intervalMin;
    let idx = 0;
    while (cur < sleepMinutes && idx < 30) {
      const h = Math.floor(cur / 60) % 24;
      const m = cur % 60;
      const body = getRandomQuote(settings.language);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: tr_fn(settings.language, 'app_name'),
          body: `💧 ${body}`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: h,
          minute: m,
        } as any,
      });
      cur += intervalMin;
      idx++;
    }
  } catch (e) {
    console.warn('Failed to schedule reminders', e);
  }
}

export async function cancelAllReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}
