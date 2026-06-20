import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, Animated, PanResponder,
  Dimensions, ScrollView, Image, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, FontFamily } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStore } from '@/store/useStore';

// ── Layout constants ──────────────────────────────────────────
const { width: W } = Dimensions.get('window');
const KNOB = 56;
const PAD_H = 20;                          // screen horizontal padding
const KNOB_MAX = W - PAD_H * 2 - 8 * 2 - KNOB; // track inner pad 8 each side

// ── Helpers ───────────────────────────────────────────────────
const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

type SoundId = 'off' | 'rain' | 'forest' | 'cafe' | 'waves';

const SOUNDS: { id: SoundId; label: string }[] = [
  { id: 'off',    label: 'Silence' },
  { id: 'rain',   label: 'Rain'    },
  { id: 'forest', label: 'Forest'  },
  { id: 'cafe',   label: 'Café'    },
  { id: 'waves',  label: 'Ocean'   },
];

function SoundIcon({ id, size = 15, color }: { id: SoundId; size?: number; color: string }) {
  if (id === 'off')    return <Feather name="volume-x"    size={size} color={color} />;
  if (id === 'rain')   return <Feather name="cloud-rain"  size={size} color={color} />;
  if (id === 'forest') return <MaterialCommunityIcons name="pine-tree" size={size} color={color} />;
  if (id === 'cafe')   return <MaterialCommunityIcons name="coffee"    size={size} color={color} />;
  return <MaterialCommunityIcons name="waves" size={size} color={color} />;
}

// ── Celebration Screen ────────────────────────────────────────
interface CelebrationProps {
  xp: number;
  title: string;
  steps: { done: boolean }[];
  project: string;
  minutes: number;
  onNext: () => void;
}

