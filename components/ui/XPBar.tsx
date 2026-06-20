import { View, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface XPBarProps {
  value: number;
  max: number;
  variant?: 'xp' | 'hp' | 'amber';
  height?: number;
  /** Show a looping shimmer shine (use on XP bars, matching V1 .bar-fill.shine) */
  shine?: boolean;
}

const VARIANT_COLORS: Record<string, string> = {
  xp:    Colors.blue,
  hp:    Colors.primary,
  amber: Colors.amber,
};

export function XPBar({ value, max, variant = 'xp', height = 10, shine = false }: XPBarProps) {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fillColor = VARIANT_COLORS[variant] ?? Colors.blue;
  const track = c.surface2;

  // ── Animate fill width from 0 → pct on mount / value change ──────────────
  const fillPct = useSharedValue(0);
  useEffect(() => {
    fillPct.value = withTiming(pct, {
      duration: 800,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
  }, [pct]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillPct.value}%`,
  }));

  // ── Shine shimmer — slides across the bar on a 2.4 s loop ────────────────
  const shineX = useSharedValue(-120);
  useEffect(() => {
    if (!shine) return;
    // small delay so the fill animation is visible first
    const timer = setTimeout(() => {
      shineX.value = withRepeat(
        withTiming(280, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
        -1,
        false,
      );
    }, 600);
    return () => clearTimeout(timer);
  }, [shine]);

  const shineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shineX.value }],
  }));

  return (
    <View
      style={[
        styles.track,
        { height, backgroundColor: track, borderRadius: height / 2 },
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            backgroundColor: fillColor,
            borderRadius: height / 2,
          },
          fillStyle,
        ]}
      >
        {shine && (
          <Animated.View
            style={[
              styles.shine,
              { height, borderRadius: height / 2 },
              shineStyle,
            ]}
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill:  { overflow: 'hidden', position: 'relative' },
  shine: {
    position: 'absolute',
    top: 0,
    width: 60,
    backgroundColor: 'rgba(255,255,255,0.28)',
    // skew the shine like the CSS version
    transform: [{ skewX: '-20deg' }],
  },
});
