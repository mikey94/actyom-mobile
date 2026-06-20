import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type TabName = 'index' | 'quests' | 'stats' | 'profile';

// Match Claude Design's Lucide icons as closely as possible:
//   home       → MaterialCommunityIcons 'home'           (filled house)
//   swords     → MaterialCommunityIcons 'sword-cross'    (crossed swords)
//   bar-chart-3→ MaterialCommunityIcons 'chart-bar'      (ascending bars)
//   user-round → MaterialCommunityIcons 'account'        (person silhouette)
const TAB_CONFIG: {
  name: TabName;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconActive: keyof typeof MaterialCommunityIcons.glyphMap;
}[] = [
  { name: 'index',   label: 'Home',    icon: 'home-outline',  iconActive: 'home'        },
  { name: 'quests',  label: 'Quests',  icon: 'sword-cross',   iconActive: 'sword-cross' },
  { name: 'stats',   label: 'Stats',   icon: 'chart-bar',     iconActive: 'chart-bar'   },
  { name: 'profile', label: 'Profile', icon: 'account-outline',iconActive: 'account'    },
];

const BOTTOM_PAD = Platform.OS === 'ios' ? 20 : 8;

interface TabBarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: any;
  onAddPress?: () => void;
}

export function CustomTabBar({ state, navigation, onAddPress }: TabBarProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const handlePress = (routeName: string, isFocused: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const event = navigation.emit({ type: 'tabPress', target: routeName, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  const leftTabs = TAB_CONFIG.slice(0, 2);
  const rightTabs = TAB_CONFIG.slice(2);

  const renderTab = (tab: typeof TAB_CONFIG[0]) => {
    const route = state.routes.find((r: { name: string }) => r.name === tab.name);
    const isFocused = route ? state.index === state.routes.indexOf(route) : false;
    const color = isFocused ? Colors.primary : c.tabIconDefault;
    const iconName = isFocused ? tab.iconActive : tab.icon;

    return (
      <TouchableOpacity
        key={tab.name}
        style={styles.tab}
        onPress={() => route && handlePress(tab.name, isFocused)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name={iconName} size={24} color={color} />
        <Text style={[styles.label, { color }]}>{tab.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: c.surface, borderTopColor: c.line, paddingBottom: BOTTOM_PAD },
      ]}
    >
      {leftTabs.map(renderTab)}

      {/* Center FAB — opens New Quest modal */}
      <TouchableOpacity
        style={styles.fabWrapper}
        onPress={() => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          router.push('/new-quest');
          onAddPress?.();
        }}
        activeOpacity={0.85}
      >
        <View style={[styles.fab, { borderColor: c.surface }]}>
          <Feather name="plus" size={26} color="#fff" />
        </View>
      </TouchableOpacity>

      {rightTabs.map(renderTab)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 4,
  },
  label: {
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  fabWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginTop: -22,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.36,
    shadowRadius: 14,
    elevation: 8,
  },
});
