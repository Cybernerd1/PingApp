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