function CelebrationScreen({ xp, title, steps, project, onNext }: CelebrationProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const user = useStore(s => s.user);

  const scale     = useRef(new Animated.Value(0)).current;
  const fade      = useRef(new Animated.Value(0)).current;
  const xpBar     = useRef(new Animated.Value(0)).current;
  // Shine starts off-screen left, sweeps right, loops
  const SHINE_W   = 70;
  const BAR_W     = W - 40 - 36; // screen pad (20×2) + card pad (18×2)
  const shineAnim = useRef(new Animated.Value(-SHINE_W)).current;

  const xpFill = Math.min(1, user.xp / user.xpMax);

  useEffect(() => {
    Animated.sequence([
      Animated.delay(80),
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 150, useNativeDriver: true }),
    ]).start();
    Animated.sequence([
      Animated.delay(350),
      Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
    // Bar fills over 1000ms starting at 750ms → completes at ~1750ms
    Animated.sequence([
      Animated.delay(750),
      Animated.timing(xpBar, { toValue: xpFill, duration: 1000, useNativeDriver: false }),
    ]).start();
    // Shine sweeps across after bar is full, then loops every ~3s
    Animated.sequence([
      Animated.delay(1900),
      Animated.loop(
        Animated.sequence([
          Animated.timing(shineAnim, {
            toValue: BAR_W + SHINE_W,
            duration: 850,
            useNativeDriver: true,
          }),
          Animated.delay(2200),
          // Instant reset to off-screen left
          Animated.timing(shineAnim, { toValue: -SHINE_W, duration: 0, useNativeDriver: true }),
        ])
      ),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={[cel.safe, { backgroundColor: c.background }]}>
      {/* V1: radial-gradient(80% 50% at 50% 0%, var(--primary-soft), transparent 60%) */}
      <LinearGradient
        colors={['rgba(251,92,92,0.14)', 'rgba(251,92,92,0.06)', 'transparent']}
        locations={[0, 0.4, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFill, { height: '50%' }]}
        pointerEvents="none"
      />

      <ScrollView contentContainerStyle={cel.scroll} showsVerticalScrollIndicator={false}>
        {/* Checkmark + level badge in one container so badge is always on top */}
        <View style={cel.checkWrap}>
          <Animated.View style={[cel.checkOuter, { transform: [{ scale }] }]}>
            <View style={cel.checkCircle}>
              <Feather name="check" size={52} color="#fff" strokeWidth={3} />
            </View>
          </Animated.View>
          {/* Badge absolutely overlaps the bottom of the circle — zIndex keeps it above */}
          <Animated.View style={[cel.lvlBadge, { opacity: fade }]}>
            <View style={[cel.lvlTag, { backgroundColor: c.greenSoft, borderColor: Colors.green + '40' }]}>
              <Feather name="star" size={11} color={Colors.green} />
              <Text style={[cel.lvlText, { color: Colors.green }]}>Level {user.level}</Text>
            </View>
          </Animated.View>
        </View>

        <Animated.View style={{ opacity: fade, alignItems: 'center', width: '100%' }}>
          <Text style={[cel.title, { color: c.ink }]}>Quest Complete!</Text>
          <Text style={[cel.sub, { color: c.muted }]}>Nicely done, hero. The grind pays off.</Text>

          {/* XP Gained */}
          <View style={{ width: '100%', marginTop: 32 }}>
            <View style={cel.xpHeader}>
              <Text style={[cel.eyebrow, { color: Colors.primary }]}>XP Gained</Text>
              <Text style={[cel.xpNum, { color: c.ink }]}>+{xp} XP</Text>
            </View>
            <View style={[cel.barTrack, { backgroundColor: c.surface2 }]}>
              <Animated.View
                style={[
                  cel.barFill,
                  {
                    width: xpBar.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                    backgroundColor: Colors.amber,
                    overflow: 'hidden',
                  },
                ]}
              >
                {/* Sweeping shine — clipped to filled area by overflow:hidden */}
                <Animated.View
                  style={[
                    cel.barShine,
                    {
                      transform: [
                        { skewX: '-18deg' },
                        { translateX: shineAnim },
                      ],
                    },
                  ]}
                />
              </Animated.View>
            </View>
            <Text style={[cel.barCaption, { color: c.faint }]}>
              {user.xp.toLocaleString()} / {user.xpMax.toLocaleString()} TO LEVEL {user.level + 1}
            </Text>
          </View>

          {/* Quest recap card */}
          <View style={[cel.card, { backgroundColor: c.surface, borderColor: c.line }]}>
            <View style={cel.cardHeader}>
              <View style={[cel.typeTag, { backgroundColor: c.primarySoft }]}>
                <MaterialCommunityIcons name="fire" size={12} color={Colors.primary} />
                <Text style={[cel.typeTagText, { color: Colors.primary }]}>Deep Work</Text>
              </View>
              <View style={cel.doneRow}>
                <Feather name="check-circle" size={14} color={Colors.green} />
                <Text style={[cel.doneText, { color: c.muted }]}>Done</Text>
              </View>
            </View>
            <Text style={[cel.cardTitle, { color: c.ink }]} numberOfLines={2}>{title}</Text>
            {project ? (
              <Text style={[cel.cardProject, { color: c.muted }]} numberOfLines={1}>{project}</Text>
            ) : null}
          </View>

          {/* Buttons */}
          <TouchableOpacity style={cel.btnPrimary} onPress={onNext} activeOpacity={0.85}>
            <Text style={cel.btnPrimaryText}>Start Next Quest</Text>
            <Feather name="arrow-right" size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[cel.btnOutline, { borderColor: c.line }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={[cel.btnOutlineText, { color: c.muted }]}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Focus Screen ──────────────────────────────────────────────
export default function FocusScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const { focus, addXp } = useStore();

  const [running, setRunning]     = useState(true);
  const [remaining, setRemaining] = useState(focus.minutes * 60);
  const [step, setStep]           = useState(() => {
    const idx = focus.steps.findIndex(s => !s.done);
    return idx >= 0 ? idx : 0;
  });
  const [selectedSound, setSelectedSound] = useState<SoundId>('rain');
  const [showSound, setShowSound] = useState(false);
  const [completed, setCompleted] = useState(false);

  const completedRef = useRef(false);

  const handleComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setRunning(false);
    addXp(focus.xp);
    setCompleted(true);
  }, [addXp, focus.xp]);

  // Countdown timer
  useEffect(() => {
    if (!running || remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(id);
          handleComplete();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, handleComplete]);

  // Swipe to complete
  const dragX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        dragX.setValue(Math.max(0, Math.min(g.dx, KNOB_MAX)));
      },
      onPanResponderRelease: (_, g) => {
        const finalX = Math.max(0, Math.min(g.dx, KNOB_MAX));
        if (finalX >= KNOB_MAX * 0.88) {
          // Snap to end then celebrate
          Animated.timing(dragX, { toValue: KNOB_MAX, duration: 80, useNativeDriver: false }).start();
          setTimeout(handleComplete, 100);
        } else {
          Animated.spring(dragX, { toValue: 0, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  if (completed) {
    return (
      <CelebrationScreen
        xp={focus.xp}
        title={focus.title}
        steps={focus.steps}
        project={focus.project}
        minutes={focus.minutes}
        onNext={() => router.back()}
      />
    );
  }

  const currentStepData = focus.steps[step];
  const doneCount = focus.steps.filter(s => s.done).length;

  // V1: var(--ink-fixed) is always the dark ink regardless of theme
  const trackBg = scheme === 'dark' ? '#1A1D28' : '#12151A';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      {/* V1: radial-gradient primary at 22% top + blue at 100% bottom */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Top: primary fades downward from top */}
        <LinearGradient
          colors={['rgba(251,92,92,0.22)', 'rgba(251,92,92,0.10)', 'transparent']}
          locations={[0, 0.38, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradTop}
        />
        {/* Bottom: blue fades upward from bottom */}
        <LinearGradient
          colors={['transparent', 'rgba(46,134,240,0.10)', 'rgba(46,134,240,0.18)']}
          locations={[0, 0.5, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradBottom}
        />
      </View>

      {/* ── Header ──────────────────────────────────────── */}
      {/* V1: padding: '54px 20px 0' — top padding accounts for status bar */}
      <View style={styles.header}>
        <View style={styles.brand}>
          <Image
            source={require('../assets/images/actyom-icon.png')}
            style={styles.brandIcon}
          />
          <Text style={[styles.brandName, { color: c.ink }]}>Actyom</Text>
        </View>
        {/* ghost iconbtn — no background, just the icon */}
        <TouchableOpacity
          style={styles.ghostBtn}
          onPress={() => { setRunning(false); router.back(); }}
          activeOpacity={0.6}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="x" size={22} color={c.ink} />
        </TouchableOpacity>
      </View>

      {/* ── Center content — flex: 1, col, centered, gap: 4 ── */}
      <View style={styles.content}>

        {/* Timer — 84px display mono */}
        <Text style={[styles.timer, { color: c.ink }]}>{fmt(remaining)}</Text>

        {/* "Focus Time" eyebrow — V1: below timer */}
        <Text style={[styles.timerEyebrow, { color: Colors.primary }]}>Focus Time</Text>

        {/* Priority tag — V1: marginTop: 28 */}
        <View style={[styles.priorityTag, { backgroundColor: Colors.blue + '22', marginTop: 28 }]}>
          <MaterialCommunityIcons name="fire" size={13} color={Colors.blue} />
          <Text style={[styles.priorityText, { color: Colors.blue }]}>
            {focus.priority}
          </Text>
        </View>

        {/* Current step title — V1: h2 display 27px, marginTop: 18, maxWidth: 320 */}
        <Text
          style={[styles.stepTitle, { color: c.ink, marginTop: 18 }]}
          numberOfLines={3}
        >
          {currentStepData?.label ?? focus.title}
        </Text>

        {/* Project name — V1: marginTop: 12, color: primary */}
        <Text style={[styles.projectName, { color: Colors.primary, marginTop: 12 }]} numberOfLines={1}>
          Project: {focus.project}
        </Text>

        {/* Step dots — V1: marginTop: 24, only if steps.length > 1 */}
        {focus.steps.length > 1 && (
          <View style={[styles.dotsRow, { marginTop: 24 }]}>
            {focus.steps.map((s, i) => {
              const isActive = i === step;
              const isDone = s.done;
              return (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => setStep(i)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                >
                  <View
                    style={[
                      styles.dot,
                      {
                        width: isActive ? 22 : 8,
                        backgroundColor: isActive
                          ? Colors.primary
                          : isDone
                          ? Colors.green
                          : c.line,
                      },
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Step hint */}
        <Text style={[styles.stepHint, { color: c.muted, marginTop: 10 }]}>
          {doneCount}/{focus.steps.length} steps complete
        </Text>

        {/* Sound chips — V1: marginTop: 22, flexWrap wrap, centered */}
        {showSound && (
          <View style={[styles.soundPanel, { marginTop: 22 }]}>
            {SOUNDS.map(s => {
              const active = selectedSound === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.soundChip,
                    {
                      backgroundColor: active ? c.primarySoft : c.surface,
                      borderColor: active ? Colors.primary : c.line,
                    },
                  ]}
                  onPress={() => setSelectedSound(s.id)}
                  activeOpacity={0.7}
                >
                  <SoundIcon id={s.id} size={14} color={active ? Colors.primary : c.ink} />
                  <Text style={[styles.soundLabel, { color: active ? Colors.primary : c.ink }]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* ── Bottom ──────────────────────────────────────── */}
      <View style={styles.bottom}>
        {/* Swipe to complete */}
        <View style={styles.swipeWrap}>
          <View
            style={[styles.swipeTrack, { backgroundColor: trackBg }]}
            {...panResponder.panHandlers}
          >
            {/* Fill layer — grows from left behind the knob as you drag */}
            <Animated.View
              style={[
                styles.swipeFill,
                {
                  // Width tracks right edge of knob: 7 (left pad) + KNOB + dragX
                  width: dragX.interpolate({
                    inputRange: [0, KNOB_MAX],
                    outputRange: [KNOB + 14, W - PAD_H * 2],
                  }),
                  // Fade in from nothing so it doesn't show before dragging starts
                  opacity: dragX.interpolate({
                    inputRange: [0, 20, KNOB_MAX],
                    outputRange: [0, 0.35, 0.80],
                  }),
                },
              ]}
              pointerEvents="none"
            />

            {/* Label — fades out as fill covers it */}
            <Animated.Text
              style={[
                styles.swipeLabel,
                {
                  opacity: dragX.interpolate({
                    inputRange: [0, KNOB_MAX * 0.5],
                    outputRange: [1, 0],
                    extrapolate: 'clamp',
                  }),
                },
              ]}
            >
              SWIPE TO COMPLETE{'  '}
              <Feather name="chevrons-right" size={14} color="rgba(255,255,255,0.55)" />
            </Animated.Text>

            {/* Knob — scales up slightly as it moves right */}
            <Animated.View
              style={[
                styles.knob,
                {
                  transform: [
                    { translateX: dragX },
                    {
                      scale: dragX.interpolate({
                        inputRange: [0, KNOB_MAX],
                        outputRange: [1, 1.12],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
              ]}
            >
              <Feather name="check" size={26} color="#fff" strokeWidth={3} />
            </Animated.View>
          </View>
        </View>

        {/* Controls — icons muted gray, active Sound highlighted primary */}
        <View style={styles.controls}>
          <CtrlBtn
            icon={running ? 'pause' : 'play'}
            label={running ? 'Pause' : 'Resume'}
            color={c.muted}
            labelColor={c.muted}
            onPress={() => setRunning(r => !r)}
          />
          <CtrlBtn
            icon="music"
            label="Sound"
            color={showSound ? Colors.primary : c.muted}
            labelColor={showSound ? Colors.primary : c.muted}
            onPress={() => setShowSound(s => !s)}
          />
          <CtrlBtn
            icon="more-horizontal"
            label="More"
            color={c.muted}
            labelColor={c.muted}
            onPress={() => {}}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function CtrlBtn({
  icon, label, color, labelColor, onPress,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  color: string;
  labelColor: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={ctrl.btn} onPress={onPress} activeOpacity={0.7}>
      <View style={ctrl.iconWrap}>
        <Feather name={icon} size={26} color={color} />
      </View>
      <Text style={[ctrl.label, { color: labelColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1 },

  // Top gradient covers top 55% of screen
  gradTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '55%',
  },
  // Bottom gradient covers bottom 50% of screen
  gradBottom: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: '50%',
  },

  // Header — V1: padding '54px 20px 0'
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PAD_H,
    paddingTop: 12,     // SafeAreaView already provides top inset
    paddingBottom: 8,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandIcon: {
    width: 30, height: 30, borderRadius: 8,
  },
  brandName: {
    fontSize: 19, fontFamily: FontFamily.displayBold, letterSpacing: -0.2,
  },
  // V1: ghost iconbtn — no background, transparent
  ghostBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },

  // Center content — V1: flex:1, col, center, gap:4, padding '0 24px'
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 4,
  },

  // Timer — V1: 84px, JetBrains Mono / fontWeight 600, letterSpacing -0.02em
  // iOS: ui-monospace = SF Mono (tabular nums, clean digit style matching JetBrains Mono look)
  // Android: SpaceGrotesk SemiBold fallback
  timer: {
    fontSize: 84,
    fontFamily: Platform.select({ ios: 'ui-monospace', default: FontFamily.displaySb }),
    fontWeight: '600',
    letterSpacing: -1.68,  // -0.02em × 84px
    lineHeight: 92,
  },

  // "Focus Time" eyebrow — V1: below timer, primary color, fontSize 13, letterSpacing 0.22em
  timerEyebrow: {
    fontSize: 13,
    fontFamily: FontFamily.extraBold,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },

  // Priority tag — V1: tag-blue, padding 8px 16px, fontSize 12
  priorityTag: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999,
  },
  priorityText: {
    fontSize: 12, fontFamily: FontFamily.bold,
  },

  // Current step — V1: h2 display 27px, textAlign center, maxWidth 320
  stepTitle: {
    fontSize: 27,
    fontFamily: FontFamily.displayBold,
    letterSpacing: -0.3,
    textAlign: 'center',
    lineHeight: 32,
    maxWidth: 320,
  },

  // Project — V1: color primary, fontWeight 700, fontSize 16
  projectName: {
    fontSize: 16, fontFamily: FontFamily.bold,
  },

  // Step dots — V1: row center, gap 8
  dotsRow: {
    flexDirection: 'row', gap: 8, alignItems: 'center',
  },
  dot: {
    height: 8, borderRadius: 999,
  },

  stepHint: {
    fontSize: 12, fontFamily: FontFamily.semiBold,
  },

  // Sound chips — V1: flexWrap wrap, centered
  soundPanel: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: 8,
  },
  soundChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 13, paddingVertical: 7,
    borderRadius: 999, borderWidth: 1.5,
  },
  soundLabel: {
    fontSize: 13, fontFamily: FontFamily.semiBold,
  },

  // Bottom container
  bottom: {
    paddingHorizontal: PAD_H,
    paddingBottom: 10,
  },

  // Swipe to complete — V1: height 70, borderRadius 999, ink-fixed bg, overflow hidden, shadow-lg
  swipeWrap: { marginBottom: 0 },
  swipeTrack: {
    position: 'relative',
    height: 70, borderRadius: 999,
    overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 10,
  },
  // Color fill that grows left→right behind the knob
  swipeFill: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    backgroundColor: Colors.primary,
    borderRadius: 999,
  },
  swipeLabel: {
    position: 'absolute',
    left: 0, right: 0,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13, fontFamily: FontFamily.extraBold,
    letterSpacing: 1.2, textTransform: 'uppercase',
    textAlign: 'center',
    paddingLeft: 40, // offset so text clears the knob
  } as const,
  knob: {
    position: 'absolute',
    left: 7, top: 7,
    width: KNOB, height: KNOB, borderRadius: KNOB / 2,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 10, elevation: 8,
  },

  // Controls
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingTop: 4,
    paddingBottom: 24,
  },
});

const ctrl = StyleSheet.create({
  btn: {
    alignItems: 'center', gap: 7, flex: 1, paddingVertical: 8,
  },
  iconWrap: {
    width: 30, height: 30, alignItems: 'center', justifyContent: 'center',
  },
  label: {
    fontSize: 13, fontFamily: FontFamily.semiBold,
  },
});

// ── Celebration Styles ────────────────────────────────────────
const cel = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 44,
  },

  // Wrapper contains both circle + badge so badge is always rendered above
  checkWrap: {
    alignItems: 'center',
    marginBottom: 18,
  },
  // Checkmark
  checkOuter: {
    shadowColor: Colors.green, shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35, shadowRadius: 28, elevation: 14,
    zIndex: 1,
  },
  checkCircle: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: Colors.green,
    alignItems: 'center', justifyContent: 'center',
  },

  // Badge absolutely placed at the bottom-center of the circle
  // V1: marginTop: -14 (overlaps 14px into the circle bottom)
  lvlBadge: {
    position: 'absolute',
    bottom: -14,
    alignItems: 'center',
    zIndex: 20,
    elevation: 20,
  },
  lvlTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
    borderWidth: 1,
  },
  lvlText: {
    fontSize: 11, fontFamily: FontFamily.extraBold, letterSpacing: 0.5,
  },

  // Text
  title: {
    fontSize: 36, fontFamily: FontFamily.displayBold,
    letterSpacing: -0.8, textAlign: 'center', marginTop: 4, marginBottom: 8,
  },
  sub: {
    fontSize: 16, fontFamily: FontFamily.semiBold,
    textAlign: 'center', lineHeight: 22, marginBottom: 0,
  },

  // XP section
  xpHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 10,
  },
  eyebrow: {
    fontSize: 11, fontFamily: FontFamily.extraBold,
    letterSpacing: 2, textTransform: 'uppercase',
  },
  xpNum: {
    fontSize: 22, fontFamily: FontFamily.displayBold, letterSpacing: -0.3,
  },
  barTrack: {
    height: 14, borderRadius: 99, overflow: 'hidden', position: 'relative',
  },
  barFill: {
    height: 14, borderRadius: 99,
  },
  // Sweeping shine highlight inside the filled bar
  barShine: {
    position: 'absolute',
    top: 0, bottom: 0,
    width: 70,
    backgroundColor: 'rgba(255,255,255,0.40)',
    borderRadius: 40,
  },
  barCaption: {
    fontSize: 12, fontFamily: FontFamily.medium,
    textAlign: 'right', marginTop: 10, letterSpacing: 0.8,
  },

  // Quest card
  card: {
    width: '100%', borderRadius: 20, padding: 18,
    borderWidth: 1, marginTop: 26,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12,
  },
  typeTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
  },
  typeTagText: {
    fontSize: 11, fontFamily: FontFamily.extraBold, letterSpacing: 0.5,
  },
  doneRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto',
  },
  doneText: {
    fontSize: 13, fontFamily: FontFamily.bold,
  },
  cardTitle: {
    fontSize: 21, fontFamily: FontFamily.displayBold,
    letterSpacing: -0.2, lineHeight: 26,
  },
  cardProject: {
    fontSize: 13.5, fontFamily: FontFamily.semiBold, marginTop: 6,
  },

  // Buttons
  btnPrimary: {
    width: '100%', height: 54, borderRadius: 16,
    backgroundColor: Colors.primary,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 28,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 14, elevation: 6,
  },
  btnPrimaryText: {
    color: '#fff', fontSize: 16, fontFamily: FontFamily.bold,
  },
  btnOutline: {
    width: '100%', height: 50, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, marginTop: 12,
  },
  btnOutlineText: {
    fontSize: 15, fontFamily: FontFamily.semiBold,
  },
});
