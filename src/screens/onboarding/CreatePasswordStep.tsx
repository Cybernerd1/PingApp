import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { authApi } from '../../api/auth';
import { tokenStore } from '../../session/tokenStore';
import { PasswordInput } from '../../ui';
import { passwordError, passwordMatchError } from '../../validation/password';
import { StepLayout } from './StepLayout';

interface Props {
  step: number;
  total: number;
  onBack: () => void;
  onDone: () => void;
}

const isRetryable = (code?: string) => code === 'NETWORK_ERROR' || code === 'INTERNAL_ERROR';

/** Final, required onboarding step for passwordless/Google accounts. */
export const CreatePasswordStep: React.FC<Props> = ({ step, total, onBack, onDone }) => {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const validation = passwordError(password) ?? passwordMatchError(password, confirmation);
    if (validation) {
      setError(validation);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      let response = await authApi.setPassword({ password });
      if (response.status === 'error' && isRetryable(response.code)) {
        response = await authApi.setPassword({ password });
      }
      if (response.status === 'error') {
        setError(response.message);
        return;
      }
      await tokenStore.set(response.data.access_token, response.data.refresh_token);
      onDone();
    } finally {
      setPassword('');
      setConfirmation('');
      setSaving(false);
    }
  };

  return (
    <StepLayout
      step={step}
      total={total}
      title="Create a password"
      subtitle="Add a password so you can sign in with your email anytime. This step is required to finish setup."
      onBack={onBack}
      onNext={submit}
      nextLabel="Finish"
      loading={saving}
      error={error}
    >
      <PasswordInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Create a password"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        hint="At least 8 characters with an uppercase letter, lowercase letter, and number."
      />
      <PasswordInput
        label="Confirm Password"
        value={confirmation}
        onChangeText={setConfirmation}
        placeholder="Enter it again"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={submit}
        error={confirmation.length > 0 ? passwordMatchError(password, confirmation) ?? undefined : undefined}
      />
      <Text style={styles.note}>Your password is stored securely and is never shown on your profile.</Text>
    </StepLayout>
  );
};

const styles = StyleSheet.create({
  note: { color: '#706A78', fontSize: 13, lineHeight: 19, marginHorizontal: 4 },
});
