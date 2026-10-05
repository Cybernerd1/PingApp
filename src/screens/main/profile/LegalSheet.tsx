import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Sheet } from '../../../ui';

const UPDATED = 'Last updated: 5 October 2026';

const TERMS: { h: string; p: string }[] = [
  { h: '1. Acceptance', p: 'By creating an account or using Ping you agree to these Terms. If you do not agree, please do not use the app.' },
  { h: '2. Eligibility', p: 'You must be at least 18 years old and legally able to enter into a contract. You may hold only one account and must provide accurate information.' },
  { h: '3. Your account', p: 'You are responsible for activity on your account. Sign in only with your own Google account or the credentials issued to you, keep them private, and tell us promptly if you suspect unauthorised access. Shared demo accounts are for testing only and may be reset at any time.' },
  { h: '4. Acceptable use', p: 'Do not harass, threaten, impersonate or deceive others; post nudity, hate speech, violence or illegal content; send spam or solicit money; scrape data; or use Ping for anything other than meeting people in good faith.' },
  { h: '5. Your content', p: 'You keep ownership of the photos and text you upload, and grant Ping a limited licence to host and display them to other users to operate the service. You confirm you have the right to share them.' },
  { h: '6. Safety', p: 'Ping is not able to verify every user. Be careful when meeting people, never share financial details, and use the report and block tools if someone makes you uncomfortable.' },
  { h: '7. Moderation & termination', p: 'We may remove content or suspend accounts that break these Terms or put others at risk. You can stop using Ping at any time.' },
  { h: '8. Disclaimers', p: 'Ping is provided “as is” without warranties. To the extent permitted by law, we are not liable for interactions between users or for indirect damages arising from use of the app.' },
  { h: '9. Changes', p: 'We may update these Terms from time to time. Continued use after changes means you accept the updated Terms.' },
  { h: '10. Contact', p: 'Questions? Email support@pingapp.example.' },
];

const PRIVACY: { h: string; p: string }[] = [
  { h: '1. Information we collect', p: 'Account details from Google sign-in (name, email, profile photo) or the email you sign in with; profile details you add (birthday, gender, bio, interests, photos); your approximate location when you allow it; messages you send, including messages to Ping Assistant; and device data such as a push-notification token.' },
  { h: '2. How we use it', p: 'To create your profile, show you and others to each other in Discover, calculate distance, deliver messages and notifications, keep the community safe, and improve Ping.' },
  { h: '3. Location', p: 'Location is used only to find people near you and is shown to others as an approximate distance. You can turn distance display off in Privacy settings or revoke permission in your phone settings.' },
  { h: '4. Camera, microphone & media', p: 'These permissions are used only when you take or choose photos, record voice messages or share media. We do not access them in the background.' },
  { h: '5. Sharing', p: 'Your profile is visible to other users according to your privacy settings. We use service providers (hosting, image storage, push delivery, and an AI provider that generates Ping Assistant replies) who process data on our behalf. We do not sell your personal data.' },
  { h: '6. Notifications', p: 'We send push notifications for new matches and messages. You can disable them in your phone’s system settings at any time.' },
  { h: '7. Retention & your choices', p: 'We keep your data while your account is active. You can edit your profile, block users and request removal of your data by contacting us.' },
  { h: '8. Security', p: 'We use encryption in transit and access controls to protect your data, but no system is completely secure.' },
  { h: '9. Children', p: 'Ping is not for anyone under 18, and we do not knowingly collect data from minors.' },
  { h: '10. Contact', p: 'Privacy questions? Email privacy@pingapp.example.' },
];

export type LegalKind = 'terms' | 'privacy';

/** Terms & Conditions / Privacy Policy page (bottom sheet). */
export const LegalSheet: React.FC<{ kind: LegalKind | null; onClose: () => void }> = ({ kind, onClose }) => {
  const sections = kind === 'privacy' ? PRIVACY : TERMS;
  return (
    <Sheet visible={kind !== null} onClose={onClose} title={kind === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'} tall>
      <Text style={styles.updated}>{UPDATED}</Text>
      {sections.map(s => (
        <View key={s.h} style={styles.block}>
          <Text style={styles.h}>{s.h}</Text>
          <Text style={styles.p}>{s.p}</Text>
        </View>
      ))}
    </Sheet>
  );
};

const styles = StyleSheet.create({
  updated: { ...Typography.caption, color: Colors.mute, marginBottom: 12 },
  block: { marginBottom: 16 },
  h: { ...Typography.bodyStrong, color: Colors.ink, marginBottom: 4 },
  p: { ...Typography.body, color: Colors.mute },
});
