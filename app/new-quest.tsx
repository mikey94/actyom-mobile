import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, StatusBar, Animated,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, FontFamily, CATS, CatKey } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import * as Haptics from 'expo-haptics';

// ── Suggested quests ─────────────────────────────────────────────
const SUGGESTED = [
  { ctx: 'OFFICE',  icon: 'map-marker-outline', color: '#2E86F0', title: 'Print Q3 Report' },
  { ctx: 'EVENING', icon: 'clock-outline',       color: '#7C5CFC', title: 'Read 10 pages'  },
  { ctx: 'MORNING', icon: 'coffee-outline',      color: '#F6943B', title: 'Plan the day'   },
  { ctx: 'HOME',    icon: 'home-outline',        color: '#1FB07D', title: 'Tidy workspace' },
];

// ── XP type grid ─────────────────────────────────────────────────
const XP_TYPES = [
  { id: 'deep',  label: 'Deep Work',   icon: 'fire',           color: '#FB5C5C' },
  { id: 'quick', label: 'Quick Win',   icon: 'lightning-bolt',  color: '#F4B740' },
  { id: 'maint', label: 'Maintenance', icon: 'shield-outline',  color: '#6A7787' },
  { id: 'boss',  label: 'Boss Battle', icon: 'crown',           color: '#7C5CFC' },
] as const;

type XPTypeId = typeof XP_TYPES[number]['id'];

// ── Category icons (MaterialCommunityIcons) ───────────────────────
const CAT_MCO: Record<string, string> = {
  Health:   'heart-pulse',
  Learning: 'book-open-outline',
  Work:     'briefcase-outline',
  Mindful:  'white-balance-sunny',
  Admin:    'email-outline',
};

// ── AI fallback tasks ─────────────────────────────────────────────
interface AITask { title: string; minutes: number; category: CatKey }

function fallbackTasks(goal: string): AITask[] {
  return [
    { title: 'Outline the approach & goals',                minutes: 15, category: 'Work'  },
    { title: `Draft core of "${goal.slice(0, 22)}…"`,       minutes: 30, category: 'Work'  },
    { title: 'Review, refine & polish',                      minutes: 20, category: 'Work'  },
    { title: 'Share & collect feedback',                     minutes: 10, category: 'Admin' },
  ];
}

