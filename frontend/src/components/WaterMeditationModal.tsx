import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Easing, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Wind } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  primary: string;
  primaryGradient: readonly [string, string, ...string[]];
  bg: string;
  textPrimary: string;
  textSecondary: string;
  borderLight: string;
  glassBg: string;
  language: string;
  /** total cycle duration in ms — defaults to 4s inhale + 4s exhale */
  cycleMs?: number;
  /** total session length in seconds */
  durationSec?: number;
}

const LOCAL: Record<string, Record<string, string>> = {
  tr: { title: 'Su Nefesi', sub: 'Bedeninle uyumlu, akıcı bir an.', inhale: 'Nefes al', exhale: 'Nefes ver', finish: 'Bitir', done_title: 'Harika 💧', done_sub: 'Bedenine teşekkür et.' },
  en: { title: 'Water Breath', sub: 'A calm moment, in flow.', inhale: 'Inhale', exhale: 'Exhale', finish: 'Finish', done_title: 'Beautiful 💧', done_sub: 'Thank your body.' },
  de: { title: 'Wasser-Atem', sub: 'Ein ruhiger Moment.', inhale: 'Einatmen', exhale: 'Ausatmen', finish: 'Beenden', done_title: 'Schön 💧', done_sub: 'Danke deinem Körper.' },
  fr: { title: 'Souffle d\'eau', sub: 'Un instant calme.', inhale: 'Inspirez', exhale: 'Expirez', finish: 'Terminer', done_title: 'Bravo 💧', done_sub: 'Merci à ton corps.' },
  es: { title: 'Respiración de Agua', sub: 'Un momento de calma.', inhale: 'Inhala', exhale: 'Exhala', finish: 'Finalizar', done_title: 'Hermoso 💧', done_sub: 'Gracias a tu cuerpo.' },
};

function tx(lang: string, key: string) {
  return (LOCAL[lang] && LOCAL[lang][key]) || LOCAL.en[key];
}

export default function WaterMeditationModal({
  visible, onClose, primary, primaryGradient, bg, textPrimary, textSecondary, borderLight, glassBg,
  language, cycleMs = 8000, durationSec = 30,
}: Props) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [remaining, setRemaining] = useState(durationSec);
  const [done, setDone] = useState(false);
  const tickRef = useRef<any>(null);
  const animRef = useRef<any>(null);
  const phaseRef = useRef<'inhale' | 'exhale'>('inhale');

  useEffect(() => {
    if (!visible) return;
    setDone(false);
    setRemaining(durationSec);
    setPhase('inhale');
    phaseRef.current = 'inhale';
    scale.setValue(0.6);

    const half = cycleMs / 2;
    const runCycle = () => {
      const target = phaseRef.current === 'inhale' ? 1.0 : 0.6;
      animRef.current = Animated.timing(scale, {
        toValue: target,
        duration: half,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      });
      animRef.current.start(({ finished }) => {
        if (!finished) return;
        const next = phaseRef.current === 'inhale' ? 'exhale' : 'inhale';
        phaseRef.current = next;
        setPhase(next);
        runCycle();
      });
    };
    runCycle();

    tickRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(tickRef.current);
          setDone(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (animRef.current) animRef.current.stop();
    };
  }, [visible, cycleMs, durationSec, scale]);

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
      <View style={[styles.root, { backgroundColor: bg }]}>
        <LinearGradient colors={primaryGradient} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.topRow}>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              testID="meditation-close"
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={[styles.iconBtn, { borderColor: borderLight, backgroundColor: glassBg }]}
            >
              <X color="#FFFFFF" size={22} />
            </TouchableOpacity>
          </View>

          <View style={styles.center}>
            {!done ? (
              <>
                <Text style={styles.label}>{tx(language, 'title')}</Text>
                <Text style={styles.sub}>{tx(language, 'sub')}</Text>

                <View style={styles.ringWrap}>
                  {/* Outer halos */}
                  <Animated.View style={[styles.haloOuter, { transform: [{ scale: Animated.add(scale, new Animated.Value(0.05)) as any }] }]} />
                  <Animated.View style={[styles.haloMid, { transform: [{ scale }] }]} />
                  <Animated.View style={[styles.haloInner, { transform: [{ scale: Animated.add(scale, new Animated.Value(-0.1)) as any }] }]} />
                  <View style={styles.core}>
                    <Wind color="#FFFFFF" size={36} strokeWidth={1.6} />
                  </View>
                </View>

                <Text style={styles.phase}>{phase === 'inhale' ? tx(language, 'inhale') : tx(language, 'exhale')}</Text>
                <Text style={styles.timer}>{remaining}s</Text>
              </>
            ) : (
              <>
                <Text style={styles.label}>{tx(language, 'done_title')}</Text>
                <Text style={styles.sub}>{tx(language, 'done_sub')}</Text>
                <Pressable testID="meditation-done" onPress={onClose} style={[styles.cta, { borderColor: '#FFFFFF55' }]}>
                  <Text style={styles.ctaText}>{tx(language, 'finish')}</Text>
                </Pressable>
              </>
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topRow: { flexDirection: 'row', padding: 14 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 8 },
  label: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', letterSpacing: -0.4 },
  sub: { color: 'rgba(255,255,255,0.85)', fontSize: 14, textAlign: 'center', marginBottom: 6 },
  ringWrap: { width: 240, height: 240, alignItems: 'center', justifyContent: 'center', marginVertical: 16 },
  haloOuter: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(255,255,255,0.08)' },
  haloMid: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.16)' },
  haloInner: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.28)' },
  core: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  phase: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  timer: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 2 },
  cta: { marginTop: 20, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 999, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.16)' },
  ctaText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15, letterSpacing: 0.4 },
});
