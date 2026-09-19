import React from 'react';
import Svg, {
  Circle,
  Path,
  Rect,
  G,
} from 'react-native-svg';
import { Colors } from '../../theme/colors';

interface IllustrationProps {
  width?: number;
  height?: number;
}

/**
 * Slide 1 SVG — Real People, Happier Conversations
 */
export const OnboardingSlide1SVG: React.FC<IllustrationProps> = ({
  width = 280,
  height = 240,
}) => (
  <Svg width={width} height={height} viewBox="0 0 280 240" fill="none">
    {/* Background Soft Glow Rings */}
    <Circle cx="140" cy="120" r="100" fill={Colors.blush} />
    <Circle cx="140" cy="120" r="75" fill="#FAD4E2" />

    {/* Connecting Dashed Arc */}
    <Path
      d="M 85 130 Q 140 70 195 130"
      stroke={Colors.magenta}
      strokeWidth="3"
      strokeDasharray="6 6"
      fill="none"
    />

    {/* Central Heart Badge */}
    <Circle cx="140" cy="90" r="22" fill={Colors.magenta} />
    <Path
      d="M 140 99 C 140 99 127 91 127 83.5 C 127 79 130.5 76 135 76 C 137.6 76 139.4 77.2 140 78.5 C 140.6 77.2 142.4 76 145 76 C 149.5 76 153 79 153 83.5 C 153 91 140 99 140 99 Z"
      fill={Colors.white}
    />

    {/* Left User Card */}
    <G transform="translate(45, 90)">
      <Rect width="75" height="95" rx="16" fill={Colors.white} stroke={Colors.blush} strokeWidth="2" />
      <Circle cx="37.5" cy="36" r="20" fill={Colors.magenta} />
      <Circle cx="33" cy="32" r="2" fill={Colors.white} />
      <Circle cx="42" cy="32" r="2" fill={Colors.white} />
      <Path d="M 32 40 Q 37.5 45 43 40" stroke={Colors.white} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <Rect x="15" y="65" width="45" height="8" rx="4" fill={Colors.blush} />
      <Rect x="20" y="77" width="35" height="6" rx="3" fill={Colors.peach} />
    </G>

    {/* Right User Card */}
    <G transform="translate(160, 90)">
      <Rect width="75" height="95" rx="16" fill={Colors.white} stroke={Colors.blush} strokeWidth="2" />
      <Circle cx="37.5" cy="36" r="20" fill={Colors.peach} />
      <Circle cx="33" cy="32" r="2" fill={Colors.plum} />
      <Circle cx="42" cy="32" r="2" fill={Colors.plum} />
      <Path d="M 32 40 Q 37.5 45 43 40" stroke={Colors.plum} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <Rect x="15" y="65" width="45" height="8" rx="4" fill={Colors.blush} />
      <Rect x="20" y="77" width="35" height="6" rx="3" fill={Colors.magenta} />
    </G>

    {/* Sparkles */}
    <Path d="M 35 45 L 37 52 L 44 54 L 37 56 L 35 63 L 33 56 L 26 54 L 33 52 Z" fill={Colors.coral} />
    <Path d="M 235 55 L 237 60 L 242 62 L 237 64 L 235 69 L 233 64 L 228 62 L 233 60 Z" fill={Colors.magenta} />
    <Circle cx="230" cy="190" r="6" fill={Colors.peach} />
    <Circle cx="50" cy="200" r="4" fill={Colors.coral} />
  </Svg>
);

/**
 * Slide 2 SVG — Instant Connections & Realtime Chat
 */
