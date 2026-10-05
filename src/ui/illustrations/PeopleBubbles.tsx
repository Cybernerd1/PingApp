import React from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop, ClipPath, Ellipse } from 'react-native-svg';
import { Palette } from '../../theme/colors';

/**
 * Welcome-screen illustration: five original stylised people inside lilac
 * "lollipop" bubbles whose stems converge at the bottom (inspired by the
 * reference layout — characters are generic, drawn from simple shapes).
 */

interface Person {
  cx: number;
  cy: number;
  r: number;
  bg: [string, string];
  skin: string;
  hair: string;
  top: string;
  hairStyle: 'bun' | 'bob' | 'short' | 'curly' | 'long';
}

const PEOPLE: Person[] = [
  { cx: 92, cy: 78, r: 50, bg: ['#FBD9B8', '#F2B48A'], skin: '#C98B63', hair: '#2B1C17', top: '#3C3F57', hairStyle: 'short' },
  { cx: 238, cy: 118, r: 46, bg: ['#FFE3A8', '#F7B957'], skin: '#E7B595', hair: '#1D1A22', top: '#D8452F', hairStyle: 'bob' },
  { cx: 68, cy: 210, r: 46, bg: ['#E7D7FF', '#BFA2F2'], skin: '#D9A07C', hair: '#B5532A', top: '#2E8C76', hairStyle: 'bun' },
  { cx: 262, cy: 250, r: 46, bg: ['#D2F2EA', '#93D8C6'], skin: '#F0C7A8', hair: '#1F7A63', top: '#E07A2B', hairStyle: 'long' },
  { cx: 132, cy: 322, r: 46, bg: ['#E2E7F7', '#B7C2EA'], skin: '#C88E6B', hair: '#2A2328', top: '#59472F', hairStyle: 'curly' },
];

const STEM_BASE = { x: 175, y: 470 };

function hairPath(p: Person, s: number): React.ReactNode {
  const { cx, cy } = p;
  const headY = cy - 2 * s;
  switch (p.hairStyle) {
    case 'bun':
      return (
        <G>
          <Circle cx={cx} cy={headY - 22 * s} r={9 * s} fill={p.hair} />
          <Path d={`M${cx - 17 * s} ${headY} q0 -20 ${17 * s} -20 q${17 * s} 0 ${17 * s} 20 z`} fill={p.hair} />
        </G>
      );
    case 'bob':
    case 'long':
      // Fringe cap; the back of the hair is drawn behind the head in hairBack().
      return (
        <Path
          d={`M${cx - 16 * s} ${headY} A${16 * s} ${18 * s} 0 0 1 ${cx + 16 * s} ${headY} Q${cx + 4 * s} ${headY - 9 * s} ${cx - 16 * s} ${headY} Z`}
          fill={p.hair}
        />
      );
    case 'curly':
      return (
        <G>
          {[-14, -6, 2, 10, 16].map((dx, i) => (
            <Circle key={i} cx={cx + dx * s} cy={headY - 14 * s + (i % 2) * 3} r={8 * s} fill={p.hair} />
          ))}
        </G>
      );
    default:
      return <Path d={`M${cx - 16 * s} ${headY - 2} q2 -20 ${16 * s} -20 q${16 * s} 0 ${16 * s} 18 q-${8 * s} -8 -${20 * s} -6 z`} fill={p.hair} />;
  }
}

function hairBack(p: Person, s: number): React.ReactNode {
  if (p.hairStyle !== 'long' && p.hairStyle !== 'bob') return null;
  const headY = p.cy - 2 * s;
  const bottom = headY + (p.hairStyle === 'long' ? 30 : 14) * s;
  return (
    <Path
      d={`M${p.cx - 19 * s} ${bottom} V${headY - 2 * s} A${19 * s} ${21 * s} 0 0 1 ${p.cx + 19 * s} ${headY - 2 * s} V${bottom} Z`}
      fill={p.hair}
    />
  );
}

