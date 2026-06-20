import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Dimensions,
} from 'react-native';
import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, FontFamily } from '@/constants/theme';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import {
  useStore, MOODS, WEEK_PRODUCTIVITY, STAT_TILES, MOOD_WEEK, StatTile,
} from '@/store/useStore';
import { XPBar } from '@/components/ui/XPBar';
import { Card } from '@/components/ui/Card';

const SCREEN_W = Dimensions.get('window').width;
const CHART_H = 130;
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const MOOD_HEIGHT: Record<string, number> = {
  great: 100, good: 75, meh: 55, tired: 38, stress: 30,
};

// 21-day consistency heatmap values (deterministic from index)
const HEATMAP = Array.from({ length: 21 }, (_, i) => {
  const levels = [0.08, 0.2, 0.45, 0.7, 1];
  return levels[Math.floor(Math.abs(Math.sin(i * 2.3)) * 5) % 5];
});

export default function StatsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const { user } = useStore();
  const [range, setRange] = useState<'Day' | 'Week' | 'Month'>('Week');
  const [showInsight, setShowInsight] = useState(true);

  const maxV = Math.max(...WEEK_PRODUCTIVITY);
  const peakIdx = WEEK_PRODUCTIVITY.indexOf(maxV);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Top bar */}
      <View style={[styles.topbar, { borderBottomColor: c.line }]}>
        <Text style={[styles.topbarTitle, { color: c.ink }]}>Stats & Insights</Text>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
          <Text style={styles.avatarText}>{user.first.charAt(0)}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Range selector ── */}
        <AnimatedSection index={0} style={styles.pad}>
          <View style={[styles.segmentTrack, { backgroundColor: c.surface }]}>
            {(['Day', 'Week', 'Month'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.segmentBtn,
                  range === r && styles.segmentBtnActive,
                ]}
                onPress={() => setRange(r)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: range === r ? '#fff' : c.muted },
                  ]}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </AnimatedSection>

        {/* ── Level card ── */}
        <AnimatedSection index={1} style={[styles.pad, { marginTop: 16 }]}>
          <Card pad>
            <View style={styles.between}>
              <View>
                <Text style={[styles.eyebrow, { color: Colors.blue }]}>
                  Level {user.level}
                </Text>
                <Text style={[styles.levelTitle, { color: c.ink }]}>{user.title}</Text>
              </View>
              <View style={[styles.shieldBox, { backgroundColor: c.blueSoft }]}>
                <MaterialCommunityIcons name="shield-outline" size={22} color={Colors.blue} />
              </View>
            </View>
            <View style={[styles.between, { marginTop: 18, marginBottom: 9 }]}>
              <Text style={[styles.xpLabel, { color: c.muted }]}>
                {user.xp.toLocaleString()} XP
              </Text>
              <Text style={[styles.xpLabel, { color: c.muted }]}>
                {user.xpMax.toLocaleString()} XP
              </Text>
            </View>
            <XPBar value={user.xp} max={user.xpMax} variant="xp" height={10} shine />
            <View style={[styles.row, { gap: 6, marginTop: 11 }]}>
              <MaterialCommunityIcons name="star-four-points" size={13} color={Colors.blue} />
              <Text style={[styles.xpHint, { color: c.faint }]}>
                {(user.xpMax - user.xp).toLocaleString()} XP to unlock{' '}
                <Text style={{ color: c.ink2, fontWeight: '700' }}>Crystal Blueprint</Text>
              </Text>
            </View>
          </Card>
        </AnimatedSection>

        {/* ── Productivity bar chart ── */}
        <AnimatedSection index={2} style={[styles.pad, { marginTop: 16 }]}>
          <Card pad>
            <View style={styles.between}>
              <View>
                <Text style={[styles.sectionTitle, { color: c.ink }]}>Productivity</Text>
                <Text style={[styles.sectionSub, { color: c.muted }]}>
                  Tasks completed per day
                </Text>
              </View>
              <View style={[styles.trendTag, { backgroundColor: Colors.light.greenSoft }]}>
                <MaterialCommunityIcons name="trending-up" size={12} color={Colors.green} />
                <Text style={[styles.trendText, { color: Colors.green }]}> +15%</Text>
              </View>
            </View>

            <View style={[styles.chartRow, { height: CHART_H }]}>
              {WEEK_PRODUCTIVITY.map((v, i) => {
                const isPeak = i === peakIdx;
                const barH = (v / maxV) * CHART_H * 0.72;
                return (
                  <View key={i} style={styles.barCol}>
                    <Text style={[styles.barVal, { color: isPeak ? Colors.blue : c.faint }]}>
                      {v}
                    </Text>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barH,
                          backgroundColor: isPeak ? Colors.blue : c.surface3,
                          shadowColor: isPeak ? Colors.blue : 'transparent',
                          shadowOffset: { width: 0, height: 6 },
                          shadowOpacity: isPeak ? 0.3 : 0,
                          shadowRadius: 8,
                          elevation: isPeak ? 4 : 0,
                        },
                      ]}
                    />
                    <Text style={[styles.barDay, { color: isPeak ? Colors.blue : c.faint }]}>
                      {DAYS[i]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
        </AnimatedSection>

        {/* ── Stat tiles 2×2 ── */}
        <AnimatedSection index={3} style={[styles.pad, { marginTop: 16 }]}>
          <View style={styles.grid2}>
            {STAT_TILES.map((t: StatTile) => (
              <StatTileCard key={t.id} tile={t} />
            ))}
          </View>
        </AnimatedSection>

        {/* ── Mood Trends ── */}
        <AnimatedSection index={4} style={[styles.pad, { marginTop: 16 }]}>
          <Card pad>
            <View style={[styles.between, { marginBottom: 18 }]}>
              <Text style={[styles.sectionTitle, { color: c.ink }]}>Mood Trends</Text>
              <MaterialCommunityIcons name="dots-horizontal" size={20} color={c.faint} />
            </View>
            <View style={[styles.moodRow, { height: 120 }]}>
              {MOOD_WEEK.map((d, i) => {
                const mo = MOODS.find((m) => m.id === d.mood);
                const barH = mo ? (MOOD_HEIGHT[d.mood!] ?? 50) : 22;
                const isPeak = d.mood === 'great';
                return (
                  <View key={i} style={styles.moodCol}>
                    <Text
                      style={[
                        styles.moodEmoji,
                        { opacity: mo ? 1 : 0.4 },
                        isPeak && styles.moodEmojiPeak,
                      ]}
                    >
                      {mo ? mo.emoji : '·'}
                    </Text>
                    <View
                      style={[
                        styles.moodBar,
                        {
                          height: barH,
                          backgroundColor: mo ? mo.color : c.line,
                          opacity: mo ? 1 : 0.6,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.moodDay,
                        { color: isPeak ? c.ink : c.faint },
                      ]}
                    >
                      {d.day}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
        </AnimatedSection>

        {/* ── Consistency heatmap ── */}
        <AnimatedSection index={5} style={[styles.pad, { marginTop: 16 }]}>
          <Card pad>
            <View style={[styles.between, { marginBottom: 16 }]}>
              <Text style={[styles.sectionTitle, { color: c.ink }]}>Consistency</Text>
              {/* Legend */}
              <View style={styles.row}>
                {[0.12, 0.35, 0.7, 1].map((o, i) => (
                  <View
                    key={i}
                    style={[
                      styles.legendDot,
                      { backgroundColor: `rgba(251,92,92,${o})` },
                    ]}
                  />
                ))}
              </View>
            </View>
            <View style={styles.heatmap}>
              {HEATMAP.map((lv, i) => (
                <View
                  key={i}
                  style={[
                    styles.heatCell,
                    { backgroundColor: `rgba(251,92,92,${lv})` },
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.heatmapLabel, { color: c.faint }]}>
              Last 21 days activity
            </Text>
          </Card>
        </AnimatedSection>

        {/* ── AI Insight ── */}
        {showInsight && (
          <AnimatedSection index={6} style={[styles.pad, { marginTop: 16 }]}>
            <View
              style={[
                styles.insightCard,
                { backgroundColor: scheme === 'dark' ? '#1A1D24' : '#12151A' },
              ]}
            >
              <TouchableOpacity
                style={styles.insightClose}
                onPress={() => setShowInsight(false)}
              >
                <MaterialCommunityIcons name="close" size={18} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
              <View style={[styles.row, { gap: 13, alignItems: 'flex-start' }]}>
                <View style={styles.aiIcon}>
                  <MaterialCommunityIcons name="star-four-points" size={19} color="#fff" />
                </View>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.insightEyebrow}>AI Insight</Text>
                  <Text style={styles.insightText}>
                    You're{' '}
                    <Text style={styles.insightHighlight}>20% more productive</Text>
                    {' '}on Wednesday mornings. Want me to schedule deep work for tomorrow at 10 AM?
                  </Text>
                  <TouchableOpacity style={styles.insightBtn}>
                    <MaterialCommunityIcons name="calendar-plus" size={14} color="#fff" />
                    <Text style={styles.insightBtnText}> Schedule it</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </AnimatedSection>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Stat tile subcomponent ────────────────────────────────────

function StatTileCard({ tile }: { tile: StatTile }) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  return (
    <Card style={styles.tile} pad>
      <View style={styles.between}>
        <View style={[styles.tileIconBox, { backgroundColor: c.surface2 }]}>
          <MaterialCommunityIcons
            name={tile.icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={19}
            color={tile.color}
          />
        </View>
        <View style={[styles.deltaBadge, { backgroundColor: Colors.light.greenSoft }]}>
          <Text style={[styles.deltaText, { color: Colors.green }]}>{tile.delta}</Text>
        </View>
      </View>
      <Text style={[styles.tileValue, { color: c.ink }]}>{tile.value}</Text>
      <Text style={[styles.tileLabel, { color: c.muted }]}>{tile.label}</Text>
    </Card>
  );
}

// ── Styles ────────────────────────────────────────────────────

// pad = 20, grid gap = 14 (matches V1's .grid2 { gap: 14px })
const TILE_W = (SCREEN_W - 20 * 2 - 14) / 2;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },
  pad: { paddingHorizontal: 20 },
  row: { flexDirection: 'row', alignItems: 'center' },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  // top bar
  topbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1,
  },
  // V1: <h1 className="display"> = Space Grotesk 700
  topbarTitle: { fontSize: 24, fontFamily: FontFamily.displayBold, letterSpacing: -0.4 },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  // segment
  segmentTrack: {
    flexDirection: 'row', borderRadius: 999, padding: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
    marginTop: 16,
  },
  segmentBtn: { flex: 1, paddingVertical: 11, borderRadius: 999, alignItems: 'center' },
  segmentBtnActive: {
    backgroundColor: Colors.blue,
    shadowColor: Colors.blue, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 4,
  },
  segmentText: { fontWeight: '700', fontSize: 14.5 },

  // level card
  eyebrow: { fontSize: 11, fontFamily: FontFamily.bold, letterSpacing: 1.5, textTransform: 'uppercase' as const },
  levelTitle: { fontSize: 25, fontFamily: FontFamily.displayBold, letterSpacing: -0.4, marginTop: 4 },
  shieldBox: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  xpLabel: { fontSize: 13, fontWeight: '600' },
  xpHint: { fontSize: 12.5, fontWeight: '600', flex: 1 },

  // chart
  sectionTitle: { fontSize: 18, fontFamily: FontFamily.displayBold },
  sectionSub: { fontSize: 13, fontFamily: FontFamily.medium, marginTop: 2 },
  trendTag: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
  },
  trendText: { fontSize: 12, fontWeight: '700' },
  chartRow: {
    // V1: gap: 8, alignItems: flex-end, height: 130
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    marginTop: 18, gap: 8,
  },
  barCol: { flex: 1, alignItems: 'center', gap: 6, justifyContent: 'flex-end' },
  barVal: { fontSize: 11, fontWeight: '700' },
  // V1: width: 100%, maxWidth: 26
  bar: { width: '100%', maxWidth: 26, borderRadius: 8 },
  barDay: { fontSize: 12, fontWeight: '700' },

  // stat tiles — V1: .grid2 { gap: 14px }
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  tile: { width: TILE_W, padding: 18 },
  tileIconBox: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  deltaBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999 },
  deltaText: { fontSize: 10, fontWeight: '700' },
  tileValue: { fontSize: 30, fontFamily: FontFamily.displayBold, letterSpacing: -0.5, marginTop: 14 },
  tileLabel: { fontSize: 13, fontFamily: FontFamily.semiBold, marginTop: 2 },

  // mood — V1: outer row height:120, each col flex:1 col center (justifyContent:center)
  // columns fill row height so emoji/bar/day stack with equal flex space
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'stretch' },
  moodCol: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 2 },
  moodEmoji: { fontSize: 24 },
  moodEmojiPeak: { fontSize: 28 },
  moodBar: { width: 5, borderRadius: 999 },
  moodDay: { fontSize: 12, fontWeight: '700' },

  // heatmap
  heatmap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  heatCell: {
    // screen - (pad * 2) - (card internal pad * 2) - (6 gaps * 8px)
    width: (SCREEN_W - 20 * 2 - 20 * 2 - 8 * 6) / 7,
    aspectRatio: 1,
    borderRadius: 7,
  },
  heatmapLabel: {
    textAlign: 'center', fontSize: 12, fontWeight: '600', marginTop: 14,
  },
  legendDot: { width: 14, height: 14, borderRadius: 4, marginLeft: 4 },

  // AI insight
  insightCard: {
    borderRadius: 22, padding: 18, position: 'relative',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 6,
  },
  insightClose: { position: 'absolute', top: 14, right: 14, zIndex: 1 },
  aiIcon: {
    width: 38, height: 38, borderRadius: 11, flexShrink: 0,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.purple,
  },
  insightEyebrow: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  insightText: { color: '#fff', fontWeight: '600', fontSize: 14.5, lineHeight: 22, marginTop: 7 },
  insightHighlight: { color: '#A5CFFF', fontWeight: '700' }, // light blue works on both dark purple card bg and dark mode
  insightBtn: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 12, backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 9, paddingHorizontal: 14, borderRadius: 999, alignSelf: 'flex-start',
  },
  insightBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
