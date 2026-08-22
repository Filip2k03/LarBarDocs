/**
 * LarBar Red & Gold Design System Tokens for React Native (iOS & Android)
 */

export const Colors = {
  // Imperial Crimson Red (SOS & Critical Alerts)
  red: {
    100: '#FFE8E8',
    200: '#FFC2C2',
    300: '#FF8F8F',
    400: '#F85A5A',
    500: '#E5252A', // Primary Red
    600: '#C41419',
    700: '#9E0D11',
    800: '#74070A',
    900: '#480204',
  },
  // Royal Gold (Primary CTAs & VIP)
  gold: {
    100: '#FFF8E1',
    200: '#FFECB3',
    300: '#FFE082',
    400: '#FFCA28',
    500: '#F59E0B', // Primary Gold
    600: '#D97706',
    700: '#B45309',
    800: '#78350F',
    900: '#451A03',
  },
  // Emerald Green (Success, Shift ON, Safe Status)
  emerald: {
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
  },
  // Noir Jet Dark Theme Surfaces
  surface: {
    bg: '#0E0F14',
    card: '#181922',
    cardElevated: '#242533',
    border: '#282836',
    textPrimary: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
  }
} as const;

export const Typography = {
  fontFamily: {
    primary: 'Pyidaungsu',
    myanmar: 'Myanmar3',
    system: '-apple-system',
  },
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    hero: 34,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  }
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;
