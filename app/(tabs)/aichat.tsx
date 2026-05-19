import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Modal, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, Send, Trash2, MessageCircleQuestion, Plus, X } from 'lucide-react-native';
import { useApp } from '../../src/AppContext';
import { useAuth } from '../../src/AuthContext';
import { apiPost, apiGet, apiDelete } from '../../src/api';
import Bubbles from '../../src/components/Bubbles';

interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp?: string;
}

const QUICK_PROMPTS_TR = [
  'Günde 1 bardak fazla içersem böbreklerime ne olur?',
  '4-7-8 nefes su emilimini nasıl etkiler?',
  'Elektrolit (Na, K, Mg) dengesi neden önemli?',
  'Antrenmandan 30 dk önce ne tip su içmeliyim?',
  'Kahve diüretik mi, gerçekten su açığı yaratır mı?',
  'Susuzluk hafıza ve odağı hangi mekanizmayla düşürür?',
];
const QUICK_PROMPTS_EN = [
  'What happens to my kidneys with +1 extra glass daily?',
  'How does 4-7-8 breathing aid water absorption?',
  'Why is Na/K/Mg balance critical?',
  'What type of water 30 min before workout?',
  'Is coffee really diuretic and dehydrating?',
  'By what mechanism does thirst impair focus & memory?',
];

