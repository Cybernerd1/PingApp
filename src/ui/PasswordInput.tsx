import React, { useState } from 'react';
import { Pressable, TextInputProps } from 'react-native';
import { Colors } from '../theme/colors';
import { Eye, EyeOff } from './icons';
import { FieldRow } from './FieldRow';

interface PasswordInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  hint?: string;
  error?: string;
}

/** Password field with its own visibility state for password-manager support. */
export const PasswordInput: React.FC<PasswordInputProps> = ({ label, value, onChangeText, hint, error, ...input }) => {
  const [visible, setVisible] = useState(false);
  return (
    <FieldRow
      label={label}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      {...input}
      hint={hint}
      error={error}
      right={
        <Pressable
          onPress={() => setVisible(v => !v)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {visible ? <EyeOff color={Colors.mute} /> : <Eye color={Colors.mute} />}
        </Pressable>
      }
    />
  );
};
