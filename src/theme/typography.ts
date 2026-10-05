/**
 * Ping Design System — Typography, Spacing, Radii, Shadows (v2)
 * System font with heavy weights for headlines, matching the reference's
 * bold geometric display type.
 */
import { Platform } from 'react-native';

export const Typography = {
  display: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800' as const, // "Love is One Swipe Away"
    letterSpacing: -0.6,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800' as const, // "Love Starts Here", step titles
    letterSpacing: -0.4,
  },
  heading: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700' as const, // Screen titles
  },
  bodyStrong: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400' as const,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const, // Field labels
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const, // Meta text, distance
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const Radius = {
  small: 12,     // Inputs, small tiles
  card: 22,      // Glass cards, field rows
  largeCard: 32, // Photo cards, sheets
  pill: 999,     // Buttons, chips, avatars, nav
};

export const Shadow = {
  soft: Platform.select({
    ios: {
      shadowColor: '#121016',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 18,
    },
    default: { elevation: 3 },
  }) as object,
  lifted: Platform.select({
    ios: {
      shadowColor: '#121016',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.18,
      shadowRadius: 24,
    },
    default: { elevation: 8 },
  }) as object,
  glow: Platform.select({
    ios: {
      shadowColor: '#9B3CF2',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
    },
    default: { elevation: 8 },
  }) as object,
};