const PersonFigure: React.FC<{ p: Person }> = ({ p }) => {
  const s = p.r / 46;
  return (
    <G>
      {hairBack(p, s)}
      <Ellipse cx={p.cx} cy={p.cy + 46 * s} rx={30 * s} ry={22 * s} fill={p.top} />
      <Path d={`M${p.cx - 6 * s} ${p.cy + 10 * s} h${12 * s} v${14 * s} h-${12 * s} z`} fill={p.skin} />
      <Ellipse cx={p.cx} cy={p.cy - 2 * s} rx={15 * s} ry={18 * s} fill={p.skin} />
      {hairPath(p, s)}
      <Circle cx={p.cx - 5 * s} cy={p.cy - 2 * s} r={1.6 * s} fill="#1B1418" />
      <Circle cx={p.cx + 5 * s} cy={p.cy - 2 * s} r={1.6 * s} fill="#1B1418" />
      <Path
        d={`M${p.cx - 5 * s} ${p.cy + 6 * s} q${5 * s} ${4 * s} ${10 * s} 0`}
        stroke="#7A3B2E"
        strokeWidth={1.6 * s}
        fill="none"
        strokeLinecap="round"
      />
    </G>
  );
};

export type PortraitKind = 'woman' | 'man' | 'neutral';

const PORTRAITS: Record<PortraitKind, Person> = {
  woman: { cx: 50, cy: 58, r: 46, bg: ['#FBD3A6', '#E88A4E'], skin: '#E3AE8C', hair: '#5A2B1A', top: '#C9622F', hairStyle: 'long' },
  man: { cx: 50, cy: 58, r: 46, bg: ['#D8D0F6', '#9C86E6'], skin: '#C98B63', hair: '#1F1A1D', top: '#2F3550', hairStyle: 'short' },
  neutral: { cx: 50, cy: 58, r: 46, bg: ['#D2F2EA', '#86CDB8'], skin: '#D9A07C', hair: '#2A2328', top: '#4C5E3A', hairStyle: 'curly' },
};

/** Large single portrait used on the gender cards (fills its box, cropped). */
export const Portrait: React.FC<{ kind: PortraitKind; width: number; height: number }> = ({ kind, width, height }) => {
  const p = PORTRAITS[kind];
  return (
    <Svg width={width} height={height} viewBox="14 8 72 100" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id={`pbg-${kind}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={p.bg[0]} />
          <Stop offset="1" stopColor={p.bg[1]} />
        </LinearGradient>
      </Defs>
      <Path d="M0 0h100v120H0z" fill={`url(#pbg-${kind})`} />
      <PersonFigure p={p} />
    </Svg>
  );
};

export const PeopleBubbles: React.FC<{ width: number }> = ({ width }) => {
  const height = width * (480 / 340);
  return (
    <Svg width={width} height={height} viewBox="0 0 340 480">
      <Defs>
        {PEOPLE.map((p, i) => (
          <React.Fragment key={i}>
            <LinearGradient id={`bg${i}`} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={p.bg[0]} />
              <Stop offset="1" stopColor={p.bg[1]} />
            </LinearGradient>
            <ClipPath id={`clip${i}`}>
              <Circle cx={p.cx} cy={p.cy} r={p.r} />
            </ClipPath>
          </React.Fragment>
        ))}
      </Defs>

      {/* stems */}
      {PEOPLE.map((p, i) => (
        <Path
          key={`stem${i}`}
          d={`M${p.cx} ${p.cy + p.r} C ${p.cx} ${(p.cy + STEM_BASE.y) / 2}, ${STEM_BASE.x + (p.cx - STEM_BASE.x) * 0.2} ${STEM_BASE.y - 60}, ${STEM_BASE.x + (p.cx - STEM_BASE.x) * 0.1} ${STEM_BASE.y}`}
          stroke={Palette.lilac}
          strokeWidth={14}
          strokeLinecap="round"
          fill="none"
          opacity={0.95}
        />
      ))}

      {/* bubbles */}
      {PEOPLE.map((p, i) => (
        <G key={`p${i}`}>
          <Circle cx={p.cx} cy={p.cy} r={p.r + 7} fill="#C7AEF2" />
          <Circle cx={p.cx} cy={p.cy} r={p.r} fill={`url(#bg${i})`} />
          <G clipPath={`url(#clip${i})`}>
            <PersonFigure p={p} />
          </G>
        </G>
      ))}
    </Svg>
  );
};
