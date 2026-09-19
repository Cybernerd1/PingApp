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

  // Status & Swipe Feedback (brand-aligned)
  like: '#E8447A',        // Magenta — ping/like stamp & button
  pass: '#F2865F',        // Coral — pass/nope stamp & button
  superlike: '#E8447A',   // Magenta — super ping stamp & button
  danger: '#F2865F',      // Coral — destructive actions (logout, unmatch, errors)
};

export type ColorType = typeof Colors;
