import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { ChipTints, Colors } from '../theme/colors';
import { Radius, Typography } from '../theme/typography';

interface ChipProps {
  label: string;
  emoji?: string;
  selected?: boolean;
  onPress?: () => void;
  /** Index used to rotate the pastel text tint like the reference interest chips. */
  tintIndex?: number;
  style?: StyleProp<ViewStyle>;
}

export const Chip: React.FC<ChipProps> = ({ label, emoji, selected, onPress, tintIndex = 0, style }) => {
  const tint = ChipTints[tintIndex % ChipTints.length];
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selected : null,
        pressed ? styles.pressed : null,
        style,
      ]}
    >
      <Text style={[styles.text, { color: selected ? Colors.white : tint }]}>
        {emoji ? `${emoji}  ` : ''}
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    backgroundColor: Colors.glassStrong,
    borderWidth: 1,
    borderColor: 'rgba(18,16,22,0.06)',
  },
  selected: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  pressed: { transform: [{ scale: 0.96 }] },
  text: { ...Typography.label },
});