export const OnboardingSlide2SVG: React.FC<IllustrationProps> = ({
  width = 280,
  height = 240,
}) => (
  <Svg width={width} height={height} viewBox="0 0 280 240" fill="none">
    {/* Background */}
    <Circle cx="140" cy="120" r="95" fill={Colors.blush} />

    {/* Left Incoming Bubble */}
    <G transform="translate(30, 45)">
      <Rect width="150" height="54" rx="18" fill={Colors.white} />
      <Circle cx="26" cy="27" r="14" fill={Colors.peach} />
      <Rect x="48" y="18" width="80" height="8" rx="4" fill={Colors.plum} opacity={0.8} />
      <Rect x="48" y="31" width="55" height="6" rx="3" fill={Colors.plum} opacity={0.4} />
    </G>

    {/* Right Outgoing Bubble (Mine) — magenta fill */}
    <G transform="translate(100, 115)">
      <Rect width="150" height="48" rx="18" fill={Colors.magenta} />
      <Rect x="16" y="14" width="100" height="8" rx="4" fill={Colors.white} opacity={0.85} />
      <Rect x="16" y="27" width="70" height="7" rx="3" fill={Colors.white} opacity={0.55} />
    </G>

    {/* Audio Note Pill */}
    <G transform="translate(45, 175)">
      <Rect width="140" height="42" rx="21" fill={Colors.white} stroke={Colors.blush} strokeWidth="2" />
      <Circle cx="21" cy="21" r="13" fill={Colors.magenta} />
      <Path d="M 19 15 L 26 21 L 19 27 Z" fill={Colors.white} />
      <Rect x="44" y="14" width="3" height="14" rx="1.5" fill={Colors.coral} />
      <Rect x="51" y="10" width="3" height="22" rx="1.5" fill={Colors.magenta} />
      <Rect x="58" y="16" width="3" height="10" rx="1.5" fill={Colors.coral} />
      <Rect x="65" y="8" width="3" height="26" rx="1.5" fill={Colors.magenta} />
      <Rect x="72" y="13" width="3" height="16" rx="1.5" fill={Colors.coral} />
      <Rect x="79" y="17" width="3" height="8" rx="1.5" fill={Colors.peach} />
    </G>

    {/* Notification Badge */}
    <Circle cx="218" cy="58" r="18" fill={Colors.coral} />
    <Path d="M 218 50 L 218 58" stroke={Colors.white} strokeWidth="2.5" strokeLinecap="round" />
    <Circle cx="218" cy="64" r="2" fill={Colors.white} />

    {/* Floating Dots */}
    <Circle cx="25" cy="130" r="5" fill={Colors.magenta} />
    <Circle cx="255" cy="185" r="7" fill={Colors.peach} />
  </Svg>
);

/**
 * Slide 3 SVG — Find Your Vibe Nearby
 */
export const OnboardingSlide3SVG: React.FC<IllustrationProps> = ({
  width = 280,
  height = 240,
}) => (
  <Svg width={width} height={height} viewBox="0 0 280 240" fill="none">
    {/* Radar Rings */}
    <Circle cx="140" cy="120" r="105" fill={Colors.blush} opacity={0.4} />
    <Circle cx="140" cy="120" r="75" stroke={Colors.coral} strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
    <Circle cx="140" cy="120" r="45" stroke={Colors.magenta} strokeWidth="2" fill="none" />

    {/* Center Pin */}
    <Circle cx="140" cy="115" r="22" fill="#FAD4E2" />
    <Circle cx="140" cy="115" r="15" fill={Colors.magenta} />
    <Circle cx="140" cy="115" r="6" fill={Colors.white} />
    {/* Pin tail */}
    <Path d="M 140 130 L 140 140" stroke={Colors.magenta} strokeWidth="3" strokeLinecap="round" />

    {/* Nearby Avatar 1 */}
    <G transform="translate(50, 60)">
      <Circle cx="16" cy="16" r="16" fill={Colors.white} stroke={Colors.magenta} strokeWidth="2" />
      <Circle cx="16" cy="16" r="12" fill={Colors.peach} />
      <Circle cx="13" cy="13" r="1.5" fill={Colors.plum} />
      <Circle cx="19" cy="13" r="1.5" fill={Colors.plum} />
      <Path d="M 12 18 Q 16 22 20 18" stroke={Colors.plum} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </G>

    {/* Nearby Avatar 2 */}
    <G transform="translate(200, 85)">
      <Circle cx="18" cy="18" r="18" fill={Colors.white} stroke={Colors.coral} strokeWidth="2" />
      <Circle cx="18" cy="18" r="14" fill={Colors.magenta} />
      <Circle cx="14" cy="15" r="1.5" fill={Colors.white} />
      <Circle cx="22" cy="15" r="1.5" fill={Colors.white} />
      <Path d="M 13 21 Q 18 25 23 21" stroke={Colors.white} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </G>

    {/* Nearby Avatar 3 */}
    <G transform="translate(75, 165)">
      <Circle cx="15" cy="15" r="15" fill={Colors.white} stroke={Colors.peach} strokeWidth="2" />
      <Circle cx="15" cy="15" r="11" fill={Colors.coral} />
      <Circle cx="12" cy="13" r="1.5" fill={Colors.white} />
      <Circle cx="18" cy="13" r="1.5" fill={Colors.white} />
      <Path d="M 11 18 Q 15 22 19 18" stroke={Colors.white} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </G>

    {/* Interest Tag Pills */}
    <G transform="translate(160, 165)">
      <Rect width="82" height="26" rx="13" fill={Colors.blush} />
      <Rect x="14" y="9" width="54" height="8" rx="4" fill={Colors.magenta} opacity={0.8} />
    </G>

    <G transform="translate(30, 115)">
      <Rect width="65" height="26" rx="13" fill={Colors.blush} />
      <Rect x="12" y="9" width="41" height="8" rx="4" fill={Colors.magenta} opacity={0.8} />
    </G>

    {/* Distance Tag */}
    <G transform="translate(105, 30)">
      <Rect width="70" height="24" rx="12" fill={Colors.magenta} />
      <Rect x="12" y="8" width="46" height="8" rx="4" fill={Colors.white} opacity={0.85} />
    </G>
  </Svg>
);
