import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ScrollView, Dimensions,
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CAL_EVENTS, CAL_GAPS, type CalGap } from '@/store/useStore';

// ── Layout ────────────────────────────────────────────────────
const { width: W } = Dimensions.get('window');
const H0  = 8;    // start hour
const H1  = 18;   // end hour
const PX  = 64;   // px per hour

// ── Helpers ───────────────────────────────────────────────────
function fmtH(h: number) {
  const hr  = Math.floor(h);
  const min = Math.round((h - hr) * 60);
  const ap  = hr >= 12 ? 'PM' : 'AM';
  const h12 = hr % 12 === 0 ? 12 : hr % 12;
  return min ? `${h12}:${String(min).padStart(2, '0')}` : `${h12} ${ap}`;
}

const WEEK = [
  { dow: 'Mon', num: '5' },
  { dow: 'Tue', num: '6' },
  { dow: 'Wed', num: '7' },
  { dow: 'Thu', num: '8' },
  { dow: 'Fri', num: '9' },
];

// ── Screen ────────────────────────────────────────────────────
export default function CalendarScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme];

  const [activeDate, setActiveDate]       = useState(2); // Wed selected by default
  const [scheduled, setScheduled]         = useState<string[]>([]);

  const schedule = (g: CalGap) => {
    setScheduled(s => [...s, g.id]);
  };

  const trackH = (H1 - H0) * PX;
  const gutterW = 48;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: c.background }]}>

      {/* ── Top bar ── */}
      <View style={[s.topbar, { borderBottomColor: c.line }]}>
        <View style={s.topbarLeft}>
          <TouchableOpacity
            style={[s.iconBtn, { backgroundColor: c.surface, borderColor: c.line }]}
            onPress={() => router.back()}
            activeOpacity={0.75}
          >
            <Feather name="arrow-left" size={20} color={c.ink} />
          </TouchableOpacity>
          <View>
            <Text style={[s.topbarTitle, { color: c.ink }]}>Your Day</Text>
            <View style={s.syncRow}>
              <Feather name="refresh-cw" size={11} color={Colors.green} />
              <Text style={[s.syncText, { color: Colors.green }]}>Synced · Google · Apple</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[s.iconBtn, { backgroundColor: c.surface, borderColor: c.line }]}
          activeOpacity={0.75}
        >
          <MaterialCommunityIcons name="calendar-plus" size={19} color={c.ink} />
        </TouchableOpacity>
      </View>

      {/* ── Date strip ── */}
      <View style={[s.dateStripWrap, { borderBottomColor: c.line }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.dateStrip}
        >
          {WEEK.map((d, i) => {
            const on = i === activeDate;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => setActiveDate(i)}
                activeOpacity={0.8}
                style={[
                  s.dateBtn,
                  {
                    backgroundColor: on ? Colors.primary : c.surface,
                    shadowColor: on ? Colors.primary : '#000',
                    shadowOpacity: on ? 0.3 : 0.06,
                    shadowOffset: { width: 0, height: on ? 4 : 2 },
                    shadowRadius: on ? 10 : 4,
                    elevation: on ? 6 : 2,
                  },
                ]}
              >
                <Text style={[s.dateDow, { color: on ? 'rgba(255,255,255,0.85)' : c.muted }]}>
                  {d.dow}
                </Text>
                <Text style={[s.dateNum, { color: on ? '#fff' : c.ink }]}>
                  {d.num}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* AI banner */}
        <LinearGradient
          colors={['rgba(124,92,252,0.12)', 'rgba(46,134,240,0.10)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[s.aiBanner, { borderColor: c.line }]}
        >
          <LinearGradient
            colors={['#7C5CFC', '#2E86F0']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.aiIcon}
          >
            <MaterialCommunityIcons name="creation" size={17} color="#fff" />
          </LinearGradient>
          <Text style={[s.aiBannerText, { color: c.ink }]}>
            {'I found '}
            <Text style={{ color: Colors.purple, fontFamily: FontFamily.extraBold }}>
              2 focus windows
            </Text>
            {' in your day. Tap a glowing block to drop in deep work.'}
          </Text>
        </LinearGradient>

        {/* Timeline */}
        <View style={s.timeline}>
          {/* Hour gutter */}
          <View style={[s.gutter, { width: gutterW }]}>
            {Array.from({ length: H1 - H0 + 1 }).map((_, i) => (
              <View key={i} style={{ height: PX, position: 'relative' }}>
                <Text style={[s.hourLabel, { color: c.faint }]}>
                  {fmtH(H0 + i)}
                </Text>
              </View>
            ))}
          </View>

          {/* Track */}
          <View style={[s.track, { height: trackH }]}>
            {/* Hour lines */}
            {Array.from({ length: H1 - H0 + 1 }).map((_, i) => (
              <View
                key={i}
                style={[s.hourLine, { top: i * PX, backgroundColor: c.line }]}
              />
            ))}

            {/* Calendar events */}
            {CAL_EVENTS.map(ev => {
              const evH = (ev.end - ev.start) * PX - 6;
              const tall = evH >= 48;
              return (
                <View
                  key={ev.id}
                  style={[
                    s.event,
                    {
                      top: (ev.start - H0) * PX + 3,
                      height: Math.max(evH, 38),
                      backgroundColor: c.surface,
                      borderLeftColor: ev.color,
                      shadowColor: '#000',
                      shadowOpacity: 0.06,
                      shadowOffset: { width: 0, height: 2 },
                      shadowRadius: 4, elevation: 2,
                      justifyContent: tall ? 'flex-start' : 'center',
                    },
                  ]}
                >
                  <Text style={[s.eventTitle, { color: c.ink, fontSize: tall ? 13.5 : 12 }]} numberOfLines={1}>
                    {ev.title}
                  </Text>
                  {tall && (
                    <Text style={[s.eventMeta, { color: c.muted }]}>
                      {fmtH(ev.start)}–{fmtH(ev.end)} · {ev.cal}
                    </Text>
                  )}
                </View>
              );
            })}

            {/* AI gap / focus blocks */}
            {CAL_GAPS.map(g => {
              const isOn = scheduled.includes(g.id);
              return (
                <TouchableOpacity
                  key={g.id}
                  activeOpacity={isOn ? 1 : 0.8}
                  onPress={() => !isOn && schedule(g)}
                  style={[
                    s.gap,
                    {
                      top: (g.start - H0) * PX + 3,
                      height: (g.end - g.start) * PX - 6,
                      backgroundColor: isOn ? Colors.primary : c.primarySoft,
                      borderColor: Colors.primary,
                      borderStyle: isOn ? 'solid' : 'dashed',
                      shadowColor: isOn ? Colors.primary : 'transparent',
                      shadowOpacity: isOn ? 0.35 : 0,
                      shadowOffset: { width: 0, height: 4 },
                      shadowRadius: 12, elevation: isOn ? 6 : 0,
                    },
                  ]}
                >
                  <View style={s.gapIconWrap}>
                    <Feather
                      name={isOn ? 'play' : 'plus'}
                      size={18}
                      color={isOn ? '#fff' : Colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.gapTitle, { color: isOn ? '#fff' : Colors.primary }]}>
                      {isOn ? `Focus: ${g.quest}` : `${g.label} · ${g.minutes}m free`}
                    </Text>
                    <Text style={[s.gapSub, { color: isOn ? 'rgba(255,255,255,0.8)' : Colors.primary, opacity: isOn ? 1 : 0.8 }]}>
                      {isOn ? `${fmtH(g.start)}–${fmtH(g.end)} · scheduled` : 'Tap to schedule deep work'}
                    </Text>
                  </View>
                  {isOn && (
                    <Feather name="check-circle" size={18} color="#fff" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1 },

  // Top bar
  topbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1,
  },
  topbarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  topbarTitle: {
    fontSize: 23, fontFamily: FontFamily.displayBold, letterSpacing: -0.3,
  },
  syncRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  syncText: { fontSize: 12, fontFamily: FontFamily.bold },

  // Date strip
  dateStripWrap: { height: 96, borderBottomWidth: 1 },
  dateStrip: {
    flexDirection: 'row', gap: 9,
    paddingHorizontal: 20, paddingVertical: 12, alignItems: 'center',
  },
  dateBtn: {
    alignItems: 'center', justifyContent: 'center', gap: 3,
    paddingVertical: 10, width: 62, height: 72,
    borderRadius: 18, flexShrink: 0,
  },
  dateDow: { fontSize: 11, fontFamily: FontFamily.bold },
  dateNum: { fontSize: 20, fontFamily: FontFamily.extraBold },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 6, paddingBottom: 40 },

  // AI Banner — LinearGradient bg
  aiBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 11,
    padding: 14, borderRadius: 16, marginBottom: 16, borderWidth: 1,
  },
  aiIcon: {
    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  aiBannerText: {
    flex: 1, fontSize: 13.5, fontFamily: FontFamily.semiBold, lineHeight: 19,
  },

  // Timeline
  timeline: { flexDirection: 'row', gap: 12 },
  gutter: { flexShrink: 0 },
  hourLabel: {
    position: 'absolute', top: -8,
    fontSize: 11, fontFamily: FontFamily.medium,
    letterSpacing: 0.3,
  },
  track: { flex: 1, position: 'relative' },
  hourLine: { position: 'absolute', left: 0, right: 0, height: 1 },

  // Regular events
  event: {
    position: 'absolute', left: 0, right: 0,
    borderRadius: 13, padding: 8, paddingLeft: 12,
    borderLeftWidth: 4, overflow: 'hidden',
  },
  eventTitle: { fontSize: 13.5, fontFamily: FontFamily.bold },
  eventMeta: { fontSize: 11, fontFamily: FontFamily.medium, marginTop: 2 },

  // AI focus gap blocks
  gap: {
    position: 'absolute', left: 0, right: 0,
    borderRadius: 13, borderWidth: 1.5,
    padding: 10, paddingHorizontal: 12,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  gapIconWrap: { flexShrink: 0 },
  gapTitle: { fontSize: 13.5, fontFamily: FontFamily.extraBold },
  gapSub: { fontSize: 11.5, fontFamily: FontFamily.semiBold, marginTop: 1 },
});
