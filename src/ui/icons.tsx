import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors } from '../theme/colors';

export interface IconProps {
  size?: number;
  color?: string;
}

export const ArrowLeft: React.FC<IconProps> = ({ size = 22, color = Colors.ink }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M11 6l-6 6 6 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const Plus: React.FC<IconProps> = ({ size = 18, color = Colors.ink }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
  </Svg>
);

export const Minus: React.FC<IconProps> = ({ size = 18, color = Colors.ink }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12h14" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
  </Svg>
);

export const Close: React.FC<IconProps> = ({ size = 18, color = Colors.ink }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
  </Svg>
);

export const Check: React.FC<IconProps> = ({ size = 14, color = Colors.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12.5l4.5 4.5L19 7.5" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const Crosshair: React.FC<IconProps> = ({ size = 20, color = Colors.ink }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={6.5} stroke={color} strokeWidth={1.8} />
    <Circle cx={12} cy={12} r={2} fill={color} />
    <Path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const Pin: React.FC<IconProps> = ({ size = 16, color = Colors.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21s-7-6.2-7-11.5A7 7 0 0119 9.5C19 14.8 12 21 12 21z"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
    />
    <Circle cx={12} cy={9.5} r={2.5} stroke={color} strokeWidth={2} />
  </Svg>
);

export const Camera: React.FC<IconProps> = ({ size = 22, color = Colors.ink }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 8.5A2.5 2.5 0 016.5 6h1.6l1.3-2h5.2l1.3 2h1.6A2.5 2.5 0 0120 8.5v8A2.5 2.5 0 0117.5 19h-11A2.5 2.5 0 014 16.5v-8z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Circle cx={12} cy={12.5} r={3.3} stroke={color} strokeWidth={1.8} />
  </Svg>
);

export const Star: React.FC<IconProps> = ({ size = 12, color = Colors.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3z" />
  </Svg>
);

export const Mail: React.FC<IconProps> = ({ size = 20, color = Colors.ink }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 6.5h16v11H4z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    <Path d="M4.5 7l7.5 6 7.5-6" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
  </Svg>
);

/** Multi-colour Google "G". */
export const GoogleG: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <Path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <Path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <Path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </Svg>
);

export const ChevronRight: React.FC<IconProps> = ({ size = 18, color = Colors.faint }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 6l6 6-6 6" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const Heart: React.FC<IconProps & { filled?: boolean }> = ({ size = 24, color = Colors.white, filled = true }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
    <Path
      d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.8 3.6 4.5 7 4.5c2 0 3.6 1.1 5 2.9 1.4-1.8 3-2.9 5-2.9 3.4 0 5.6 3.3 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"
      stroke={color}
      strokeWidth={filled ? 0 : 2}
      strokeLinejoin="round"
    />
  </Svg>
);

export const Rewind: React.FC<IconProps> = ({ size = 20, color = Colors.ink }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 4v6h6" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M5.5 15a7 7 0 101.6-7.3L4 10" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const Sliders: React.FC<IconProps> = ({ size = 20, color = Colors.ink }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 7h10M18 7h2M4 17h4M12 17h8" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Circle cx={16} cy={7} r={2.2} stroke={color} strokeWidth={2} />
    <Circle cx={10} cy={17} r={2.2} stroke={color} strokeWidth={2} />
  </Svg>
);

export const Bell: React.FC<IconProps> = ({ size = 20, color = Colors.ink }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 16V11a6 6 0 1112 0v5l1.5 2h-15L6 16z" stroke={color} strokeWidth={1.9} strokeLinejoin="round" />
    <Path d="M10 20.5a2.2 2.2 0 004 0" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
  </Svg>
);

export const HomeIcon: React.FC<IconProps> = ({ size = 22, color = Colors.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 20s-6.5-4-8-7.8C2.9 9.2 4.8 6.5 7.6 6.5c1.7 0 3.1.9 4.4 2.5 1.3-1.6 2.7-2.5 4.4-2.5 2.8 0 4.7 2.7 3.6 5.7C18.5 16 12 20 12 20z" stroke={color} strokeWidth={1.9} strokeLinejoin="round" />
  </Svg>
);

export const NearbyIcon: React.FC<IconProps> = ({ size = 22, color = Colors.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 21s-6.5-5.8-6.5-11A6.5 6.5 0 0118.5 10C18.5 15.2 12 21 12 21z" stroke={color} strokeWidth={1.9} strokeLinejoin="round" />
    <Circle cx={12} cy={10} r={2.3} stroke={color} strokeWidth={1.9} />
  </Svg>
);

export const ChatIcon: React.FC<IconProps> = ({ size = 24, color = Colors.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 11.5C4 7.4 7.6 4.5 12 4.5s8 2.9 8 7-3.6 7-8 7c-1 0-2-.1-2.9-.4L5 19.5l1.2-3.4C4.8 14.9 4 13.3 4 11.5z" stroke={color} strokeWidth={1.9} strokeLinejoin="round" />
    <Path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" stroke={color} strokeWidth={2.6} strokeLinecap="round" />
  </Svg>
);

export const FansIcon: React.FC<IconProps> = ({ size = 22, color = Colors.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.4 7.2 17.9l.9-5.4L4.2 8.7l5.4-.8L12 3z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    <Path d="M8 21h8" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const UserIcon: React.FC<IconProps> = ({ size = 22, color = Colors.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8.5} r={3.8} stroke={color} strokeWidth={1.9} />
    <Path d="M4.5 20c.8-3.6 3.8-5.5 7.5-5.5s6.7 1.9 7.5 5.5" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
  </Svg>
);

export const Send: React.FC<IconProps> = ({ size = 20, color = Colors.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 12L20 4l-5 16-3-6.5L4 12z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    <Path d="M12 13.5L20 4" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export const ImageIcon: React.FC<IconProps> = ({ size = 20, color = Colors.ink }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v11a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 17.5v-11z" stroke={color} strokeWidth={1.8} />
    <Circle cx={9} cy={9.5} r={1.7} stroke={color} strokeWidth={1.8} />
    <Path d="M5 18l5-5 3 3 2.5-2.5L20 18" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
  </Svg>
);

export const More: React.FC<IconProps> = ({ size = 20, color = Colors.ink }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Circle cx={5} cy={12} r={2} />
    <Circle cx={12} cy={12} r={2} />
    <Circle cx={19} cy={12} r={2} />
  </Svg>
);

export const Verified: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={10} fill={Colors.online} />
    <Path d="M7.5 12.5l3 3 6-6.5" stroke="#fff" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const Edit: React.FC<IconProps> = ({ size = 16, color = Colors.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 20h4L19 9l-4-4L4 16v4z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
  </Svg>
);

/** Four-point sparkle — Ping Assistant. */
export const Sparkle: React.FC<IconProps> = ({ size = 20, color = Colors.ink }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2.5l1.9 5.6c.3.9 1 1.6 1.9 1.9l5.7 2-5.7 2c-.9.3-1.6 1-1.9 1.9L12 21.5l-1.9-5.6c-.3-.9-1-1.6-1.9-1.9l-5.7-2 5.7-2c.9-.3 1.6-1 1.9-1.9L12 2.5z" fill={color} />
    <Path d="M19 2v4M17 4h4" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
  </Svg>
);

export const Eye: React.FC<IconProps> = ({ size = 20, color = Colors.ink }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.8} />
  </Svg>
);

export const EyeOff: React.FC<IconProps> = ({ size = 20, color = Colors.ink }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 3l18 18M10.6 5.1A10.8 10.8 0 0112 5c6.4 0 10 7 10 7a17.6 17.6 0 01-3.1 4M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7c1.7 0 3.2-.5 4.5-1.2M9.9 9.9a3 3 0 004.2 4.2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
