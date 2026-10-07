import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Avatar, GradientBackground, Heart, PillButton } from '../../ui';
import { mainPhoto, useSession } from '../../session/SessionContext';
import { MatchEvent } from './DeckContext';

/** S9 — "It's a match!" after a mutual like. */
export const MatchOverlay: React.FC<{
  match: MatchEvent | null;
  onMessage: (m: MatchEvent) => void;
  onClose: () => void;
}> = ({ match, onMessage, onClose }) => {
  const { me } = useSession();
  if (!match) return null;
  const other = match.candidate;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <SafeAreaProvider>
      <GradientBackground>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <View style={styles.pair}>
            <Avatar uri={mainPhoto(me)} name={me.full_name} size={128} ring style={styles.left} />
            <Avatar uri={other.photos[0]?.photo_url} name={other.full_name} size={128} ring style={styles.right} />
            <View style={styles.heart}>
              <Heart size={26} />
            </View>
          </View>
          <Text style={styles.title} accessibilityRole="header">
            It’s a match!
          </Text>
          <Text style={styles.sub}>You and {other.full_name.split(' ')[0]} liked each other. Say hi first?</Text>
          <PillButton
            title="Send a message"
            variant="primary"
            onPress={() => onMessage(match)}
            disabled={!match.chatId}
            style={styles.btn}
          />
          <PillButton title="Keep swiping" variant="glass" onPress={onClose} style={styles.btn} />
        </View>
        </SafeAreaView>
      </GradientBackground>
      </SafeAreaProvider>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  pair: { flexDirection: 'row', marginBottom: 28 },
  left: { transform: [{ rotate: '-8deg' }], marginRight: -18 },
  right: { transform: [{ rotate: '8deg' }], marginLeft: -18 },
  heart: {
    position: 'absolute',
    alignSelf: 'center',
    left: '50%',
    marginLeft: -26,
    bottom: -18,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.white,
  },
  title: { ...Typography.display, color: Colors.ink, textAlign: 'center' },
  sub: { ...Typography.body, color: Colors.mute, textAlign: 'center', marginTop: 8, marginBottom: 28 },
  btn: { alignSelf: 'stretch', marginBottom: 12 },
});
