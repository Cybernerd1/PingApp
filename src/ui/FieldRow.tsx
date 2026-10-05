import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Colors } from '../theme/colors';
import { Radius, Typography } from '../theme/typography';

interface FieldRowProps extends TextInputProps {
  label: string;
  hint?: string;
  error?: string;
  right?: React.ReactNode;
  readOnly?: boolean;
}

/**
 * Labelled glass input row ("Full Name / Enter name", "Email Address / Enter your email").
 */
export const FieldRow: React.FC<FieldRowProps> = ({ label, hint, error, right, readOnly, style, ...input }) => (
  <View style={styles.wrap}>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.box, !!error && styles.boxError, readOnly && styles.boxRead]}>
      <TextInput
        placeholderTextColor={Colors.faint}
        editable={!readOnly}
        style={[styles.input, style]}
        {...input}
      />
      {right}
    </View>
    {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: { marginBottom: 18 },
  label: { ...Typography.label, color: Colors.ink, marginBottom: 8, marginLeft: 4 },
  box: {
    minHeight: 56,
    borderRadius: Radius.card,
    backgroundColor: Colors.glassStrong,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  boxError: { borderColor: Colors.danger },
  boxRead: { backgroundColor: Colors.glass },
  input: { flex: 1, ...Typography.body, color: Colors.ink, paddingVertical: 14 },
  hint: { ...Typography.caption, color: Colors.mute, marginTop: 6, marginLeft: 4 },
  error: { ...Typography.caption, color: Colors.danger, marginTop: 6, marginLeft: 4 },
});
