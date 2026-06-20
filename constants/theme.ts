import { Platform } from 'react-native';

// ── Actyom brand palette ──────────────────────────────────────
export const Colors = {
  primary: '#FB5C5C',      // red – primary actions, HP bar
  blue: '#2E86F0',         // XP bar, accent
  purple: '#7C5CFC',       // quests / AI
  green: '#1FB07D',        // health, success
  amber: '#F6943B',        // streak, maintenance
  gold: '#F4B740',         // trophies, loot
  grey: '#6A7787',         // admin, muted icons

  light: {
    // core
    text: '#12151A',
    background: '#F5F6FA',
    surface: '#FFFFFF',
    surface2: '#F0F1F5',
    surface3: '#E8E9EF',
    ink: '#12151A',
    ink2: '#3A3F4B',
    muted: '#7A8496',
    faint: '#B0B8C8',
    line: '#E4E6ED',
    icon: '#7A8496',
    tint: '#FB5C5C',
    tabIconDefault: '#B0B8C8',
    tabIconSelected: '#FB5C5C',
    // soft pastel backgrounds for category icons
    primarySoft: 'rgba(251,92,92,0.12)',
    blueSoft: 'rgba(46,134,240,0.12)',
    purpleSoft: 'rgba(124,92,252,0.12)',
    greenSoft: 'rgba(31,176,125,0.12)',
    amberSoft: 'rgba(246,148,59,0.12)',
  },

  dark: {
    // core
    text: '#ECEDEE',
    background: '#0E1014',
    surface: '#1A1D24',
    surface2: '#22262F',
    surface3: '#2A2F3A',
    ink: '#ECEDEE',
    ink2: '#C8CBD4',
    muted: '#7A8496',
    faint: '#4A5060',
    line: '#2E3340',
    icon: '#7A8496',
    tint: '#FB5C5C',
    tabIconDefault: '#4A5060',
    tabIconSelected: '#FB5C5C',
    primarySoft: 'rgba(251,92,92,0.15)',
    blueSoft: 'rgba(46,134,240,0.15)',
    purpleSoft: 'rgba(124,92,252,0.15)',
    greenSoft: 'rgba(31,176,125,0.15)',
    amberSoft: 'rgba(246,148,59,0.15)',
  },
};

// Category definitions matching V1
export const CATS = {
  Health:   { color: '#1FB07D', softKey: 'greenSoft',   icon: 'dumbbell' as const },
  Learning: { color: '#2E86F0', softKey: 'blueSoft',    icon: 'book-open' as const },
  Work:     { color: '#7C5CFC', softKey: 'purpleSoft',  icon: 'briefcase' as const },
  Mindful:  { color: '#F6943B', softKey: 'amberSoft',   icon: 'sun' as const },
  Admin:    { color: '#6A7787', softKey: 'surface3',    icon: 'mail' as const },
} as const;

export type CatKey = keyof typeof CATS;

// ── Typography matching V1 (Hanken Grotesk body, Space Grotesk display) ──────
export const FontFamily = {
  // Body / UI — Hanken Grotesk
  regular:    'HankenGrotesk_400Regular',
  medium:     'HankenGrotesk_500Medium',
  semiBold:   'HankenGrotesk_600SemiBold',
  bold:       'HankenGrotesk_700Bold',
  extraBold:  'HankenGrotesk_800ExtraBold',
  // Display headings — Space Grotesk
  displayReg: 'SpaceGrotesk_400Regular',
  displayMd:  'SpaceGrotesk_500Medium',
  displaySb:  'SpaceGrotesk_600SemiBold',
  displayBold:'SpaceGrotesk_700Bold',
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
