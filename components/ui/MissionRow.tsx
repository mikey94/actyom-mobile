import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, CATS, CatKey } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Mission } from '@/store/useStore';

// Feather icon names that map to Lucide equivalents
const CAT_ICONS: Record<CatKey, keyof typeof Feather.glyphMap> = {
  Health:   'activity',
  Learning: 'book-open',
  Work:     'briefcase',
  Mindful:  'sun',
  Admin:    'mail',
};

interface MissionRowProps {
  mission: Mission;
  onToggle: (id: string) => void;
}

export function MissionRow({ mission, onToggle }: MissionRowProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const cat = CATS[mission.cat] ?? CATS.Admin;
  const catColor = cat.color;
  const softBg = c[cat.softKey as keyof typeof c] as string;
  const icon = CAT_ICONS[mission.cat] ?? 'mail';

  return (
    <TouchableOpacity
      style={[
        styles.row,
        { backgroundColor: mission.done ? c.surface2 : c.surface, borderColor: c.line },
      ]}
      onPress={() => onToggle(mission.id)}
      activeOpacity={0.7}
    >
      {/* Category icon */}
      <View style={[styles.iconBox, { backgroundColor: softBg }]}>
        <Feather name={icon} size={20} color={catColor} />
      </View>

      {/* Text */}
      <View style={styles.textCol}>
        <Text
          style={[
            styles.title,
            { color: mission.done ? c.muted : c.ink },
            mission.done && styles.strikethrough,
          ]}
          numberOfLines={1}
        >
          {mission.title}
        </Text>
        <View style={styles.meta}>
          <Text style={[styles.catLabel, { color: catColor }]}>{mission.cat}</Text>
          <Text style={[styles.sep, { color: c.faint }]}>·</Text>
          <Feather name="zap" size={11} color={Colors.blue} />
          <Text style={[styles.xpText, { color: c.muted }]}> +{mission.xp} XP</Text>
          {mission.done && mission.completedAt && (
            <>
              <Text style={[styles.sep, { color: c.faint }]}>·</Text>
              <Text style={[styles.xpText, { color: c.faint }]}>{mission.completedAt}</Text>
            </>
          )}
        </View>
      </View>

      {/* Checkbox */}
      <View
        style={[
          styles.check,
          mission.done
            ? { backgroundColor: Colors.primary, borderColor: Colors.primary }
            : { backgroundColor: 'transparent', borderColor: c.line },
        ]}
      >
        {mission.done && <Feather name="check" size={14} color="#fff" />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    // V1: .mission { gap: 14px; border-radius: 20px; padding: 16px }
    gap: 14,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  iconBox: {
    // V1: .m-icon { width: 50px; height: 50px; border-radius: 15px }
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    // V1: .mission-title { font-weight: 700; font-size: 16px }
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  catLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  sep: {
    fontSize: 12,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '600',
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
