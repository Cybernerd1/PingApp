import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { GradientBackground, GoogleG, Mail, PillButton } from '../../ui';
import { PeopleBubbles } from '../../ui/illustrations/PeopleBubbles';
import { SessionState, SignInCancelled, signInWithGoogle } from '../../session/session';
import { LegalKind, LegalSheet } from '../main/profile/LegalSheet';
import { EmailSignInSheet } from './EmailSignInSheet';

interface WelcomeScreenProps {
  onSignedIn: (state: SessionState) => void;
}

const { width: W } = Dimensions.get('window');

/**
 * S2 — "Love is One Swipe Away".
 * Google sign-in for everyone; email + password for the demo/test account.
 */
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSignedIn }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [legal, setLegal] = useState<LegalKind | null>(null);

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const state = await signInWithGoogle();
      onSignedIn(state);
    } catch (e: any) {
      if (!(e instanceof SignInCancelled)) setError(e?.message ?? 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.art}>
          <PeopleBubbles width={Math.min(W * 0.82, 340)} />
        </View>

        <View style={styles.bottom}>
          <Text style={styles.title} accessibilityRole="header">
            Love is One{'\n'}Swipe Away
          </Text>
          <Text style={styles.sub}>
            Meet real people nearby. Sign in to create your profile and start swiping.
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PillButton
            title="Continue with Google"
            onPress={handleGoogle}
            loading={loading}
            icon={<GoogleG size={18} />}
            style={styles.cta}
          />
          <PillButton
            title="Sign in with email"
            variant="primary"
            onPress={() => setEmailOpen(true)}
            icon={<Mail size={18} color={Colors.white} />}
            style={styles.cta}
          />

          <Text style={styles.terms}>
            By continuing you agree to Ping’s{' '}
            <Text style={styles.link} onPress={() => setLegal('terms')} accessibilityRole="link">
              Terms & Conditions
            </Text>{' '}
            and{' '}
            <Text style={styles.link} onPress={() => setLegal('privacy')} accessibilityRole="link">
              Privacy Policy
            </Text>
            .
          </Text>
        </View>
      </SafeAreaView>
      <EmailSignInSheet visible={emailOpen} onClose={() => setEmailOpen(false)} onSignedIn={onSignedIn} />
      <LegalSheet kind={legal} onClose={() => setLegal(null)} />
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  art: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingTop: 12, overflow: 'hidden' },
  bottom: { paddingHorizontal: 24, paddingBottom: 16, paddingTop: 8 },
  title: { ...Typography.display, fontSize: 38, lineHeight: 44, color: Colors.ink },
  sub: { ...Typography.body, color: Colors.mute, marginTop: 10, marginBottom: 20, maxWidth: 320 },
  cta: { marginBottom: 12 },
  error: { ...Typography.label, color: Colors.danger, marginBottom: 12 },
  terms: { ...Typography.caption, color: Colors.mute, textAlign: 'center', marginTop: 4, lineHeight: 18 },
  link: { color: Colors.primaryDeep, fontWeight: '700', textDecorationLine: 'underline' },
});
