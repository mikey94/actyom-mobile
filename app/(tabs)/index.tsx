import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, SafeAreaView,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, FontFamily } from '@/constants/theme';
import { useStore, MOODS, CAL_EVENTS, MoodId } from '@/store/useStore';
import { XPBar } from '@/components/ui/XPBar';
import { SectionHead } from '@/components/ui/SectionHead';
import { MissionRow } from '@/components/ui/MissionRow';
import { Card } from '@/components/ui/Card';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

function fmtHour(h: number) {
  const hr = Math.floor(h);
  const min = Math.round((h - hr) * 60);
  const ap = hr >= 12 ? 'PM' : 'AM';
  const h12 = hr % 12 === 0 ? 12 : hr % 12;
  return `${h12}:${min.toString().padStart(2, '0')} ${ap}`;
}

function aiLineFor(moodId: MoodId, first: string) {
  const map: Record<MoodId, string> = {
    great: `You're charged up. Perfect window to crush a Boss Battle.`,
    good:  `Solid energy today. I lined up your top 3 quests.`,
    meh:   `Feeling neutral? Let's start with one Quick Win to build momentum.`,
    tired: `Low battery detected. I trimmed today to the essentials.`,
    stress:`Let's lighten the load — I paused 2 low-priority quests for you.`,
  };
  return map[moodId] ?? `I've sorted today's quests by impact. Ready when you are, ${first}.`;
}

interface StatBarProps {
  icon: keyof typeof Feather.glyphMap;
  color: string;
  label: string;
  value: number;
  max: number;
  variant: 'xp' | 'hp' | 'amber';
  hint?: string;
  shine?: boolean;
}

function StatBar({ icon, color, label, value, max, variant, hint, shine }: StatBarProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  return (
    <View>
      <View style={styles.statRow}>
        <View style={styles.statLabel}>
          <Feather name={icon} size={17} color={color} />
          <Text style={[styles.statLabelText, { color: c.ink }]}>{label}</Text>
        </View>
        <Text style={[styles.statValue, { color: c.muted }]}>
          {value.toLocaleString()} / {max.toLocaleString()}
        </Text>
      </View>
      <XPBar value={value} max={max} variant={variant} height={10} shine={shine} />
      {hint && <Text style={[styles.hint, { color: c.faint }]}>{hint}</Text>}
    </View>
  );
}