export default function AIChatScreen() {
  const { palette, t, state } = useApp();
  const { user } = useAuth();
  const lang = state.settings.language;
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHist, setLoadingHist] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [promptsOpen, setPromptsOpen] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);

  const quickPrompts = useMemo(() => (lang === 'tr' ? QUICK_PROMPTS_TR : QUICK_PROMPTS_EN), [lang]);

  const loadHistory = async () => {
    try {
      setLoadingHist(true);
      const res = await apiGet<{ messages: ChatMsg[] }>('/chat/history');
      setMessages(res.messages || []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingHist(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user?.user_id]);

  // When the app language changes, wipe the chat so the AI starts fresh in the new language
  const prevLangRef = useRef<string>(lang);
  useEffect(() => {
    if (prevLangRef.current && prevLangRef.current !== lang) {
      (async () => {
        try { await apiDelete('/chat/history'); } catch {}
        setMessages([]);
      })();
    }
    prevLangRef.current = lang;
  }, [lang]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
  }, [messages.length]);

  const sendMsg = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setInput('');
    const tempId = `local-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, role: 'user', text: trimmed }]);
    setSending(true);
    try {
      // Build personalization context — fully on-device, no PII to LLM beyond stats
      const ctx = (() => {
        try {
          const today = new Date().toISOString().slice(0, 10);
          const todayHydration = (state.entries || []).filter((e: any) => new Date(e.timestamp).toISOString().slice(0, 10) === today).reduce((s: number, e: any) => s + (e.hydration || 0), 0);
          const goal = state.settings.dailyGoalMl;
          return {
            weight_kg: state.settings.weightKg,
            height_cm: state.settings.heightCm,
            age: state.settings.ageYears,
            gender: state.settings.gender,
            daily_goal_ml: goal,
            hydration_today_ml: todayHydration,
            percent: goal > 0 ? Math.round((todayHydration / goal) * 100) : 0,
            streak_days: (state.streakDays || []).length,
            country: state.settings.countryCode,
          };
        } catch { return undefined; }
      })();
      const res = await apiPost<{ reply: string; message_id: string }>('/chat', { message: trimmed, language: lang, context: ctx });
      setMessages((prev) => [...prev, { id: res.message_id, role: 'assistant', text: res.reply }]);
    } catch (e: any) {
      Alert.alert(lang === 'tr' ? 'Hata' : 'Error', e?.message || (lang === 'tr' ? 'İletişim hatası' : 'Network error'));
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const clearHistory = () => setConfirmOpen(true);
  const doClearConfirmed = async () => {
    setConfirmOpen(false);
    try { await apiDelete('/chat/history'); } catch {}
    setMessages([]);
  };

  return (
    <View style={[styles.root, { backgroundColor: palette.bgPrimary }]}>
      <LinearGradient colors={palette.bgGradient} style={StyleSheet.absoluteFill} />
      <Bubbles color={`${palette.primary}50`} />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: palette.overlay }]} pointerEvents="none" />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[styles.headerIcon, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}>
                <Sparkles color={palette.primary} size={22} strokeWidth={1.8} />
              </View>
              <View>
                <Text style={[styles.h1, { color: palette.textPrimary }]}>{lang === 'tr' ? 'AquaCoach' : 'AquaCoach'}</Text>
                <Text style={[styles.sub, { color: palette.textSecondary }]} numberOfLines={1}>
                  {lang === 'tr' ? 'Kişisel hidrasyon asistanın' : 'Your personal hydration assistant'}
                </Text>
              </View>
            </View>
            {messages.length > 0 && (
              <TouchableOpacity
                testID="clear-chat"
                onPress={clearHistory}
                hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                activeOpacity={0.7}
                style={[styles.iconBtn, { borderColor: palette.borderLight, backgroundColor: palette.glassBg }]}
              >
                <Trash2 color={palette.accentCoral} size={18} />
              </TouchableOpacity>
            )}
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {loadingHist ? (
              <View style={{ paddingTop: 60, alignItems: 'center' }}>
                <ActivityIndicator color={palette.primary} />
              </View>
            ) : messages.length === 0 ? (
              <View style={[styles.emptyWrap, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}>
                <MessageCircleQuestion color={palette.primary} size={36} strokeWidth={1.6} />
                <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>
                  {lang === 'tr' ? 'Sor, öğren, daha iyi içil' : 'Ask, learn, hydrate better'}
                </Text>
                <Text style={[styles.emptySub, { color: palette.textSecondary }]}>
                  {lang === 'tr'
                    ? 'Su ve sağlık hakkında her şeyi sorabilirsin. Aşağıdaki örneklerle başla:'
                    : 'Ask anything about water & wellness. Start with an example:'}
                </Text>
                <View style={{ gap: 8, marginTop: 8, width: '100%' }}>
                  {quickPrompts.map((q) => (
                    <TouchableOpacity
                      key={q}
                      testID={`quick-${q}`}
                      style={[styles.quickPrompt, { backgroundColor: palette.glassBgLight, borderColor: palette.borderLight }]}
                      onPress={() => sendMsg(q)}
                    >
                      <Text style={{ color: palette.textPrimary, fontSize: 13, fontWeight: '600' }}>{q}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              messages.map((m) => (
                <View key={m.id} style={[styles.msgRow, m.role === 'user' ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}>
                  {m.role === 'assistant' ? (
                    <View style={[styles.assistantBubble, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}>
                      <Text style={[styles.assistantText, { color: palette.textPrimary }]}>{m.text}</Text>
                    </View>
                  ) : (
                    <LinearGradient colors={palette.primaryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.userBubble}>
                      <Text style={[styles.userText, { color: palette.onPrimary }]}>{m.text}</Text>
                    </LinearGradient>
                  )}
                </View>
              ))
            )}
            {sending && (
              <View style={[styles.msgRow, { justifyContent: 'flex-start' }]}>
                <View style={[styles.assistantBubble, { backgroundColor: palette.glassBg, borderColor: palette.borderLight, flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                  <ActivityIndicator color={palette.primary} size="small" />
                  <Text style={{ color: palette.textSecondary, fontSize: 13 }}>
                    {lang === 'tr' ? 'AquaCoach yazıyor…' : 'AquaCoach is typing…'}
                  </Text>
                </View>
              </View>
            )}
            <View style={{ height: 12 }} />
          </ScrollView>

          {/* Input bar — extra bottom padding to clear the tab bar */}
          <View style={[styles.inputBar, { backgroundColor: palette.bgCard, borderTopColor: palette.borderLight }]}>
            <TouchableOpacity
              testID="open-prompts"
              onPress={() => setPromptsOpen(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.85}
              style={[styles.promptBtn, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}
            >
              <Plus color={palette.primary} size={20} strokeWidth={2.4} />
            </TouchableOpacity>
            <TextInput
              testID="chat-input"
              value={input}
              onChangeText={setInput}
              placeholder={lang === 'tr' ? 'Bir soru sor…' : 'Ask anything…'}
              placeholderTextColor={palette.textMuted}
              style={[styles.input, { backgroundColor: palette.glassBg, borderColor: palette.borderLight, color: palette.textPrimary }]}
              multiline
              maxLength={500}
              onSubmitEditing={() => sendMsg(input)}
              returnKeyType="send"
            />
            <TouchableOpacity
              testID="chat-send"
              disabled={!input.trim() || sending}
              onPress={() => sendMsg(input)}
              activeOpacity={0.85}
              style={{ opacity: !input.trim() || sending ? 0.5 : 1 }}
            >
              <LinearGradient colors={palette.primaryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sendBtn}>
                <Send color={palette.onPrimary} size={20} strokeWidth={2.4} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Confirm Clear Modal */}
      <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={() => setConfirmOpen(false)}>
        <Pressable style={styles.modalRoot} onPress={() => setConfirmOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} style={[styles.confirmCard, { backgroundColor: palette.bgCard, borderColor: palette.borderLight }]}>
            <View style={[styles.modalIconWrap, { backgroundColor: `${palette.accentCoral}22` }]}>
              <Trash2 color={palette.accentCoral} size={24} />
            </View>
            <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>
              {lang === 'tr' ? 'Sohbeti Temizle?' : 'Clear Chat?'}
            </Text>
            <Text style={[styles.modalBody, { color: palette.textSecondary }]}>
              {lang === 'tr' ? 'Tüm sohbet geçmişi kalıcı olarak silinecek.' : 'All chat history will be permanently deleted.'}
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <TouchableOpacity testID="confirm-cancel" onPress={() => setConfirmOpen(false)} activeOpacity={0.85} style={[styles.btnGhost, { borderColor: palette.borderLight }]}>
                <Text style={{ color: palette.textPrimary, fontWeight: '700' }}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity testID="confirm-clear" onPress={doClearConfirmed} activeOpacity={0.85} style={[styles.btnDanger, { backgroundColor: palette.accentCoral }]}>
                <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>{lang === 'tr' ? 'Temizle' : 'Clear'}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Quick Prompts Modal */}
      <Modal visible={promptsOpen} transparent animationType="slide" onRequestClose={() => setPromptsOpen(false)}>
        <Pressable style={styles.modalRoot} onPress={() => setPromptsOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} style={[styles.promptsSheet, { backgroundColor: palette.bgCard, borderColor: palette.borderLight }]}>
            <View style={styles.sheetHandle} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={[styles.modalTitle, { color: palette.textPrimary, marginTop: 0 }]}>
                {lang === 'tr' ? 'Daha fazla soru' : 'More questions'}
              </Text>
              <TouchableOpacity
                testID="close-prompts"
                onPress={() => setPromptsOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={[styles.iconBtn, { borderColor: palette.borderLight, backgroundColor: palette.glassBg }]}
              >
                <X color={palette.textPrimary} size={18} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalBody, { color: palette.textSecondary, marginBottom: 10 }]}>
              {lang === 'tr' ? 'Bir öneriye dokun veya kendin yaz.' : 'Tap a prompt or write your own.'}
            </Text>
            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {quickPrompts.map((q) => (
                <TouchableOpacity
                  key={q}
                  testID={`prompt-pick-${q}`}
                  activeOpacity={0.8}
                  onPress={() => { setPromptsOpen(false); sendMsg(q); }}
                  style={[styles.promptItem, { backgroundColor: palette.glassBg, borderColor: palette.borderLight }]}
                >
                  <MessageCircleQuestion color={palette.primary} size={18} />
                  <Text style={{ color: palette.textPrimary, fontSize: 13, fontWeight: '600', flex: 1 }}>{q}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 10 },
  headerIcon: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  h1: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  sub: { fontSize: 12, marginTop: 1 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 16, paddingBottom: 8 },
  emptyWrap: { borderWidth: 1, borderRadius: 22, padding: 22, alignItems: 'center', gap: 10, marginTop: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '800', textAlign: 'center' },
  emptySub: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  quickPrompt: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, borderWidth: 1 },
  msgRow: { flexDirection: 'row', marginVertical: 5, width: '100%' },
  assistantBubble: { maxWidth: '85%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, borderTopLeftRadius: 4, borderWidth: 1 },
  assistantText: { fontSize: 14, lineHeight: 20 },
  userBubble: { maxWidth: '85%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, borderTopRightRadius: 4 },
  userText: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 14, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 28 : 16, borderTopWidth: 1, marginBottom: 78 },
  input: { flex: 1, borderWidth: 1, borderRadius: 22, paddingHorizontal: 14, paddingTop: 11, paddingBottom: 11, fontSize: 14, maxHeight: 110, minHeight: 44 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  promptBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  modalRoot: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 22 },
  confirmCard: { width: '100%', maxWidth: 360, padding: 20, borderRadius: 22, borderWidth: 1, alignItems: 'center' },
  modalIconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginTop: 4, textAlign: 'center' },
  modalBody: { fontSize: 13, lineHeight: 18, marginTop: 6, textAlign: 'center' },
  btnGhost: { flex: 1, paddingVertical: 12, borderRadius: 999, borderWidth: 1, alignItems: 'center' },
  btnDanger: { flex: 1, paddingVertical: 12, borderRadius: 999, alignItems: 'center' },
  promptsSheet: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 18, paddingBottom: 28, borderTopLeftRadius: 26, borderTopRightRadius: 26, borderWidth: 1 },
  sheetHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.25)', marginBottom: 10 },
  promptItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
});
