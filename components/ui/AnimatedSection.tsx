/**
 * AnimatedSection — matches V1's `.stagger > *` fade-up animation.
 * Each child fades up from 14 px below with a per-index delay.
 *
 * V1 CSS reference:
 *   .stagger > *  { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) both; }
 *   @keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
 */
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ReactNode } from 'react';

interface AnimatedSectionProps {
  children: ReactNode;
  /** Stagger index — each step adds 60 ms delay (V1 uses ~60 ms steps) */
  index?: number;
  style?: object;
}

export function AnimatedSection({ children, index = 0, style }: AnimatedSectionProps) {
  return (
    <Animated.View
      entering={FadeInDown
        .delay(40 + index * 60)
        .duration(500)
        .springify()
        .damping(18)
        .stiffness(120)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
