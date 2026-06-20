import { create } from 'zustand';
import { CatKey } from '@/constants/theme';

// ── Types ──────────────────────────────────────────────────────

export type MoodId = 'great' | 'good' | 'meh' | 'tired' | 'stress';

export interface Mood {
  id: MoodId;
  emoji: string;
  label: string;
  color: string;
  tone: 'high' | 'mid' | 'low';
}

export interface Mission {
  id: string;
  title: string;
  cat: CatKey;
  xp: number;
  done: boolean;
  completedAt?: string | null;
}

export interface QuestStep {
  id: string;
  label: string;
  done: boolean;
}

export interface Quest {
  id: string;
  type: 'deep' | 'quick' | 'maint' | 'boss';
  tag: string;
  title: string;
  project: string;
  minutes: number;
  xp: number;
  priority: string;
  steps: QuestStep[];
}

export interface SideQuest {
  id: string;
  title: string;
  cat: CatKey;
  xp: number;
  type: 'deep' | 'quick' | 'maint' | 'boss';
  due: string;
  sub: string;
}

export interface User {
  name: string;
  first: string;
  klass: string;
  level: number;
  title: string;
  xp: number;
  xpMax: number;
  totalXp: number;
  totalXpMax: number;
  hp: number;
  hpMax: number;
  mana: number;
  streak: number;
  rank: number;
  freezes: number;
}

export interface CalEvent {
  id: string;
  start: number;
  end: number;
  title: string;
  cal: string;
  color: string;
}

// ── Seed data ─────────────────────────────────────────────────

export const MOODS: Mood[] = [
  { id: 'great', emoji: '🤩', label: 'Energized', color: '#1FB07D', tone: 'high' },
  { id: 'good',  emoji: '🙂', label: 'Good',      color: '#2E86F0', tone: 'mid'  },
  { id: 'meh',   emoji: '😐', label: 'Neutral',   color: '#F4B740', tone: 'mid'  },
  { id: 'tired', emoji: '😴', label: 'Drained',   color: '#F6943B', tone: 'low'  },
  { id: 'stress',emoji: '😖', label: 'Stressed',  color: '#FB5C5C', tone: 'low'  },
];

export const QUEST_TYPES = {
  deep:  { label: 'Deep Work',   color: '#FB5C5C', icon: 'flame'    },
  quick: { label: 'Quick Win',   color: '#F4B740', icon: 'zap'      },
  maint: { label: 'Maintenance', color: '#6A7787', icon: 'shield'   },
  boss:  { label: 'Boss Battle', color: '#2E86F0', icon: 'crosshair' },
} as const;

const INITIAL_USER: User = {
  name: 'Buwaneka',
  first: 'Buwaneka',
  klass: 'Doer',
  level: 12,
  title: 'Master Architect',
  xp: 2450, xpMax: 3000,
  totalXp: 12400, totalXpMax: 15000,
  hp: 850, hpMax: 1000,
  mana: 90,
  streak: 14,
  rank: 42,
  freezes: 2,
};

const INITIAL_MISSIONS: Mission[] = [
  { id: 'm1', title: 'Morning HIIT Session', cat: 'Health', xp: 500, done: false },
  { id: 'm2', title: 'Read 20 Pages of "Atomic Habits"', cat: 'Learning', xp: 300, done: true, completedAt: '8:10 AM' },
  { id: 'm3', title: 'Inbox Zero Cleanup', cat: 'Admin', xp: 450, done: false },
  { id: 'm4', title: 'Stand-up sync notes', cat: 'Work', xp: 120, done: false },
];

const INITIAL_FOCUS: Quest = {
  id: 'q-epic',
  type: 'deep',
  tag: 'EPIC QUEST',
  title: 'Finish Q3 Design Proposal',
  project: 'Website Redesign',
  minutes: 25,
  xp: 800,
  priority: 'High Priority',
  steps: [
    { id: 's1', label: 'Outline narrative & goals', done: true },
    { id: 's2', label: 'Design hero + key screens', done: false },
    { id: 's3', label: 'Write exec summary', done: false },
    { id: 's4', label: 'Polish & export deck', done: false },
  ],
};

export const INITIAL_SIDE_QUESTS: SideQuest[] = [
  { id: 'sq1', title: 'Ship onboarding v2', cat: 'Work', xp: 1200, type: 'boss', due: 'Fri', sub: '3 of 5 tasks' },
  { id: 'sq2', title: '10k steps', cat: 'Health', xp: 200, type: 'maint', due: 'Today', sub: 'Daily ritual' },
  { id: 'sq3', title: 'Learn 15 Spanish words', cat: 'Learning', xp: 250, type: 'quick', due: 'Today', sub: 'Duolingo' },
];

