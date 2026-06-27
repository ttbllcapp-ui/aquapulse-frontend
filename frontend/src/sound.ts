// Lightweight sound util: uses Web Audio on web, Haptics on native.
// Avoids heavy audio bundle; produces a short "water drop" pitch sweep.
import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

let webCtx: any = null;

export function playWaterDrop(enabled: boolean = true) {
  if (!enabled) return;
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Web Audio: synth a quick drop sound
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      if (!webCtx) webCtx = new AC();
      const ctx = webCtx;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.28);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.35, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      // Native: strong haptic sequence
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}), 80);
    }
  } catch {}
}

export function celebrateGoal(enabled: boolean = true) {
  if (!enabled) return;
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      if (!webCtx) webCtx = new AC();
      const ctx = webCtx;
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
      notes.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(f, now + i * 0.12);
        g.gain.setValueAtTime(0.0001, now + i * 0.12);
        g.gain.exponentialRampToValueAtTime(0.3, now + i * 0.12 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.35);
        o.connect(g).connect(ctx.destination);
        o.start(now + i * 0.12);
        o.stop(now + i * 0.12 + 0.4);
      });
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      Vibration.vibrate([0, 80, 60, 100]);
    }
  } catch {}
}
