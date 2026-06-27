import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, ActivityIndicator, Share, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Users, Copy, Share2, LogOut as LeaveIcon, Plus, KeyRound } from 'lucide-react-native';
import { useApp } from '../src/AppContext';
import { useAuth } from '../src/AuthContext';
import { apiGet, apiPost } from '../src/api';
import { todayKey, totalHydrationForDay } from '../src/storage';
import Bubbles from '../src/components/Bubbles';
import * as Clipboard from 'expo-clipboard';

interface FamilyMember {
  user_id: string; name: string; picture?: string;
  percent: number; hydration_today_ml: number; daily_goal_ml: number; streak_days: number; is_me: boolean;
}
interface FamilyResp {
  family: { family_id: string; code: string; name: string; owner_id: string; members: string[] } | null;
  members: FamilyMember[];
}

const LOCAL: Record<string, Record<string, string>> = {
  tr: {
    title: 'Aile Modu', sub: 'Sevdiklerinle birlikte hedefe ulaş',
    must_signin: 'Aile Modu için giriş yapmalısın', signin_cta: 'Giriş yap',
    create_title: 'Yeni aile oluştur', create_hint: 'Bir isim ver, 6 haneli davet kodu üretelim.',
    create_btn: 'Aile oluştur', create_placeholder: 'Aile adı (örn. Aydoğdu Ailesi)',
    join_title: 'Daveti olan biri misin?', join_hint: '6 haneli kodu gir ve aileye katıl.',
    join_btn: 'Aileye katıl', join_placeholder: 'KOD',
    my_family: 'Ailem', invite_code: 'Davet kodu', copy: 'Kopyala', share: 'Paylaş',
    leaderboard: 'Bugünün lideri', members: 'Üyeler', leave: 'Aileden ayrıl',
    me: 'Sen', empty: 'Henüz üye yok',
    copied: 'Kopyalandı 🎉', shared_msg: '{name} ailesine katıl! Davet kodu: {code} — AquaPulse uygulamasında "Aileye katıl"a tıkla.',
    err_join: 'Katılım başarısız', err_create: 'Oluşturma başarısız', err_load: 'Yüklenemedi',
    sync_today: 'Bugünkü ilerlemen senkronlandı',
  },
  en: {
    title: 'Family Mode', sub: 'Reach your goals together',
    must_signin: 'Sign in to use Family Mode', signin_cta: 'Sign in',
    create_title: 'Create a new family', create_hint: 'Give it a name and we generate a 6-char invite code.',
    create_btn: 'Create family', create_placeholder: 'Family name (e.g. Smith Family)',
    join_title: 'Got an invite?', join_hint: 'Enter the 6-char code and join your family.',
    join_btn: 'Join family', join_placeholder: 'CODE',
    my_family: 'My Family', invite_code: 'Invite code', copy: 'Copy', share: 'Share',
    leaderboard: "Today's leader", members: 'Members', leave: 'Leave family',
    me: 'You', empty: 'No members yet',
    copied: 'Copied 🎉', shared_msg: 'Join the {name} family on AquaPulse! Invite code: {code}.',
    err_join: 'Join failed', err_create: 'Create failed', err_load: 'Failed to load',
    sync_today: "Today's progress synced",
  },
};
function tx(lang: string, key: string, vars?: Record<string, string>) {
  let s = (LOCAL[lang] && LOCAL[lang][key]) || LOCAL.en[key] || key;
  if (vars) Object.entries(vars).forEach(([k, v]) => { s = s.replace(`{${k}}`, v); });
  return s;
}