export const CAL_EVENTS: CalEvent[] = [
  { id: 'e1', start: 9,  end: 9.5,  title: 'Daily Stand-up',  cal: 'Work',     color: '#7C5CFC' },
  { id: 'e2', start: 11, end: 12,   title: 'Design Critique',  cal: 'Work',     color: '#7C5CFC' },
  { id: 'e3', start: 13, end: 13.5, title: 'Lunch w/ Mia',    cal: 'Personal', color: '#1FB07D' },
  { id: 'e4', start: 16, end: 17,   title: '1:1 with Manager', cal: 'Work',     color: '#2E86F0' },
];

export interface CalGap {
  id: string;
  start: number;
  end: number;
  label: string;
  quest: string;
  minutes: number;
}

export const CAL_GAPS: CalGap[] = [
  { id: 'g1', start: 9.5, end: 11, label: 'Quiet block',  quest: 'Finish Q3 Design Proposal', minutes: 90  },
  { id: 'g2', start: 14,  end: 16, label: 'Peak focus',   quest: 'Ship onboarding v2',         minutes: 120 },
];

export const FAMILY_QUEST = {
  title: 'Operation: Pizza Night',
  progress: 75,
  done: 15,
  total: 20,
};

// Stats screen data
export const WEEK_PRODUCTIVITY = [6, 9, 14, 11, 8, 4, 7]; // Mon–Sun

export interface StatTile {
  id: string;
  icon: string;
  value: string;
  label: string;
  delta: string;
  color: string;
}

export const STAT_TILES: StatTile[] = [
  { id: 't1', icon: 'timer-outline',        value: '42h', label: 'Focus Hours',   delta: '+12%', color: '#2E86F0' },
  { id: 't2', icon: 'check-circle-outline', value: '85',  label: 'Tasks Crushed', delta: '+5%',  color: '#7C5CFC' },
  { id: 't3', icon: 'fire',                 value: '14',  label: 'Day Streak',    delta: '+1',   color: '#F6943B' },
  { id: 't4', icon: 'battery-high',         value: '90%', label: 'Mana Level',    delta: '+10%', color: '#1FB07D' },
];

export const MOOD_WEEK = [
  { day: 'Mon', mood: 'good'  as MoodId },
  { day: 'Tue', mood: 'meh'   as MoodId },
  { day: 'Wed', mood: 'great' as MoodId },
  { day: 'Thu', mood: 'tired' as MoodId },
  { day: 'Fri', mood: null },
];

// ── Store ──────────────────────────────────────────────────────

export type ThemeMode = 'system' | 'light' | 'dark';

interface AppState {
  user: User;
  missions: Mission[];
  focus: Quest;
  mood: MoodId | null;
  streakFreezeEquipped: boolean;
  themeMode: ThemeMode;

  // actions
  addXp: (amount: number) => void;
  toggleMission: (id: string) => void;
  addMission: (mission: Omit<Mission, 'id' | 'done'>) => void;
  setMood: (id: MoodId) => void;
  equipStreakFreeze: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useStore = create<AppState>((set) => ({
  user: INITIAL_USER,
  missions: INITIAL_MISSIONS,
  focus: INITIAL_FOCUS,
  mood: null,
  streakFreezeEquipped: false,
  themeMode: 'system',

  addXp: (amount) =>
    set((state) => {
      let xp = state.user.xp + amount;
      let level = state.user.level;
      let xpMax = state.user.xpMax;
      while (xp >= xpMax) { xp -= xpMax; level += 1; xpMax = Math.round(xpMax * 1.08); }
      return { user: { ...state.user, xp, level, xpMax, totalXp: state.user.totalXp + amount } };
    }),

  toggleMission: (id) =>
    set((state) => {
      const missions = state.missions.map((m) => {
        if (m.id !== id) return m;
        const done = !m.done;
        return { ...m, done, completedAt: done ? 'just now' : null };
      });
      const toggled = missions.find((m) => m.id === id);
      if (toggled?.done) {
        let xp = state.user.xp + toggled.xp;
        let level = state.user.level;
        let xpMax = state.user.xpMax;
        while (xp >= xpMax) { xp -= xpMax; level += 1; xpMax = Math.round(xpMax * 1.08); }
        return { missions, user: { ...state.user, xp, level, xpMax, totalXp: state.user.totalXp + toggled.xp } };
      }
      return { missions };
    }),

  addMission: (mission) =>
    set((state) => ({
      missions: [{ ...mission, id: 'm' + Date.now(), done: false }, ...state.missions],
    })),

  setMood: (id) => set({ mood: id }),

  setThemeMode: (mode) => set({ themeMode: mode }),

  equipStreakFreeze: () =>
    set((state) => ({
      streakFreezeEquipped: true,
      user: { ...state.user, freezes: Math.max(0, state.user.freezes - 1) },
    })),
}));
