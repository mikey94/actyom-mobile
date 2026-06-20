import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, FontFamily } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SectionHeadProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

export function SectionHead({ title, action, onAction }: SectionHeadProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: c.ink }]}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={[styles.action, { color: Colors.primary }]}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    // V1: font-family: 'Space Grotesk'; font-weight: 700; font-size: 19px; letter-spacing: -0.01em
    fontSize: 19,
    fontFamily: FontFamily.displayBold,
    letterSpacing: -0.2,
  },
  action: {
    // V1: .link { color: var(--c-blue); font-weight: 700; font-size: 14px }
    fontSize: 14,
    fontFamily: FontFamily.bold,
    color: Colors.blue,
  },
});