// ── Loading dots ──────────────────────────────────────────────────
function AiDots() {
  const anims = [useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current];

  useEffect(() => {
    const makeAnim = (a: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(a, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(a, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      );
    const all = anims.map((a, i) => makeAnim(a, i * 200));
    all.forEach(a => a.start());
    return () => all.forEach(a => a.stop());
  }, []);

  return (
    <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
      {anims.map((a, i) => (
        <Animated.View
          key={i}
          style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.purple, opacity: a }}
        />
      ))}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────
export default function NewQuestScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const { addMission } = useStore();

  const [text, setText] = useState('');
  const [xpType, setXpType] = useState<XPTypeId>('deep');
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<AITask[] | null>(null);

  const inputRef = useRef<TextInput>(null);
  const voiceInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Auto-focus input
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  // Pulse ring animation for voice button
  useEffect(() => {
    if (listening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0, duration: 0,    useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(0);
    }
  }, [listening]);

  const pulseScale   = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1,   1.55] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0   ] });

  // Simulate voice input
  const startVoice = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setListening(true);
    setText('');
    const phrase = 'Prepare slides for the Monday client review';
    let i = 0;
    voiceInterval.current = setInterval(() => {
      i++;
      setText(phrase.slice(0, i));
      if (i >= phrase.length) {
        clearInterval(voiceInterval.current!);
        setTimeout(() => setListening(false), 400);
      }
    }, 38);
  };

  const stopVoice = () => {
    if (voiceInterval.current) clearInterval(voiceInterval.current);
    setListening(false);
  };

  // Simulated AI breakdown (fallback — no real API in mobile)
  const breakdown = () => {
    if (!text.trim()) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    setTasks(null);
    setTimeout(() => {
      setTasks(fallbackTasks(text.trim()));
      setLoading(false);
    }, 1600);
  };

  const xpFor = (mins: number) => Math.max(50, Math.round((mins || 20) * 8 / 10) * 10);

  const createSingle = () => {
    if (!text.trim()) return;
    const typeInfo = XP_TYPES.find(t => t.id === xpType)!;
    const xpMap: Record<XPTypeId, number> = { deep: 400, quick: 80, maint: 150, boss: 1200 };
    addMission({ title: text.trim(), cat: 'Work', xp: xpMap[xpType] });
    router.back();
  };

  const createBreakdown = () => {
    if (!tasks) return;
    tasks.forEach(t =>
      addMission({ title: t.title, cat: t.category, xp: xpFor(t.minutes) })
    );
    router.back();
  };

  const hasText = text.trim().length > 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <View style={styles.header}>
          {/* X close */}
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: c.surface, borderColor: c.line }]}
            onPress={() => router.back()}
            activeOpacity={0.75}
          >
            <Feather name="x" size={20} color={c.ink} />
          </TouchableOpacity>

          {/* NEW QUEST badge */}
          <View style={styles.newQuestBadge}>
            <MaterialCommunityIcons name="creation" size={14} color={Colors.primary} />
            <Text style={styles.newQuestText}>NEW QUEST</Text>
          </View>

          {/* Submit arrow */}
          <TouchableOpacity
            style={[styles.headerBtn, styles.headerBtnDark]}
            onPress={createSingle}
            activeOpacity={0.75}
          >
            <Feather name="arrow-up" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Text input ──────────────────────────────────── */}
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder="What needs doing?"
            placeholderTextColor={c.faint}
            multiline
            style={[styles.input, { color: c.ink }]}
            returnKeyType="default"
          />

          {/* ── Voice + AI buttons ───────────────────────────── */}
          <View style={styles.actionRow}>
            {/* Voice button */}
            <TouchableOpacity
              onPress={listening ? stopVoice : startVoice}
              activeOpacity={0.85}
              style={styles.voiceBtnWrap}
            >
              {/* Pulse ring */}
              {listening && (
                <Animated.View
                  style={[
                    styles.pulseRing,
                    { borderColor: Colors.primary, transform: [{ scale: pulseScale }], opacity: pulseOpacity },
                  ]}
                />
              )}
              <View style={[styles.voiceBtn, { backgroundColor: listening ? c.ink : Colors.primary }]}>
                <Feather name={listening ? 'square' : 'mic'} size={24} color="#fff" />
              </View>
            </TouchableOpacity>

            {/* AI breakdown button */}
            <TouchableOpacity
              style={[
                styles.aiBtn,
                {
                  borderColor: hasText ? Colors.purple : c.line,
                  backgroundColor: hasText ? c.purpleSoft : c.surface2,
                  opacity: loading ? 0.7 : 1,
                },
              ]}
              onPress={breakdown}
              disabled={!hasText || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <>
                  <AiDots />
                  <Text style={[styles.aiBtnText, { color: Colors.purple }]}>  Thinking…</Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons name="auto-fix" size={19} color={hasText ? Colors.purple : c.faint} />
                  <Text style={[styles.aiBtnText, { color: hasText ? Colors.purple : c.faint }]}>
                    Break it down with AI
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Status hint */}
          <Text style={[styles.statusHint, { color: c.faint }]}>
            {listening
              ? '● Listening… speak your quest'
              : 'Type, speak, or let AI split a big goal into quests'}
          </Text>

          {/* ── AI breakdown result ──────────────────────────── */}
          {tasks && (
            <Card style={styles.breakdownCard}>
              <View style={[styles.between, { marginBottom: 12 }]}>
                <View style={styles.row}>
                  <MaterialCommunityIcons name="creation" size={15} color={Colors.purple} />
                  <Text style={[styles.breakdownTitle, { color: Colors.purple }]}> AI Sub-Quests</Text>
                </View>
                <Text style={[styles.breakdownCount, { color: c.muted }]}>{tasks.length} steps</Text>
              </View>
              <View style={{ gap: 10 }}>
                {tasks.map((t, i) => {
                  const cat = CATS[t.category] ?? CATS.Work;
                  const softBg = c[cat.softKey as keyof typeof c] as string;
                  return (
                    <View key={i} style={styles.row}>
                      <View style={[styles.subQuestIcon, { backgroundColor: softBg }]}>
                        <MaterialCommunityIcons
                          name={CAT_MCO[t.category] as any}
                          size={15}
                          color={cat.color}
                        />
                      </View>
                      <Text style={[styles.subQuestTitle, { color: c.ink }]} numberOfLines={2}>
                        {t.title}
                      </Text>
                      <Text style={[styles.subQuestMins, { color: c.muted }]}>{t.minutes}m</Text>
                    </View>
                  );
                })}
              </View>
              <TouchableOpacity
                style={[styles.createBreakdownBtn, { backgroundColor: Colors.primary }]}
                onPress={createBreakdown}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="layers-triple-outline" size={16} color="#fff" />
                <Text style={styles.createBreakdownText}>Create {tasks.length} quests</Text>
              </TouchableOpacity>
            </Card>
          )}

          {/* ── Suggested quests ─────────────────────────────── */}
          {!tasks && (
            <>
              <Text style={[styles.eyebrow, { color: c.faint }]}>Suggested Quests</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestedScroll}
              >
                {SUGGESTED.map((s, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.suggestedCard, { backgroundColor: c.surface, borderColor: c.line }]}
                    onPress={() => setText(s.title)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.suggestedIcon, { backgroundColor: c.surface2 }]}>
                      <MaterialCommunityIcons name={s.icon as any} size={16} color={s.color} />
                    </View>
                    <View>
                      <Text style={[styles.suggestedCtx, { color: c.faint }]}>{s.ctx}</Text>
                      <Text style={[styles.suggestedTitle, { color: c.ink }]}>{s.title}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {/* ── XP Type grid ─────────────────────────────────── */}
          <Text style={[styles.eyebrow, { color: c.faint, marginTop: 24 }]}>XP Type</Text>
          <View style={styles.xpGrid}>
            {XP_TYPES.map((t) => {
              const active = xpType === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.xpCard,
                    {
                      borderColor:     active ? t.color : c.line,
                      backgroundColor: active ? c.surface2 : 'transparent',
                    },
                  ]}
                  onPress={() => setXpType(t.id)}
                  activeOpacity={0.75}
                >
                  <MaterialCommunityIcons name={t.icon as any} size={18} color={active ? t.color : c.muted} />
                  <Text style={[styles.xpCardLabel, { color: active ? t.color : c.ink2 }]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Create Quest button ───────────────────────────── */}
          <TouchableOpacity
            style={[styles.createBtn, { opacity: hasText ? 1 : 0.45 }]}
            onPress={createSingle}
            disabled={!hasText}
            activeOpacity={0.85}
          >
            <Feather name="plus" size={18} color="#fff" />
            <Text style={styles.createBtnText}>Create Quest</Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },

  // header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8,
  },
  headerBtn: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  headerBtnDark: {
    backgroundColor: '#12151A', borderColor: '#12151A',
  },
  newQuestBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: '#12151A',
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999,
  },
  newQuestText: {
    color: '#fff', fontFamily: FontFamily.extraBold,
    fontSize: 12.5, letterSpacing: 1,
  },

  // input
  input: {
    fontFamily: FontFamily.displayBold,
    fontSize: 30, lineHeight: 36,
    letterSpacing: -0.3,
    marginTop: 14, marginBottom: 20,
    minHeight: 72,
  },

  // voice + AI row
  actionRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  voiceBtnWrap: { position: 'relative', width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  pulseRing: {
    position: 'absolute',
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 2,
  },
  voiceBtn: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.36, shadowRadius: 12, elevation: 6,
  },
  aiBtn: {
    flex: 1, height: 60, borderRadius: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, gap: 9,
  },
  aiBtnText: { fontFamily: FontFamily.extraBold, fontSize: 14.5 },

  // status
  statusHint: {
    textAlign: 'center', fontSize: 12.5,
    fontFamily: FontFamily.semiBold, marginTop: 12,
  },

  // AI breakdown card
  breakdownCard: { marginTop: 20, padding: 16 },
  row:    { flexDirection: 'row', alignItems: 'center', gap: 11 },
  between:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  breakdownTitle: { fontFamily: FontFamily.extraBold, fontSize: 14 },
  breakdownCount: { fontFamily: FontFamily.bold, fontSize: 12 },
  subQuestIcon: {
    width: 30, height: 30, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  subQuestTitle: { flex: 1, fontFamily: FontFamily.semiBold, fontSize: 14.5, lineHeight: 20 },
  subQuestMins: { fontFamily: FontFamily.semiBold, fontSize: 12, flexShrink: 0 },
  createBreakdownBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 16, paddingVertical: 12, borderRadius: 14,
  },
  createBreakdownText: { color: '#fff', fontFamily: FontFamily.bold, fontSize: 14.5 },

  // suggested
  eyebrow: {
    fontFamily: FontFamily.bold, fontSize: 11,
    textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 24, marginBottom: 12,
  },
  suggestedScroll: { gap: 12, paddingBottom: 4, paddingRight: 4 },
  suggestedCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 18, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  suggestedIcon: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  suggestedCtx: {
    fontFamily: FontFamily.bold, fontSize: 9.5,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  suggestedTitle: { fontFamily: FontFamily.bold, fontSize: 14, marginTop: 2 },

  // XP type grid
  xpGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  xpCard: {
    flexDirection: 'row', alignItems: 'center', gap: 9,
    width: '47.5%',
    padding: 14, borderRadius: 16, borderWidth: 1.5,
  },
  xpCardLabel: { fontFamily: FontFamily.extraBold, fontSize: 14.5 },

  // create button
  createBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
    marginTop: 22, backgroundColor: Colors.primary,
    paddingVertical: 17, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.36, shadowRadius: 16, elevation: 6,
  },
  createBtnText: { color: '#fff', fontFamily: FontFamily.bold, fontSize: 16 },
});
