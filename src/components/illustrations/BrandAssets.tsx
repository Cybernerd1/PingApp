import React from 'react';
import Svg, { Rect, Text as SvgText, Circle, Path, G } from 'react-native-svg';
import { Colors } from '../../theme/colors';

interface LogoMarkProps {
  size?: number;
}

/**
 * Ping Brand Logo Mark — Solid "P" letterform in Magenta box
 */
export const LogoMark: React.FC<LogoMarkProps> = ({ size = 44 }) => {
  const radius = size * 0.32;
  const fontSize = size * 0.65;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <Rect width={size} height={size} rx={radius} fill={Colors.magenta} />
      <SvgText
        x={size * 0.32}
        y={size * 0.74}
        fill={Colors.white}
        fontSize={fontSize}
        fontWeight="800"
        fontFamily="System"
      >
        P
      </SvgText>
    </Svg>
  );
};

/**
 * Mascot Empty State Illustration — no LinearGradient
 */
export const MascotEmptyStateSVG: React.FC<{ width?: number; height?: number }> = ({
  width = 200,
  height = 180,
}) => (
  <Svg width={width} height={height} viewBox="0 0 200 180" fill="none">
    {/* Background aura */}
    <Circle cx="100" cy="90" r="75" fill={Colors.blush} />

    {/* Mascot Body */}
    <Rect x="50" y="40" width="100" height="95" rx="42" fill={Colors.magenta} />

    {/* Mascot Eyes */}
    <Circle cx="80" cy="75" r="7" fill={Colors.white} />
    <Circle cx="120" cy="75" r="7" fill={Colors.white} />
    <Circle cx="82" cy="76" r="3.5" fill={Colors.plum} />
    <Circle cx="122" cy="76" r="3.5" fill={Colors.plum} />

    {/* Cute Blush Cheeks */}
    <Circle cx="70" cy="88" r="6" fill={Colors.peach} opacity={0.8} />
    <Circle cx="130" cy="88" r="6" fill={Colors.peach} opacity={0.8} />

    {/* Smile */}
    <Path
      d="M 90 92 Q 100 102 110 92"
      stroke={Colors.white}
      strokeWidth="3.5"
      strokeLinecap="round"
      fill="none"
    />

    {/* Antenna */}
    <Path d="M 100 40 L 100 24" stroke={Colors.magenta} strokeWidth="3" strokeLinecap="round" />
    <Circle cx="100" cy="20" r="6" fill={Colors.coral} />
    <Circle cx="100" cy="20" r="11" stroke={Colors.coral} strokeWidth="1.5" strokeDasharray="2 2" fill="none" />

    {/* Side Hearts */}
    <Path d="M 35 70 Q 25 60 35 50 Q 45 60 35 70 Z" fill={Colors.peach} />
    <Path d="M 165 70 Q 155 60 165 50 Q 175 60 165 70 Z" fill={Colors.coral} />
  </Svg>
);
