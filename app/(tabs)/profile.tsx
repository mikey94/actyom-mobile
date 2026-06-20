import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, SafeAreaView, Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, FontFamily } from '@/constants/theme';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';

// ── Achievement badge data ───────────────────────────────────────────
const BADGES = [
  { icon: 'fire',           color: '#F6943B', label: '14-Day',    sub: 'Streak', on: true  },
  { icon: 'crown',          color: '#F4B740', label: 'Top 50',    sub: 'Rank',   on: true  },
  { icon: 'lightning-bolt', color: '#2E86F0', label: 'Speedrun',  sub: 'Quest',  on: true  },
  { icon: 'diamond-stone',  color: '#7C5CFC', label: 'Rare Loot', sub: 'Item',   on: false },
  { icon: 'trophy',         color: '#1FB07D', label: 'Champion',  sub: 'Event',  on: false },
];

// ── Animated toggle ──────────────────────────────────────────────────
function Toggle({
  value, onChange, activeColor,
}: { value: boolean; onChange: () => void; activeColor: string }) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const knobX    = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 22] });
  const trackBg  = anim.interpolate({ inputRange: [0, 1], outputRange: ['#C8C8D0', activeColor] });

  return (
    <TouchableOpacity onPress={onChange} activeOpacity={0.85} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <Animated.View style={[styles.toggleTrack, { backgroundColor: trackBg }]}>
        <Animated.View style={[styles.toggleKnob, { transform: [{ translateX: knobX }] }]} />
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── Preference / account row ─────────────────────────────────────────
function PrefRow({
  icon, iconBg, iconColor, label, sub,
  toggle, toggleColor, toggled, onToggle,
  chevron, onPress, c,
}: {
  icon: string; iconBg: string; iconColor: string;
  label: string; sub?: string;
  toggle?: boolean; toggleColor?: string; toggled?: boolean; onToggle?: () => void;
  chevron?: boolean; onPress?: () => void;
  c: any;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={chevron ? 0.65 : 1}
      style={styles.prefRow}
    >
      <View style={[styles.prefIconBox, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={icon as any} size={18} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.prefLabel, { color: c.ink }]}>{label}</Text>
        {sub ? <Text style={[styles.prefSub, { color: c.muted }]}>{sub}</Text> : null}
      </View>
      {toggle && toggleColor ? (
        <Toggle value={!!toggled} onChange={onToggle ?? (() => {})} activeColor={toggleColor} />
      ) : null}
      {chevron ? (
        <MaterialCommunityIcons name="chevron-right" size={20} color={c.muted} />
      ) : null}
    </TouchableOpacity>
  );
}

// ── Screen ───────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const { user, themeMode, setThemeMode } = useStore();

  const darkMode = themeMode === 'system' ? scheme === 'dark' : themeMode === 'dark';
  const [notifications, setNotifications] = useState(true);

  const handleDarkModeToggle = () => {
    // Cycle: system → explicit opposite → back to system
    // Simpler: just toggle dark vs light, ignoring system
    setThemeMode(darkMode ? 'light' : 'dark');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Top bar */}
      <View style={[styles.topbar, { borderBottomColor: c.line }]}>
        <Text style={[styles.topbarTitle, { color: c.ink }]}>Profile</Text>
        <TouchableOpacity style={[styles.topbarBtn, { backgroundColor: c.surface2 }]} activeOpacity={0.75}>
          <MaterialCommunityIcons name="chart-bar" size={18} color={c.muted} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Identity card ─────────────────────────────── */}
        <AnimatedSection index={0}>
          <View style={[styles.pad, { marginTop: 20 }]}>
            <Card pad>
              <View style={styles.identityInner}>

                {/* Avatar with ring + LV badge */}
                <View style={styles.avatarWrap}>
                  <View style={[styles.avatarRing, { borderColor: Colors.primary }]}>
                    <View style={[styles.avatarCircle, { backgroundColor: Colors.primary }]}>
                      <Text style={styles.avatarInitial}>{user.first.charAt(0)}</Text>
                    </View>
                  </View>
                  <View style={[styles.lvBadge, { backgroundColor: Colors.primary }]}>
                    <Text style={styles.lvText}>LV{user.level}</Text>
                  </View>
                </View>

                {/* Name */}
                <Text style={[styles.idName, { color: c.ink }]}>{user.name}</Text>

                {/* Class + title tags */}
                <View style={styles.tagRow}>
                  <View style={[styles.tag, { backgroundColor: c.primarySoft }]}>
                    <MaterialCommunityIcons name="lightning-bolt" size={11} color={Colors.primary} />
                    <Text style={[styles.tagText, { color: Colors.primary }]}>Doer</Text>
                  </View>
                  <View style={[styles.tag, { backgroundColor: c.surface2 }]}>
                    <Text style={[styles.tagText, { color: c.muted }]}>{user.title}</Text>
                  </View>
                </View>

                {/* Level / Streak / Rank */}
                <View style={[styles.statsRow, { borderTopColor: c.line }]}>
                  {[
                    { label: 'Level',  value: String(user.level) },
                    { label: 'Streak', value: `${user.streak}d`  },
                    { label: 'Rank',   value: `#${user.rank}`    },
                  ].map((s, i) => (
                    <View
                      key={i}
                      style={[
                        styles.statCell,
                        i < 2 && { borderRightWidth: 1, borderRightColor: c.line },
                      ]}
                    >
                      <Text style={[styles.statValue, { color: c.ink }]}>{s.value}</Text>
                      <Text style={[styles.statLabel, { color: c.muted }]}>{s.label}</Text>
                    </View>
                  ))}
                </View>

              </View>
            </Card>
          </View>
        </AnimatedSection>

        {/* ── 2. Achievements ──────────────────────────────── */}
        <AnimatedSection index={1}>
          <View style={{ marginTop: 24 }}>
            <View style={[styles.pad, { marginBottom: 12 }]}>
              <Text style={[styles.sectionTitle, { color: c.ink }]}>Achievements</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgesScroll}
            >
              {BADGES.map((b, i) => (
                <View
                  key={i}
                  style={[
                    styles.badge,
                    {
                      backgroundColor: b.on ? b.color + '18' : c.surface2,
                      borderColor:     b.on ? b.color + '30' : c.line,
                    },
                  ]}
                >
                  <View style={[styles.badgeIconBox, { backgroundColor: b.on ? b.color + '28' : c.line }]}>
                    {b.on
                      ? <MaterialCommunityIcons name={b.icon as any} size={24} color={b.color} />
                      : <MaterialCommunityIcons name="lock" size={22} color={c.faint} />
                    }
                  </View>
                  <Text style={[styles.badgeLabel, { color: b.on ? c.ink : c.faint }]}>{b.label}</Text>
                  <Text style={[styles.badgeSub,   { color: b.on ? c.muted : c.faint }]}>{b.sub}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </AnimatedSection>

        {/* ── 3. Preferences ───────────────────────────────── */}
        <AnimatedSection index={2}>
          <View style={[styles.pad, { marginTop: 24 }]}>
            <Text style={[styles.sectionTitle, { color: c.ink }]}>Preferences</Text>
            <Card style={{ marginTop: 12 }}>
              <PrefRow
                icon="weather-night" iconBg={c.purpleSoft} iconColor={Colors.purple}
                label="Dark Mode"
                toggle toggleColor={Colors.purple} toggled={darkMode}
                onToggle={handleDarkModeToggle}
                c={c}
              />
              <View style={[styles.divider, { backgroundColor: c.line }]} />
              <PrefRow
                icon="bell-outline" iconBg={c.primarySoft} iconColor={Colors.primary}
                label="Notifications" sub="Reminders & achievements"
                toggle toggleColor={Colors.primary} toggled={notifications}
                onToggle={() => setNotifications(v => !v)}
                c={c}
              />
              <View style={[styles.divider, { backgroundColor: c.line }]} />
              <PrefRow
                icon="calendar-outline" iconBg={c.blueSoft} iconColor={Colors.blue}
                label="Connected Calendars" sub="Google Calendar"
                chevron onPress={() => router.push('/calendar')} c={c}
              />
            </Card>
          </View>
        </AnimatedSection>

        {/* ── 4. Account ───────────────────────────────────── */}
        <AnimatedSection index={3}>
          <View style={[styles.pad, { marginTop: 24 }]}>
            <Text style={[styles.sectionTitle, { color: c.ink }]}>Account</Text>
            <Card style={{ marginTop: 12 }}>
              <PrefRow
                icon="robot-outline" iconBg={c.purpleSoft} iconColor={Colors.purple}
                label="Actyom AI Coach" sub="Personalize your experience"
                chevron c={c}
              />
              <View style={[styles.divider, { backgroundColor: c.line }]} />
              <PrefRow
                icon="shield-outline" iconBg={c.greenSoft} iconColor={Colors.green}
                label="Privacy & Data" sub="Manage your data"
                chevron c={c}
              />
              <View style={[styles.divider, { backgroundColor: c.line }]} />
              <PrefRow
                icon="logout" iconBg={c.primarySoft} iconColor={Colors.primary}
                label="Log Out"
                chevron c={c}
              />
            </Card>
          </View>
        </AnimatedSection>

        {/* ── 5. Version footer ────────────────────────────── */}
        <AnimatedSection index={4}>
          <Text style={[styles.version, { color: c.faint }]}>Actyom v1.0.2</Text>
        </AnimatedSection>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:          { flex: 1 },
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  pad:           { paddingHorizontal: 20 },

  // top bar
  topbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1,
  },
  topbarTitle: { fontSize: 26, fontFamily: FontFamily.displayBold, letterSpacing: -0.4 },
  topbarBtn: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },

  // identity card
  identityInner: { alignItems: 'center' },
  avatarWrap:    { position: 'relative', marginBottom: 14 },
  avatarRing: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 3, padding: 3,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarCircle: {
    width: 84, height: 84, borderRadius: 42,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: {
    color: '#fff', fontSize: 38, fontFamily: FontFamily.extraBold,
  },
  lvBadge: {
    position: 'absolute', bottom: -2, right: -6,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 999, borderWidth: 2, borderColor: '#fff',
  },
  lvText: { color: '#fff', fontSize: 11, fontFamily: FontFamily.bold },

  idName: {
    fontSize: 24, fontFamily: FontFamily.displayBold,
    letterSpacing: -0.4, marginBottom: 10,
  },
  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 11, paddingVertical: 5, borderRadius: 999,
  },
  tagText: { fontSize: 11, fontFamily: FontFamily.extraBold, textTransform: 'uppercase' as const, letterSpacing: 0.7 },

  statsRow: {
    flexDirection: 'row', width: '100%',
    borderTopWidth: 1, marginTop: 4,
  },
  statCell:  { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statValue: { fontSize: 20, fontFamily: FontFamily.displayBold, letterSpacing: -0.3 },
  statLabel: { fontSize: 12.5, fontFamily: FontFamily.medium, marginTop: 2 },

  // section title
  sectionTitle: { fontSize: 18, fontFamily: FontFamily.displayBold, letterSpacing: -0.2 },

  // badges
  badgesScroll: { paddingHorizontal: 18, gap: 12, paddingRight: 22 },
  badge: {
    width: 90, alignItems: 'center', padding: 14, gap: 7,
    borderRadius: 18, borderWidth: 1,
  },
  badgeIconBox: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeLabel: { fontSize: 13, fontFamily: FontFamily.bold,   textAlign: 'center' },
  badgeSub:   { fontSize: 11, fontFamily: FontFamily.medium, textAlign: 'center', marginTop: -2 },

  // pref rows
  prefRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 13,
  },
  prefIconBox: {
    width: 38, height: 38, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  prefLabel: { fontSize: 15, fontFamily: FontFamily.semiBold },
  prefSub:   { fontSize: 12.5, fontFamily: FontFamily.regular, marginTop: 2 },

  divider: { height: 1, marginLeft: 67 },

  // toggle
  toggleTrack: {
    width: 46, height: 26, borderRadius: 13,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18, shadowRadius: 2, elevation: 2,
  },

  // version
  version: {
    textAlign: 'center', fontSize: 12.5,
    fontFamily: FontFamily.medium, marginTop: 30, letterSpacing: 0.3,
  },
});
