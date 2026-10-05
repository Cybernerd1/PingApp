import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../theme/colors';
import { Radius, Typography } from '../../theme/typography';
import { Eye, EyeOff, FieldRow, PillButton, Sheet, Sparkle } from '../../ui';
import { DEMO_CREDENTIALS, SessionState, signInWithPassword } from '../../session/session';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSignedIn: (state: SessionState) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Email + password sign-in — used by the shared demo/test account. */
export const EmailSignInSheet: React.FC<Props> = ({ visible, onClose, onSignedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) setError(null);
  }, [visible]);

  const valid = EMAIL_RE.test(email.trim()) && password.length > 0;

  const submit = async (e = email, p = password) => {
    setError(null);
    setLoading(true);
    try {
      const state = await signInWithPassword(e, p);
      onClose();
      onSignedIn(state);
    } catch (err: any) {
      setError(err?.message ?? 'Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const useDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    submit(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
  };

  return (
    <Sheet
      visible={visible}
      onClose={loading ? () => {} : onClose}
      title="Sign in with email"
      footer={
        <>
          {error ? <Text style={styles.err}>{error}</Text> : null}
          <PillButton title="Sign in" onPress={() => submit()} loading={loading} disabled={!valid} />
        </>
      }
    >
      <Pressable
        onPress={useDemo}
        disabled={loading}
        style={({ pressed }) => [styles.demo, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Sign in with the demo account"
      >
        <View style={styles.demoIcon}>
          <Sparkle size={18} color={Colors.white} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.demoTitle}>Try the demo account</Text>
          <Text style={styles.demoSub}>
            {DEMO_CREDENTIALS.email} · {DEMO_CREDENTIALS.password}
          </Text>
        </View>
        <Text style={styles.demoGo}>Use</Text>
      </Pressable>

      <FieldRow
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        textContentType="emailAddress"
        returnKeyType="next"
      />
      <FieldRow
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry={!show}
        autoCapitalize="none"
        autoComplete="password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={() => valid && submit()}
        right={
          <Pressable onPress={() => setShow(s => !s)} hitSlop={10} accessibilityLabel={show ? 'Hide password' : 'Show password'}>
            {show ? <EyeOff color={Colors.mute} /> : <Eye color={Colors.mute} />}
          </Pressable>
        }
      />
      <Text style={styles.note}>Email sign-in is for test accounts. Everyone else can continue with Google.</Text>
    </Sheet>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  demo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: Radius.card,
    backgroundColor: Colors.primarySoft,
    marginBottom: 20,
  },
  pressed: { opacity: 0.75 },
  demoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoTitle: { ...Typography.bodyStrong, color: Colors.ink },
  demoSub: { ...Typography.caption, color: Colors.primaryDeep, marginTop: 2 },
  demoGo: { ...Typography.label, color: Colors.primaryDeep },
  note: { ...Typography.caption, color: Colors.mute, marginTop: -4 },
  err: { ...Typography.label, color: Colors.danger, marginBottom: 8 },
});
