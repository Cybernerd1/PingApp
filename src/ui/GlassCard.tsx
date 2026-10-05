import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '../theme/colors';
import { Radius, Shadow } from '../theme/typography';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  strong?: boolean;
  padded?: boolean;
}

/** Frosted white card used for form rows, profile sections and sheets. */
export const GlassCard: React.FC<GlassCardProps> = ({ children, style, strong, padded = true }) => (
  <View
    style={[
      styles.card,
      { backgroundColor: strong ? Colors.glassStrong : Colors.glass },
      padded && styles.padded,
      Shadow.soft,
      style,
    ]}
  >
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  padded: { padding: 16 },
});
