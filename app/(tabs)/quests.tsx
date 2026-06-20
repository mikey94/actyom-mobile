import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, CATS, CatKey, FontFamily } from '@/constants/theme';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import {
  useStore, INITIAL_SIDE_QUESTS, FAMILY_QUEST, QUEST_TYPES, SideQuest,
} from '@/store/useStore';
import { SectionHead } from '@/components/ui/SectionHead';
import { MissionRow } from '@/components/ui/MissionRow';
import { Card } from '@/components/ui/Card';
import { XPBar } from '@/components/ui/XPBar';

// ── Quest type icon map ────────────────────────────────────────
const QUEST_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  deep:  'zap',
  quick: 'zap',
  maint: 'shield',
  boss:  'crosshair',
};

const CAT_ICONS: Record<CatKey, keyof typeof Feather.glyphMap> = {
  Health:   'activity',
  Learning: 'book-open',
  Work:     'briefcase',
  Mindful:  'sun',
  Admin:    'mail',
};

// ── Side quest card ────────────────────────────────────────────

function SideQuestCard({ q }: { q: SideQuest }) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const cat = CATS[q.cat] ?? CATS.Admin;
  const type = QUEST_TYPES[q.type];
  const softBg = c[cat.softKey as keyof typeof c] as string;
  const catIcon = CAT_ICONS[q.cat] ?? 'mail';
  const typeIcon = QUEST_ICONS[q.type] ?? 'zap';

  return (
    <Card pad style={{ padding: 16 }}>
      <View style={styles.row}>
        <View style={[styles.iconBox, { backgroundColor: softBg }]}>
          <Feather name={catIcon} size={20} color={cat.color} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.between}>
            <Text style={[styles.questTitle, { color: c.ink }]} numberOfLines={1}>{q.title}</Text>
            <View style={styles.row}>
              <Feather name="zap" size={12} color={type.color} />
              <Text style={[styles.xpNum, { color: type.color }]}>{q.xp}</Text>
            </View>
          </View>
          <View style={[styles.row, { gap: 8, marginTop: 5 }]}>
            <View style={[styles.typeTag, { backgroundColor: c.surface2 }]}>
              <Feather name={typeIcon} size={10} color={type.color} />
              <Text style={[styles.typeTagText, { color: type.color }]}>{type.label}</Text>
            </View>
            <Text style={[styles.questSub, { color: c.muted }]}>{q.sub}</Text>
            <Text style={[styles.questDue, { color: c.faint }]}>Due {q.due}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

// ── Main screen ────────────────────────────────────────────────

