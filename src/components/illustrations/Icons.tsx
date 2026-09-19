/**
 * Ping Design System — Centralized SVG Icon Set
 *
 * All icons use rounded stroke caps & joins, 2px stroke weight.
 * Default color: Colors.plum (#2B1620)
 * Consistent with the brand's rounded, playful aesthetic.
 */
import React from 'react';
import Svg, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg';
import { Colors } from '../../theme/colors';

interface IconProps {
  size?: number;
  color?: string;
}

/** Home — rounded house outline */
export const HomeIcon: React.FC<IconProps> = ({ size = 24, color = Colors.plum }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 21V13h6v8"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** Chat Bubble — rounded speech bubble */
export const ChatBubbleIcon: React.FC<IconProps> = ({ size = 24, color = Colors.plum }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** User — rounded person outline */
export const UserIcon: React.FC<IconProps> = ({ size = 24, color = Colors.plum }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx={12}
      cy={8}
      r={4}
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20 21c0-3.314-3.582-6-8-6s-8 2.686-8 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** Bell — notification bell */
export const BellIcon: React.FC<IconProps> = ({ size = 24, color = Colors.plum }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.73 21a2 2 0 01-3.46 0"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** Edit Profile — pencil with user */
export const EditProfileIcon: React.FC<IconProps> = ({ size = 24, color = Colors.plum }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** Shield — privacy/security */
export const ShieldIcon: React.FC<IconProps> = ({ size = 24, color = Colors.plum }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** Settings — sliders/adjustments */
export const SettingsIcon: React.FC<IconProps> = ({ size = 24, color = Colors.plum }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1={4} y1={21} x2={4} y2={14} stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Line x1={4} y1={10} x2={4} y2={3} stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Line x1={12} y1={21} x2={12} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Line x1={12} y1={8} x2={12} y2={3} stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Line x1={20} y1={21} x2={20} y2={16} stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Line x1={20} y1={12} x2={20} y2={3} stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Line x1={1} y1={14} x2={7} y2={14} stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Line x1={9} y1={8} x2={15} y2={8} stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Line x1={17} y1={16} x2={23} y2={16} stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

/** Logout — door with arrow */
export const LogoutIcon: React.FC<IconProps> = ({ size = 24, color = Colors.plum }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Polyline
      points="16 17 21 12 16 7"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1={21} y1={12} x2={9} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

/** Eye Open — password visibility on */
export const EyeOpenIcon: React.FC<IconProps> = ({ size = 24, color = Colors.plum }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx={12}
      cy={12}
      r={3}
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** Eye Closed — password visibility off */
export const EyeClosedIcon: React.FC<IconProps> = ({ size = 24, color = Colors.plum }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1={1} y1={1} x2={23} y2={23} stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

/** Chevron Right — list item arrow */
export const ChevronRightIcon: React.FC<IconProps> = ({ size = 24, color = Colors.plum }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline
      points="9 18 15 12 9 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** Back Arrow — navigation back */
export const BackArrowIcon: React.FC<IconProps> = ({ size = 24, color = Colors.plum }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline
      points="15 18 9 12 15 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** Close X — modal/dialog close */
export const CloseIcon: React.FC<IconProps> = ({ size = 24, color = Colors.plum }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1={18} y1={6} x2={6} y2={18} stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Line x1={6} y1={6} x2={18} y2={18} stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

/** Send — message send arrow */
export const SendIcon: React.FC<IconProps> = ({ size = 24, color = Colors.plum }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 2L11 13"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 2L15 22l-4-9-9-4 20-7z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** More (vertical dots) — context menu */
export const MoreIcon: React.FC<IconProps> = ({ size = 24, color = Colors.plum }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={5} r={1.5} fill={color} />
    <Circle cx={12} cy={12} r={1.5} fill={color} />
    <Circle cx={12} cy={19} r={1.5} fill={color} />
  </Svg>
);

/** Camera — edit avatar */
export const CameraIcon: React.FC<IconProps> = ({ size = 24, color = Colors.plum }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx={12}
      cy={13}
      r={4}
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** Down Arrow — used in FullProfileModal close button */
export const DownArrowIcon: React.FC<IconProps> = ({ size = 24, color = Colors.plum }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline
      points="6 9 12 15 18 9"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
