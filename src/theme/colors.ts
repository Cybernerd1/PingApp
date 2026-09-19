/**
 * Ping Design System — Color Palette
 * Reference: ping-design-system.md
 */

export const Colors = {
  // Brand Colors
  magenta: '#E8447A', // Primary — buttons, headlines, active states
  coral: '#F2865F',   // Secondary — accents, gradients, highlights
  peach: '#F4A47C',   // Accent — illustrations, decorative elements

  // Neutral Support Colors
  plum: '#2B1620',    // Primary text, dark surfaces
  cream: '#FBEEE6',   // Page background
  blush: '#FBDCE6',   // Card/tag surfaces, subtle backgrounds

  // Utility colors
  white: '#FFFFFF',
  cardShadow: 'rgba(43, 22, 32, 0.08)',
  textMuted: 'rgba(43, 22, 32, 0.6)',
  borderLight: 'rgba(232, 68, 122, 0.2)',
  inputBackground: '#FFFFFF',

  // Status & Swipe Feedback
  likeGreen: '#4CAF50',
  passRed: '#FF5252',
  superlikeBlue: '#2196F3',
  gold: '#FFC107',
};

export type ColorType = typeof Colors;
