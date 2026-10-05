import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Button } from '../components/Button';
import { OTPInput } from '../components/OTPInput';
import { useAuth } from '../hooks/useAuth';

interface OTPVerifyScreenProps {
  username: string;
  isLogin: boolean;
  onSuccess: (profileExists: boolean) => void;
  onBack: () => void;
}

export const OTPVerifyScreen: React.FC<OTPVerifyScreenProps> = ({
  username,
  isLogin,
  onSuccess,
  onBack,
}) => {
  const [otp, setOtp] = useState('');
  const { verifyOtp, isVerifyingOtp, verifyOtpError, loginVerifyOtp, isVerifyingLoginOtp, loginVerifyOtpError } = useAuth();

  const handleVerify = async () => {
    if (otp.length < 6) return;
    const payload = {
      username,
      otp,
      challenge_name: 'EMAIL_OTP' as const,
    };

    if (isLogin) {
      const res = await loginVerifyOtp(payload);
      if (res.status === 'success') {
        onSuccess(true);
      }
    } else {
      const res = await verifyOtp(payload);
      if (res.status === 'success') {
        onSuccess(res.data?.profile_exists || false);
      }
    }
  };

  const error = isLogin ? loginVerifyOtpError : verifyOtpError;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.subtitle}>We sent a code to <Text style={styles.highlight}>{username}</Text></Text>

        <OTPInput length={6} value={otp} onChangeOTP={setOtp} />

        {error ? <Text style={styles.errorText}>{error.message}</Text> : null}

        <Button
          title="Verify & Continue"
          onPress={handleVerify}
          loading={isVerifyingOtp || isVerifyingLoginOtp}
          disabled={otp.length < 6}
          style={styles.verifyBtn}
        />

        <Button title="Back" variant="secondary" onPress={onBack} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream, padding: 24, justifyContent: 'center' },
  content: { alignItems: 'center', width: '100%' },
  title: { ...Typography.heading, color: Colors.magenta, marginBottom: 8, textAlign: 'center' },
  subtitle: { ...Typography.body, color: Colors.plum, textAlign: 'center', marginBottom: 24 },
  highlight: { fontWeight: '700', color: Colors.magenta },
  errorText: { ...Typography.caption, color: Colors.danger, marginBottom: 16 },
  verifyBtn: { width: '100%', marginBottom: 12 },
});
