import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect, Ellipse } from 'react-native-svg';
import { Palette } from '../theme/colors';

interface GradientBackgroundProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** 'holo' = full holographic wash (onboarding/home), 'soft' = lighter wash (forms, lists) */
  variant?: 'holo' | 'soft';
}

/**
 * Holographic lilac / mint / peach backdrop from the reference design.
 * Pure react-native-svg — no extra native dependency.
 */
export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  style,
  variant = 'holo',
}) => {
  const blobOpacity = variant === 'holo' ? 0.9 : 0.55;
  return (
    <View style={[styles.root, style]}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="base" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#F4F1FA" />
            <Stop offset="0.55" stopColor="#EEE8F8" />
            <Stop offset="1" stopColor="#F5EFF3" />
          </LinearGradient>
          <RadialGradient id="mint" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={Palette.mint} stopOpacity={blobOpacity} />
            <Stop offset="1" stopColor={Palette.mint} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="lilac" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={Palette.lilac} stopOpacity={blobOpacity} />
            <Stop offset="1" stopColor={Palette.lilac} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="peach" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={Palette.peach} stopOpacity={blobOpacity} />
            <Stop offset="1" stopColor={Palette.peach} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="sky" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={Palette.sky} stopOpacity={blobOpacity} />
            <Stop offset="1" stopColor={Palette.sky} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#base)" />
        <Ellipse cx="0%" cy="18%" rx="70%" ry="35%" fill="url(#mint)" />
        <Ellipse cx="100%" cy="8%" rx="60%" ry="30%" fill="url(#peach)" />
        <Ellipse cx="85%" cy="55%" rx="70%" ry="35%" fill="url(#lilac)" />
        <Ellipse cx="10%" cy="80%" rx="65%" ry="30%" fill="url(#sky)" />
        <Ellipse cx="90%" cy="100%" rx="60%" ry="25%" fill="url(#mint)" />
      </Svg>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F1EEF8' },
});
