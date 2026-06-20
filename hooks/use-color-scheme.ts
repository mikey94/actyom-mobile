import { useColorScheme as useRNColorScheme } from 'react-native';
import { useStore } from '@/store/useStore';

/**
 * Returns the active color scheme, respecting any manual override set by the
 * user from the Profile screen. Falls back to the system setting when mode is 'system'.
 */
export function useColorScheme(): 'light' | 'dark' {
  const themeMode = useStore(s => s.themeMode);
  const systemScheme = useRNColorScheme() ?? 'light';

  if (themeMode === 'light') return 'light';
  if (themeMode === 'dark')  return 'dark';
  return systemScheme;
}