export default function QuestsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const { user, missions, toggleMission, streakFreezeEquipped, equipStreakFreeze } = useStore();
  const [equipped, setEquipped] = useState(streakFreezeEquipped);

  const handleFreeze = () => {
    if (!equipped) { equipStreakFreeze(); setEquipped(true); }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Top bar */}
      <View style={[styles.topbar, { borderBottomColor: c.line }]}>
        <View>
          <Text style={[styles.topbarSub, { color: c.muted }]}>Ready for adventure?</Text>
          <Text style={[styles.topbarTitle, { color: c.ink }]}>Quest Log</Text>
        </View>
        <View style={[styles.streakBadge, { backgroundColor: Colors[scheme].amberSoft }]}>
          <Feather name="zap" size={17} color={Colors.amber} />
          <Text style={[styles.streakText, { color: Colors.amber }]}>{user.streak} Days</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Family Quest */}
        <View style={styles.pad}>
          <Card pad>
            <View style={[styles.between, { marginBottom: 14 }]}>
              <View style={[styles.familyTag, { backgroundColor: Colors[scheme].purpleSoft }]}>
                <Feather name="users" size={11} color={Colors.purple} />
                <Text style={[styles.familyTagText, { color: Colors.purple }]}>Family Quest</Text>
              </View>
              {/* Member avatars placeholder */}
              <View style={styles.row}>
                {['#FB5C5C', '#2E86F0', '#1FB07D'].map((col, i) => (
                  <View
                    key={i}
                    style={[
                      styles.memberAvatar,
                      { backgroundColor: col, marginLeft: i ? -9 : 0, borderColor: c.surface },
                    ]}
                  >
                    <Text style={styles.memberAvatarText}>
                      {['L', 'M', 'S'][i]}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.row}>
              <Feather name="sun" size={19} color={Colors.primary} />
              <Text style={[styles.familyTitle, { color: c.ink }]}> {FAMILY_QUEST.title}</Text>
            </View>
            <View style={[styles.between, { marginTop: 16, marginBottom: 9 }]}>
              <Text style={[styles.progressLabel, { color: c.muted }]}>Progress</Text>
              <Text style={[styles.progressPct, { color: Colors.primary }]}>{FAMILY_QUEST.progress}%</Text>
            </View>
            <XPBar value={FAMILY_QUEST.progress} max={100} variant="hp" height={8} />
            <Text style={[styles.progressSub, { color: c.faint }]}>
              {FAMILY_QUEST.done}/{FAMILY_QUEST.total} tasks completed this week
            </Text>
            <TouchableOpacity style={styles.contributeBtn} activeOpacity={0.85}>
              <Feather name="check-circle" size={16} color="#fff" />
              <Text style={styles.contributeBtnText}>Contribute</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Weekly Loot */}
        <View style={[styles.pad, { marginTop: 16 }]}>
          <View style={styles.lootCard}>
            {/* purple gradient via multiple views */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.purple, borderRadius: 22 }]} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(90,30,220,0.3)', borderRadius: 22 }]} />
            <View style={{ position: 'relative' }}>
              <View style={styles.between}>
                <View>
                  <Text style={styles.lootTitle}>Weekly Loot</Text>
                  <Text style={styles.lootSub}>Rare item chance!</Text>
                </View>
                <Feather name="lock" size={22} color={Colors.gold} />
              </View>
              <View style={[styles.row, { gap: 14, marginTop: 18 }]}>
                <View style={styles.lootIconBox}>
                  <Feather name="gift" size={22} color="#fff" />
                </View>
                <View>
                  <Text style={styles.lootUnlockLabel}>Unlock in</Text>
                  <Text style={styles.lootUnlockNum}>3 more tasks</Text>
                </View>
              </View>
              <View style={{ marginTop: 14 }}>
                <XPBar value={70} max={100} variant="amber" height={7} />
              </View>
            </View>
          </View>
        </View>

        {/* Streak Freeze */}
        <View style={[styles.pad, { marginTop: 16 }]}>
          <Card pad>
            <View style={styles.between}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.freezeTitle, { color: c.ink }]}>Streak Freeze</Text>
                <Text style={[styles.freezeSub, { color: c.muted }]}>
                  Missed a day? Don't lose your progress.
                </Text>
              </View>
              <View style={[styles.freezeIcon, { backgroundColor: Colors[scheme].blueSoft }]}>
                <Feather name="wind" size={20} color={Colors.blue} />
              </View>
            </View>
            <View style={[styles.between, { marginTop: 16 }]}>
              <View style={styles.row}>
                <Feather name="star" size={17} color={Colors.blue} />
                <Text style={[styles.freezeCount, { color: c.ink }]}> {user.freezes} left</Text>
              </View>
              <TouchableOpacity
                onPress={handleFreeze}
                style={[
                  styles.equipBtn,
                  equipped
                    ? { backgroundColor: Colors.light.greenSoft }
                    : { backgroundColor: Colors.light.primarySoft },
                ]}
              >
                {equipped && <Feather name="check" size={13} color={Colors.green} />}
                <Text
                  style={[
                    styles.equipBtnText,
                    { color: equipped ? Colors.green : Colors.primary },
                  ]}
                >
                  {equipped ? ' Equipped' : 'Equip'}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Active Quests */}
        <View style={[styles.pad, { marginTop: 22 }]}>
          <SectionHead title="Active Quests" action="View All" />
          <View style={{ gap: 10 }}>
            {INITIAL_SIDE_QUESTS.map((q) => (
              <SideQuestCard key={q.id} q={q} />
            ))}
          </View>
        </View>

        {/* Today's Missions */}
        <View style={[styles.pad, { marginTop: 22 }]}>
          <SectionHead title="Today's Missions" />
          <View style={{ gap: 10 }}>
            {missions.map((m) => (
              <MissionRow key={m.id} mission={m} onToggle={toggleMission} />
            ))}
          </View>
        </View>

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
  row: { flexDirection: 'row', alignItems: 'center' },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  topbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1,
  },
  topbarSub: { fontSize: 14, fontFamily: FontFamily.semiBold },
  topbarTitle: { fontSize: 26, fontFamily: FontFamily.displayBold, letterSpacing: -0.4, marginTop: 2 },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999,
  },
  streakText: { fontWeight: '800', fontSize: 15 },

  // family quest
  familyTag: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999,
  },
  familyTagText: { fontSize: 11.5, fontWeight: '700' },
  memberAvatar: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
  },
  memberAvatarText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  familyTitle: { fontSize: 20, fontFamily: FontFamily.displayBold, letterSpacing: -0.3, marginLeft: 6 },
  progressLabel: { fontSize: 13, fontWeight: '700' },
  progressPct: { fontSize: 15, fontWeight: '800' },
  progressSub: { fontSize: 12.5, fontWeight: '600', marginTop: 9, marginBottom: 14 },
  contributeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: Colors.primary,
    paddingVertical: 11, borderRadius: 13, justifyContent: 'center',
  },
  contributeBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // loot
  lootCard: { borderRadius: 22, padding: 20, overflow: 'hidden' },
  lootTitle: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  lootSub: { opacity: 0.85, fontWeight: '600', fontSize: 13.5, marginTop: 3, color: '#fff' },
  lootIconBox: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  lootUnlockLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  lootUnlockNum: { fontWeight: '800', fontSize: 18, color: '#fff', marginTop: 2 },

  // streak freeze
  freezeTitle: { fontSize: 18, fontFamily: FontFamily.extraBold },
  freezeSub: { fontSize: 13.5, fontFamily: FontFamily.medium, marginTop: 4 },
  freezeIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  freezeCount: { fontSize: 15, fontWeight: '800' },
  equipBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
  },
  equipBtnText: { fontSize: 13.5, fontWeight: '700' },

  // side quest
  iconBox: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 12,
  },
  questTitle: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  xpNum: { fontSize: 12, fontWeight: '800', marginLeft: 3 },
  typeTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  typeTagText: { fontSize: 11.5, fontWeight: '700' },
  questSub: { fontSize: 12.5, fontWeight: '600' },
  questDue: { fontSize: 12, fontWeight: '700', marginLeft: 'auto' },
});
