/**
 * Ping Design System — Color Palette (v2, lilac / holographic)
 *
 * Matches the lilac holographic UI reference adopted 2026-10.
 * Legacy keys (magenta, coral, plum, cream, blush…) are kept so
 * un-migrated screens pick up the new look automatically:
 *   magenta → primary purple, plum → ink, cream → page lilac, blush → soft lilac.
 */

export const Palette = {
  purple: '#9B3CF2',       // Primary accent — FAB, active tab, links, verified
  purpleDeep: '#7A22D6',   // Pressed / gradient end
  purpleSoft: '#EADCFD',   // Tinted surfaces, selected chip bg
  lilac: '#D9CCF2',        // Holographic stop
  mint: '#D6EFEC',         // Holographic stop
  peach: '#F6E3D3',        // Holographic stop
  sky: '#DCE6F8',          // Holographic stop
  ink: '#121016',          // Primary text, black pill buttons, nav bar
  inkSoft: '#2A2630',
  mute: '#6F6A78',         // Secondary text
  faint: '#A6A1AE',        // Placeholder / disabled
  line: 'rgba(18, 16, 22, 0.08)',
  glass: 'rgba(255, 255, 255, 0.72)',
  glassStrong: 'rgba(255, 255, 255, 0.9)',
  white: '#FFFFFF',
  online: '#3CCB7F',       // Verified / online dot
  red: '#FF3B5C',          // Dislike ✕
};

/** Pastel chip text colours, rotated across interest chips (as in the reference). */
export const ChipTints = ['#3B7BF6', '#E0911B', '#2E9E6A', '#E2457A', '#7A4BE0', '#C9772A', '#1A9BB0'];

/** Holographic background gradient stops (top-left → bottom-right). */
export const HoloStops = [Palette.mint, Palette.lilac, Palette.sky, Palette.peach];

export const Colors = {
  // Brand (legacy names remapped)
  magenta: Palette.purple,
  coral: Palette.red,
  peach: Palette.peach,
  plum: Palette.ink,
  cream: '#F1EEF8',
  blush: Palette.purpleSoft,

  // New names
  primary: Palette.purple,
  primaryDeep: Palette.purpleDeep,
  primarySoft: Palette.purpleSoft,
  ink: Palette.ink,
  mute: Palette.mute,
  faint: Palette.faint,
  line: Palette.line,
  glass: Palette.glass,
  glassStrong: Palette.glassStrong,
  online: Palette.online,

  // Utility
  white: '#FFFFFF',
  cardShadow: 'rgba(18, 16, 22, 0.10)',
  textMuted: Palette.mute,
  borderLight: 'rgba(155, 60, 242, 0.22)',
  inputBackground: Palette.glassStrong,

  // Swipe feedback
  like: Palette.purple,
  pass: Palette.red,
  superlike: Palette.purple,
  danger: Palette.red,
};

export type ColorType = typeof Colors;
