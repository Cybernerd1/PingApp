import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../theme/colors';
import { Radius, Typography } from '../theme/typography';
import { ArrowLeft } from './icons';

interface StepHeaderProps {
  step: number;
  total: number;
  onBack?: () => void;
  onSkip?: () => void;
  skipLabel?: string;
}

/** Back button · segmented progress · optional skip — top of every onboarding step. */
export const StepHeader: React.FC<StepHeaderProps> = ({ step, total, onBack, onSkip, skipLabel = 'Skip' }) => (
  <View style={styles.row}>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={onBack}
      disabled={!onBack}
      style={[styles.back, !onBack && styles.hidden]}
      hitSlop={8}
    >
      <ArrowLeft />
    </Pressable>

    <View style={styles.track} accessibilityLabel={`Step ${step} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.seg, i < step ? styles.segOn : null]} />
      ))}
    </View>

    {onSkip ? (
      <Pressable accessibilityRole="button" onPress={onSkip} hitSlop={8} style={styles.skipBtn}>
        <Text style={styles.skip}>{skipLabel}</Text>
      </Pressable>
    ) : (
      <View style={styles.skipBtn} />
    )}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 8, height: 56 },
  back: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Colors.glassStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hidden: { opacity: 0 },
  track: { flex: 1, flexDirection: 'row', gap: 6 },
  seg: { flex: 1, height: 5, borderRadius: 3, backgroundColor: 'rgba(18,16,22,0.10)' },
  segOn: { backgroundColor: Colors.ink },
  skipBtn: { minWidth: 44, alignItems: 'flex-end' },
  skip: { ...Typography.label, color: Colors.mute },
});