export default function FamilyScreen() {
  const router = useRouter();
  const { state, palette } = useApp();
  const { user } = useAuth();
  const lang = state.settings.language;

  const [data, setData] = useState<FamilyResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<'create' | 'join' | 'leave' | null>(null);
  const [famName, setFamName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  // Compute today's progress to push to backend
  const myProgress = useMemo(() => {
    const today = todayKey();
    const hyd = totalHydrationForDay(state.entries, today);
    const goal = state.settings.dailyGoalMl;
    const percent = goal > 0 ? Math.round((hyd / goal) * 100) : 0;
    return { daily_goal_ml: goal, hydration_today_ml: hyd, percent, streak_days: (state.streakDays || []).length };
  }, [state.entries, state.settings.dailyGoalMl, state.streakDays]);

  const reload = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      // Push my today's progress (best effort), then reload
      try { await apiPost('/family/progress', myProgress); } catch {}
      const res = await apiGet<FamilyResp>('/family/me');
      setData(res);
    } catch (e: any) {
      Alert.alert(tx(lang, 'err_load'), e?.message || '');
    } finally {
      setLoading(false);
    }
  }, [user, lang, myProgress]);

  useEffect(() => { reload(); }, [reload]);

  const doCreate = async () => {
    if (busy) return;
    const name = famName.trim();
    if (!name) return;
    setBusy('create');
    try {
      await apiPost('/family/create', { name });
      setFamName('');
      await reload();
    } catch (e: any) {
      Alert.alert(tx(lang, 'err_create'), e?.message || '');
    } finally { setBusy(null); }
  };

  const doJoin = async () => {
    if (busy) return;
    const code = joinCode.trim().toUpperCase().replace(/\s+/g, '');
    if (!code) return;
    setBusy('join');
    try {
      await apiPost('/family/join', { code });
      setJoinCode('');
      await reload();
    } catch (e: any) {
      Alert.alert(tx(lang, 'err_join'), e?.message || '');
    } finally { setBusy(null); }
  };

  const doLeave = async () => {
    if (busy) return;
    setBusy('leave');
    try {
      await apiPost('/family/leave', {});
      await reload();
    } catch {} finally { setBusy(null); }
  };

  const doCopy = async (code: string) => {
    try { await Clipboard.setStringAsync(code); } catch {}
    Alert.alert(tx(lang, 'copied'), code);
  };

  const doShare = async (code: string, name: string) => {
    const msg = tx(lang, 'shared_msg', { code, name });
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && (navigator as any).share) {
          await (navigator as any).share({ text: msg, title: 'AquaPulse' });
        } else {
          await Clipboard.setStringAsync(msg);
          Alert.alert(tx(lang, 'copied'), msg);
        }
      } else {
        await Share.share({ message: msg });
      }
    } catch {}
  };

  // Not signed in
  if (!user) {
    return (
      <View style={[styles.root, { backgroundColor: palette.bgPrimary }]}>
        <LinearGradient colors={palette.bgGradient} style={StyleSheet.absoluteFill} />
        <Bubbles color={`${palette.primary}55`} />
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <Header palette={palette} onBack={() => router.back()} title={tx(lang, 'title')} sub={tx(lang, 'sub')} />
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 }}>
            <View style={[styles.bigIcon, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}>
              <Users color={palette.primary} size={36} />
            </View>
            <Text style={[styles.cardTitle, { color: palette.textPrimary, textAlign: 'center' }]}>{tx(lang, 'must_signin')}</Text>
            <TouchableOpacity testID="family-signin" onPress={() => router.push('/login')} activeOpacity={0.85}>
              <LinearGradient colors={palette.primaryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
                <Text style={[styles.ctaText, { color: palette.onPrimary }]}>{tx(lang, 'signin_cta')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: palette.bgPrimary }]}>
      <LinearGradient colors={palette.bgGradient} style={StyleSheet.absoluteFill} />
      <Bubbles color={`${palette.primary}55`} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Header palette={palette} onBack={() => router.back()} title={tx(lang, 'title')} sub={tx(lang, 'sub')} />
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={palette.primary} size="large" /></View>
        ) : data?.family ? (
          <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} showsVerticalScrollIndicator={false}>
            {/* Family card */}
            <View style={[styles.card, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}>
              <Text style={[styles.cardLabel, { color: palette.textSecondary }]}>{tx(lang, 'my_family')}</Text>
              <Text style={[styles.famName, { color: palette.textPrimary }]} numberOfLines={1}>{data.family.name}</Text>
              <View style={[styles.codeBox, { borderColor: palette.primary, backgroundColor: `${palette.primary}15` }]}>
                <KeyRound color={palette.primary} size={18} />
                <Text style={[styles.codeText, { color: palette.textPrimary }]}>{data.family.code}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                <TouchableOpacity testID="family-copy" onPress={() => doCopy(data.family!.code)} style={[styles.smallBtn, { borderColor: palette.borderLight }]}>
                  <Copy color={palette.textPrimary} size={16} />
                  <Text style={[styles.smallBtnText, { color: palette.textPrimary }]}>{tx(lang, 'copy')}</Text>
                </TouchableOpacity>
                <TouchableOpacity testID="family-share" onPress={() => doShare(data.family!.code, data.family!.name)} style={[styles.smallBtn, { borderColor: palette.borderLight }]}>
                  <Share2 color={palette.textPrimary} size={16} />
                  <Text style={[styles.smallBtnText, { color: palette.textPrimary }]}>{tx(lang, 'share')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Leaderboard */}
            <View style={[styles.card, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}>
              <Text style={[styles.cardLabel, { color: palette.textSecondary, marginBottom: 6 }]}>{tx(lang, 'leaderboard')}</Text>
              {data.members.length === 0 ? (
                <Text style={{ color: palette.textSecondary, textAlign: 'center', padding: 18 }}>{tx(lang, 'empty')}</Text>
              ) : data.members.map((m, idx) => (
                <View key={m.user_id} style={[styles.memberRow, { borderColor: palette.borderLight }, m.is_me && { backgroundColor: `${palette.primary}15`, borderColor: palette.primary }]}>
                  <View style={[styles.rank, { backgroundColor: idx === 0 ? '#FFD66B' : palette.glassBgLight }]}>
                    <Text style={{ fontWeight: '900', color: idx === 0 ? '#52340A' : palette.textPrimary, fontSize: 13 }}>{idx + 1}</Text>
                  </View>
                  {m.picture ? (
                    <Image source={{ uri: m.picture }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, { backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' }]}>
                      <Text style={{ color: palette.onPrimary, fontWeight: '800' }}>{(m.name || '?').slice(0, 1).toUpperCase()}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: palette.textPrimary, fontWeight: '700' }} numberOfLines={1}>
                      {m.name}{m.is_me ? ` · ${tx(lang, 'me')}` : ''}
                    </Text>
                    <Text style={{ color: palette.textSecondary, fontSize: 12, marginTop: 2 }}>
                      {m.hydration_today_ml} / {m.daily_goal_ml || '?'} ml · 🔥 {m.streak_days}d
                    </Text>
                    <View style={[styles.bar, { backgroundColor: palette.borderLight, marginTop: 6 }]}>
                      <View style={{ height: '100%', width: `${Math.min(100, m.percent)}%`, backgroundColor: palette.primary, borderRadius: 999 }} />
                    </View>
                  </View>
                  <Text style={{ color: palette.primary, fontWeight: '900', fontSize: 16, marginLeft: 8 }}>{m.percent}%</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity testID="family-leave" onPress={doLeave} disabled={busy === 'leave'} style={[styles.leaveBtn, { borderColor: palette.accentCoral, opacity: busy === 'leave' ? 0.5 : 1 }]}>
              <LeaveIcon color={palette.accentCoral} size={18} />
              <Text style={{ color: palette.accentCoral, fontWeight: '700' }}>{tx(lang, 'leave')}</Text>
            </TouchableOpacity>

            <Text style={{ color: palette.textMuted, fontSize: 11, textAlign: 'center' }}>{tx(lang, 'sync_today')}</Text>
            <View style={{ height: 50 }} />
          </ScrollView>
        ) : (
          // No family — create or join
          <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} showsVerticalScrollIndicator={false}>
            <View style={[styles.card, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}>
              <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>{tx(lang, 'create_title')}</Text>
              <Text style={[styles.hint, { color: palette.textSecondary }]}>{tx(lang, 'create_hint')}</Text>
              <TextInput
                testID="family-create-input"
                value={famName} onChangeText={setFamName}
                placeholder={tx(lang, 'create_placeholder')}
                placeholderTextColor={palette.textMuted}
                style={[styles.input, { backgroundColor: palette.glassBgLight, borderColor: palette.borderLight, color: palette.textPrimary }]}
              />
              <TouchableOpacity testID="family-create-btn" onPress={doCreate} disabled={busy === 'create'} activeOpacity={0.85}>
                <LinearGradient colors={palette.primaryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.cta, { opacity: busy === 'create' ? 0.6 : 1 }]}>
                  {busy === 'create' ? <ActivityIndicator color={palette.onPrimary} /> : (
                    <>
                      <Plus color={palette.onPrimary} size={18} strokeWidth={2.4} />
                      <Text style={[styles.ctaText, { color: palette.onPrimary }]}>{tx(lang, 'create_btn')}</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={[styles.card, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}>
              <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>{tx(lang, 'join_title')}</Text>
              <Text style={[styles.hint, { color: palette.textSecondary }]}>{tx(lang, 'join_hint')}</Text>
              <TextInput
                testID="family-join-input"
                value={joinCode} onChangeText={setJoinCode}
                placeholder={tx(lang, 'join_placeholder')}
                placeholderTextColor={palette.textMuted}
                autoCapitalize="characters"
                maxLength={8}
                style={[styles.input, { backgroundColor: palette.glassBgLight, borderColor: palette.borderLight, color: palette.textPrimary, letterSpacing: 4, textAlign: 'center', fontSize: 22, fontWeight: '900' }]}
              />
              <TouchableOpacity testID="family-join-btn" onPress={doJoin} disabled={busy === 'join'} activeOpacity={0.85}>
                <LinearGradient colors={palette.primaryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.cta, { opacity: busy === 'join' ? 0.6 : 1 }]}>
                  {busy === 'join' ? <ActivityIndicator color={palette.onPrimary} /> : (
                    <>
                      <Users color={palette.onPrimary} size={18} strokeWidth={2.4} />
                      <Text style={[styles.ctaText, { color: palette.onPrimary }]}>{tx(lang, 'join_btn')}</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <View style={{ height: 50 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

function Header({ palette, onBack, title, sub }: any) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={[styles.iconBtn, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}>
        <ArrowLeft color={palette.textPrimary} size={20} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={{ color: palette.textPrimary, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 }}>{title}</Text>
        <Text style={{ color: palette.textSecondary, fontSize: 12, marginTop: 2 }}>{sub}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, gap: 12 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  bigIcon: { width: 96, height: 96, borderRadius: 48, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  card: { padding: 16, borderRadius: 18, borderWidth: 1, gap: 8 },
  cardLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  cardTitle: { fontSize: 17, fontWeight: '800' },
  hint: { fontSize: 13, lineHeight: 18 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginTop: 6 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 999, marginTop: 6 },
  ctaText: { fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  famName: { fontSize: 22, fontWeight: '900' },
  codeBox: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1.5, marginTop: 8 },
  codeText: { fontSize: 22, fontWeight: '900', letterSpacing: 6 },
  smallBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  smallBtnText: { fontSize: 13, fontWeight: '700' },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 14, borderWidth: 1, marginTop: 8 },
  rank: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  bar: { height: 6, borderRadius: 999, overflow: 'hidden' },
  leaveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 999, borderWidth: 1 },
});
