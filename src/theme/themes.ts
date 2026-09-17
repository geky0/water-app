export interface ThemeColors {
  background: string;
  surface: string;
  surfaceLight: string;
  surfaceBorder: string;

  primary: string;
  primaryGlow: string;
  primaryDark: string;
  primaryDeep: string;
  accent: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  ringGradient: [string, string, string];
  cardBadgeBg: string;
  cardBadgeBorder: string;

  waterBlue: string;
  success: string;
  danger: string;
  warning: string;
}

export type ThemeId = 'monochrome' | 'crimson' | 'frost';

export interface AppTheme {
  id: ThemeId;
  name: string;
  subtitle: string;
  tag: string;
  previewPrimary: string;
  previewSecondary: string;
  colors: ThemeColors;
}

export const Themes: Record<ThemeId, AppTheme> = {
  monochrome: {
    id: 'monochrome',
    name: 'Stealth Monochrome',
    subtitle: 'All Black & Gray OLED Precision',
    tag: 'NEW',
    previewPrimary: '#E5E7EB',
    previewSecondary: '#262626',
    colors: {
      background: '#000000',
      surface: '#0D0D0D',
      surfaceLight: '#181818',
      surfaceBorder: '#282828',

      primary: '#E5E7EB',
      primaryGlow: 'rgba(229, 231, 235, 0.25)',
      primaryDark: '#4B5563',
      primaryDeep: '#1F2937',
      accent: '#9CA3AF',

      textPrimary: '#FFFFFF',
      textSecondary: '#A1A1AA',
      textMuted: '#52525B',

      ringGradient: ['#F3F4F6', '#9CA3AF', '#374151'],
      cardBadgeBg: 'rgba(255, 255, 255, 0.08)',
      cardBadgeBorder: 'rgba(255, 255, 255, 0.18)',

      waterBlue: '#9CA3AF',
      success: '#10B981',
      danger: '#EF4444',
      warning: '#F59E0B',
    },
  },
  crimson: {
    id: 'crimson',
    name: 'Cyber Crimson',
    subtitle: 'Signature Neon Red & Obsidian',
    tag: 'ORIGINAL',
    previewPrimary: '#FF1E44',
    previewSecondary: '#291419',
    colors: {
      background: '#070709',
      surface: '#111116',
      surfaceLight: '#1B1B22',
      surfaceBorder: '#291419',

      primary: '#FF1E44',
      primaryGlow: 'rgba(255, 30, 68, 0.35)',
      primaryDark: '#8F0E23',
      primaryDeep: '#4A0812',
      accent: '#FF4D6D',

      textPrimary: '#FFFFFF',
      textSecondary: '#8E8E9F',
      textMuted: '#525263',

      ringGradient: ['#FF4D6D', '#FF1E44', '#9E0B22'],
      cardBadgeBg: 'rgba(255, 30, 68, 0.12)',
      cardBadgeBorder: 'rgba(255, 30, 68, 0.3)',

      waterBlue: '#2A9DFF',
      success: '#10B981',
      danger: '#EF4444',
      warning: '#F59E0B',
    },
  },
  frost: {
    id: 'frost',
    name: 'Obsidian Frost',
    subtitle: 'Electric Ice Cyan & Deep Night',
    tag: 'CYBER',
    previewPrimary: '#00D2FF',
    previewSecondary: '#142B42',
    colors: {
      background: '#05080E',
      surface: '#0B111A',
      surfaceLight: '#121D2B',
      surfaceBorder: '#142B42',

      primary: '#00D2FF',
      primaryGlow: 'rgba(0, 210, 255, 0.35)',
      primaryDark: '#007799',
      primaryDeep: '#003847',
      accent: '#38BDF8',

      textPrimary: '#FFFFFF',
      textSecondary: '#7DD3FC',
      textMuted: '#3B6888',

      ringGradient: ['#38BDF8', '#00D2FF', '#0369A1'],
      cardBadgeBg: 'rgba(0, 210, 255, 0.12)',
      cardBadgeBorder: 'rgba(0, 210, 255, 0.3)',

      waterBlue: '#38BDF8',
      success: '#10B981',
      danger: '#EF4444',
      warning: '#F59E0B',
    },
  },
};
