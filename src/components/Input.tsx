import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Radius, Typography } from '../theme/typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isPassword = false,
  style,
  secureTextEntry,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.container,
          isFocused && styles.focusedContainer,
          !!error && styles.errorContainer,
          style,
        ]}
      >
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={isPassword ? !showPassword : secureTextEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Text style={styles.eyeText}>{showPassword ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    ...Typography.caption,
    color: Colors.plum,
    fontWeight: '600',
    marginBottom: 6,
  },
  container: {
    height: 52,
    backgroundColor: Colors.white,
    borderRadius: Radius.small,
    borderWidth: 1.5,
    borderColor: 'rgba(43, 22, 32, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  focusedContainer: {
    borderColor: Colors.magenta,
    backgroundColor: Colors.white,
  },
  errorContainer: {
    borderColor: Colors.passRed,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.plum,
    height: '100%',
  },
  eyeButton: {
    padding: 6,
  },
  eyeText: {
    fontSize: 16,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.passRed,
    marginTop: 4,
  },
});
