import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../theme/colors';
import { Radius, Typography } from '../theme/typography';

interface TagProps {
  label: string;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * Interest Tag Component
 * Blush pill background (#FBDCE6), magenta text (#E8447A), 13px Inter
 */
export const Tag: React.FC<TagProps> = ({ label, icon, style, textStyle }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, textStyle]}>
        {icon ? `${icon}  ${label}` : label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.blush,
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginRight: 6,
    marginBottom: 6,
  },
  text: {
    ...Typography.caption,
    color: Colors.magenta,
    fontWeight: '600',
  },
});