export default function HomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const { user, missions, focus, mood, toggleMission } = useStore();
  const moodObj = MOODS.find((m) => m.id === mood);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Top bar */}
      <View style={[styles.topbar, { borderBottomColor: c.line }]}>
        <View style={styles.topbarLeft}>
          <View style={[styles.avatarRing, { borderColor: Colors.primary }]}>
            <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
              <Text style={styles.avatarText}>{user.first.charAt(0)}</Text>
            </View>
            <View style={[styles.lvlBadge, { backgroundColor: Colors.primary }]}>
              <Text style={styles.lvlText}>LV {user.level}</Text>
            </View>
          </View>
          <Text style={[styles.brandName, { color: Colors.primary }]}>Actyom</Text>
        </View>
        <View style={styles.topbarRight}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: c.surface, borderColor: c.line }]}>
            <MaterialCommunityIcons name="creation" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: c.surface, borderColor: c.line }]}>
            <Feather name="bell" size={20} color={c.ink2} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting — index 0 */}
        <AnimatedSection index={0} style={styles.pad}>
          <Text style={[styles.greetSub, { color: c.muted }]}>{greeting()},</Text>
          <Text style={[styles.greetName, { color: c.ink }]}>{user.first} 👋</Text>
        </AnimatedSection>

        {/* Hero Status — index 1 */}
        <AnimatedSection index={1} style={styles.pad}>
          <Card pad>
            <View style={[styles.between, { marginBottom: 18 }]}>
              <View>
                <Text style={[styles.eyebrow, { color: c.muted }]}>GRANDMASTER PATH</Text>
                <Text style={[styles.cardTitle, { color: c.ink }]}>Hero Status</Text>
              </View>
              <View style={[styles.rankBadge, { backgroundColor: c.surface2 }]}>
                <Feather name="award" size={14} color={Colors.gold} />
                <Text style={[styles.rankText, { color: c.ink2 }]}> #{user.rank}</Text>
              </View>
            </View>
            <StatBar icon="heart" color={Colors.primary} label="Vitality (HP)"
              value={user.hp} max={user.hpMax} variant="hp" />
            <View style={{ height: 16 }} />
            <StatBar icon="zap" color={Colors.blue} label="Experience (XP)"
              value={user.xp} max={user.xpMax} variant="xp" shine
              hint={`${(user.xpMax - user.xp).toLocaleString()} XP to Level ${user.level + 1}`} />
          </Card>
        </AnimatedSection>

        {/* AI strip — index 2 */}
        <AnimatedSection index={2} style={[styles.pad, { marginTop: 18 }]}>
          <View style={[styles.aiStrip, {
            borderColor: c.line,
            backgroundColor: scheme === 'dark' ? 'rgba(124,92,252,0.1)' : 'rgba(124,92,252,0.06)',
          }]}>
            <View style={styles.aiIcon}>
              <MaterialCommunityIcons name="creation" size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.between}>
                <Text style={[styles.aiLabel, { color: Colors.purple }]}>Actyom AI</Text>
                {moodObj && <Text style={{ fontSize: 18 }}>{moodObj.emoji}</Text>}
              </View>
              <Text style={[styles.aiText, { color: c.ink }]}>
                {mood
                  ? aiLineFor(mood, user.first)
                  : `How are you feeling, ${user.first}? Tap to plan your day around your energy.`}
              </Text>
              <View style={styles.chipRow}>
                <View style={[styles.chip, { backgroundColor: c.surface }]}>
                  <Feather name={mood ? 'message-circle' : 'smile'} size={13} color={c.muted} />
                  <Text style={[styles.chipText, { color: c.muted }]}>
                    {mood ? 'Ask Actyom AI' : 'Check in'}
                  </Text>
                </View>
                <View style={[styles.chip, { backgroundColor: c.surface }]}>
                  <Feather name="calendar" size={13} color={c.muted} />
                  <Text style={[styles.chipText, { color: c.muted }]}>My day</Text>
                </View>
              </View>
            </View>
          </View>
        </AnimatedSection>

        {/* Current Focus — index 3 */}
        <AnimatedSection index={3} style={[styles.pad, { marginTop: 22 }]}>
          <SectionHead title="Current Focus" />
          <Card>
            <View style={styles.focusRow}>
              <View style={{ flex: 1, padding: 18 }}>
                <View style={[styles.row, { gap: 10, marginBottom: 14 }]}>
                  <View style={[styles.tag, { backgroundColor: c.primarySoft }]}>
                    <Feather name="zap" size={11} color={Colors.primary} />
                    <Text style={[styles.tagText, { color: Colors.primary }]}>{focus.tag}</Text>
                  </View>
                  <View style={styles.row}>
                    <Feather name="clock" size={13} color={Colors.blue} />
                    <Text style={[styles.tagText, { color: Colors.blue, marginLeft: 4 }]}>{focus.minutes}:00</Text>
                  </View>
                </View>
                <Text style={[styles.focusTitle, { color: c.ink }]}>{focus.title}</Text>
                <Text style={[styles.focusSub, { color: c.muted }]}>
                  {focus.steps.filter((s) => s.done).length}/{focus.steps.length} steps · {focus.project}
                </Text>
                <TouchableOpacity
                  style={styles.enterBtn}
                  activeOpacity={0.85}
                  onPress={() => router.push('/focus')}
                >
                  <Feather name="play" size={16} color="#fff" />
                  <Text style={styles.enterBtnText}>Enter Focus</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.focusCover, { backgroundColor: c.surface3 }]} />
            </View>
          </Card>
        </AnimatedSection>

        {/* Your Day — index 4 */}
        <AnimatedSection index={4} style={[styles.pad, { marginTop: 22 }]}>
          <SectionHead title="Your Day" action="Calendar" onAction={() => router.push('/calendar')} />
          <Card pad>
            <View style={{ gap: 12 }}>
              {CAL_EVENTS.slice(0, 2).map((ev) => (
                <View key={ev.id} style={styles.calRow}>
                  <Text style={[styles.calTime, { color: c.muted }]}>{fmtHour(ev.start)}</Text>
                  <View style={[styles.calDot, { backgroundColor: ev.color }]} />
                  <Text style={[styles.calTitle, { color: c.ink }]} numberOfLines={1}>{ev.title}</Text>
                  <View style={[styles.calTag, { backgroundColor: c.surface2 }]}>
                    <Text style={[styles.calTagText, { color: c.muted }]}>{ev.cal}</Text>
                  </View>
                </View>
              ))}
              <View style={[styles.aiBlock, { backgroundColor: c.primarySoft }]}>
                <Text style={[styles.calTime, { color: Colors.primary, fontWeight: '700' }]}>9:30</Text>
                <MaterialCommunityIcons name="creation" size={14} color={Colors.primary} />
                <Text style={[styles.aiBlockText, { color: Colors.primary }]}>
                  90-min free block — schedule deep work?
                </Text>
                <Feather name="chevron-right" size={15} color={Colors.primary} />
              </View>
            </View>
          </Card>
        </AnimatedSection>

        {/* Daily Missions — index 5 */}
        <AnimatedSection index={5} style={[styles.pad, { marginTop: 22 }]}>
          <SectionHead title="Daily Missions" action="View All" />
          <View style={{ gap: 10 }}>
            {missions.slice(0, 4).map((m) => (
              <MissionRow key={m.id} mission={m} onToggle={toggleMission} />
            ))}
          </View>
        </AnimatedSection>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },
  pad: { paddingHorizontal: 20 },

  topbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1,
  },
  topbarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topbarRight: { flexDirection: 'row', gap: 8 },
  avatarRing: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, position: 'relative' },
  avatar: {
    width: 36, height: 36, borderRadius: 18, position: 'absolute', top: 0, left: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontFamily: FontFamily.extraBold, fontSize: 16 },
  lvlBadge: { position: 'absolute', bottom: -4, right: -4, borderRadius: 8, paddingHorizontal: 4, paddingVertical: 1 },
  lvlText: { color: '#fff', fontFamily: FontFamily.extraBold, fontSize: 8 },
  // V1: .brand-name { font-family: 'Space Grotesk'; font-weight: 700; font-size: 22px; color: primary; letter-spacing: -0.01em }
  brandName: { fontSize: 22, fontFamily: FontFamily.displayBold, letterSpacing: -0.2 },
  // V1: .iconbtn { width: 42px; height: 42px; border-radius: 50%; background: surface; border: 1px solid line; box-shadow: shadow-sm }
  iconBtn: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },

  greetSub: { fontSize: 15, fontFamily: FontFamily.semiBold, marginTop: 18 },
  // V1: <h1 className="display"> = Space Grotesk 700
  greetName: { fontSize: 28, fontFamily: FontFamily.displayBold, letterSpacing: -0.5, marginTop: 2, marginBottom: 22 },

  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  // V1: .eyebrow { text-transform: uppercase; letter-spacing: 0.14em; font-weight: 700; font-size: 11px }
  eyebrow: { fontSize: 11, fontFamily: FontFamily.bold, letterSpacing: 1.5, textTransform: 'uppercase' as const },
  cardTitle: { fontSize: 22, fontFamily: FontFamily.displayBold, letterSpacing: -0.4, marginTop: 4 },
  rankBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  rankText: { fontSize: 13, fontFamily: FontFamily.extraBold },
  statRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 },
  statLabel: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  statLabelText: { fontSize: 15, fontFamily: FontFamily.bold },
  statValue: { fontSize: 13, fontFamily: FontFamily.semiBold },
  hint: { fontSize: 11.5, fontFamily: FontFamily.semiBold, marginTop: 6 },

  aiStrip: { borderRadius: 20, padding: 16, borderWidth: 1, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  aiIcon: {
    width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.purple, flexShrink: 0,
  },
  aiLabel: { fontSize: 11, fontFamily: FontFamily.bold, letterSpacing: 0.5 },
  aiText: { fontSize: 14, fontFamily: FontFamily.semiBold, lineHeight: 20, marginTop: 5 },
  chipRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  chipText: { fontSize: 12, fontFamily: FontFamily.semiBold },

  row: { flexDirection: 'row', alignItems: 'center' },
  focusRow: { flexDirection: 'row', alignItems: 'stretch' },
  focusTitle: { fontSize: 20, fontFamily: FontFamily.displayBold, letterSpacing: -0.4, lineHeight: 24 },
  focusSub: { fontSize: 13, fontFamily: FontFamily.semiBold, marginTop: 8 },
  focusCover: { width: 96, alignSelf: 'stretch' },
  // V1: .tag { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em }
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
  tagText: { fontSize: 11, fontFamily: FontFamily.extraBold, textTransform: 'uppercase' as const, letterSpacing: 0.7 },
  enterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    marginTop: 16, backgroundColor: Colors.primary,
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, alignSelf: 'flex-start',
  },
  enterBtnText: { color: '#fff', fontFamily: FontFamily.bold, fontSize: 14 },

  calRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  calTime: { fontSize: 12, fontFamily: FontFamily.semiBold, width: 56 },
  calDot: { width: 4, height: 28, borderRadius: 4 },
  calTitle: { flex: 1, fontSize: 14, fontFamily: FontFamily.semiBold },
  calTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  calTagText: { fontSize: 11.5, fontFamily: FontFamily.semiBold },
  aiBlock: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 12, marginTop: 2 },
  aiBlockText: { flex: 1, fontSize: 13, fontFamily: FontFamily.bold },
});
