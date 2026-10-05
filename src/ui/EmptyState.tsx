import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { PillButton } from './PillButton';

interface EmptyStateProps {
  title: string;
  message?: string;
  emoji?: string;
  actionLabel?: string;
  onAction?: () => void;
  loading?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, message, emoji = '💜', actionLabel, onAction, loading }) => (
  <View style={styles.wrap}>
    {loading ? <ActivityIndicator color={Colors.primary} size="large" /> : <Text style={styles.emoji}>{emoji}</Text>}
    <Text style={styles.title}>{title}</Text>
    {message ? <Text style={styles.msg}>{message}</Text> : null}
    {actionLabel && onAction ? <PillButton title={actionLabel} onPress={onAction} style={styles.btn} /> : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 40 },
  emoji: { fontSize: 48 },
  title: { ...Typography.heading, color: Colors.ink, textAlign: 'center', marginTop: 12 },
  msg: { ...Typography.body, color: Colors.mute, textAlign: 'center', marginTop: 6 },
  btn: { marginTop: 20, alignSelf: 'stretch' },
});
