import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Radius, Typography } from '../theme/typography';

interface OTPInputProps {
  length?: number;
  value: string;
  onChangeOTP: (otp: string) => void;
  disabled?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChangeOTP,
  disabled = false,
}) => {
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [focusedIdx, setFocusedIdx] = useState<number>(0);

  const handleChangeText = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    const newOtp = value.split('');
    newOtp[index] = cleanText.slice(-1) || '';
    const updatedValue = newOtp.join('');
    onChangeOTP(updatedValue);

    if (cleanText && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, idx) => {
        const char = value[idx] || '';
        const isFocused = focusedIdx === idx;
        return (
          <TextInput
            key={idx}
            ref={ref => (inputRefs.current[idx] = ref)}
            style={[
              styles.box,
              isFocused && styles.focusedBox,
              !!char && styles.filledBox,
            ]}
            keyboardType="number-pad"
            maxLength={1}
            value={char}
            editable={!disabled}
            onChangeText={text => handleChangeText(text, idx)}
            onKeyPress={e => handleKeyPress(e, idx)}
            onFocus={() => setFocusedIdx(idx)}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 20,
    gap: 8,
  },
  box: {
    flex: 1,
    height: 54,
    borderRadius: Radius.small,
    borderWidth: 1.5,
    borderColor: 'rgba(43, 22, 32, 0.15)',
    backgroundColor: Colors.white,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: Colors.plum,
  },
  focusedBox: {
    borderColor: Colors.magenta,
    shadowColor: Colors.magenta,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  filledBox: {
    borderColor: Colors.coral,
    backgroundColor: Colors.cream,
  },
});
