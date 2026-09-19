/**
 * Ping Design System — Typography & Spacing & Radii
 * Reference: ping-design-system.md
 */

export const Typography = {
  display: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700' as const, // Fredoka style display
  },
  heading: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const, // Screen titles
  },
  bodyStrong: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const, // Names, labels
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400' as const, // Descriptions, form fields
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const, // Timestamps, tags, meta text
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
  small: 8,     // Tags, inputs
  card: 16,     // Match cards
  largeCard: 24, // Sheets, dialogs
  pill: 999,    // Buttons, avatars, badges
};
