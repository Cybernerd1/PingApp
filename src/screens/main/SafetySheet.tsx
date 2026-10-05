import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../theme/colors';
import { Radius, Typography } from '../../theme/typography';
import { Chip, ListRow, PillButton, Sheet } from '../../ui';
import { safetyApi } from '../../api/safety';
import { matchesApi } from '../../api/matches';
import { ReportReason } from '../../api/types';

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'fake_profile', label: 'Fake profile' },
  { value: 'inappropriate_content', label: 'Inappropriate photos or content' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'spam', label: 'Spam or scam' },
  { value: 'underage', label: 'Looks under 18' },
  { value: 'hate_speech', label: 'Hate speech' },
  { value: 'other', label: 'Something else' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  userId: string;
  name: string;
  matchId?: string | null;
  onDone: (kind: 'blocked' | 'reported' | 'unmatched') => void;
}

/** S18 — unmatch / report / block. */
export const SafetySheet: React.FC<Props> = ({ visible, onClose, userId, name, matchId, onDone }) => {
  const qc = useQueryClient();
  const [mode, setMode] = useState<'menu' | 'report'>('menu');
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const first = name.split(' ')[0] || 'this person';

  const close = () => {
    setMode('menu');
    setReason(null);
    setDetails('');
    setError(null);
    onClose();
  };

  const invalidate = () => {
    ['matches', 'chats', 'discover', 'blockedUsers'].forEach(k => qc.invalidateQueries({ queryKey: [k] }));
  };

  const run = async (fn: () => Promise<{ status: string; message?: string }>, kind: 'blocked' | 'reported' | 'unmatched') => {
    setBusy(true);
    setError(null);
    const res = await fn();
    setBusy(false);
    if (res.status === 'error') return setError(res.message ?? 'Something went wrong');
    invalidate();
    close();
    onDone(kind);
  };

  const confirm = (title: string, msg: string, action: () => void) =>
    Alert.alert(title, msg, [
      { text: 'Cancel', style: 'cancel' },
      { text: title, style: 'destructive', onPress: action },
    ]);

  return (
    <Sheet visible={visible} onClose={close} title={mode === 'menu' ? first : `Report ${first}`}>
      {mode === 'menu' ? (
        <>
          {matchId ? (
            <ListRow
              title="Unmatch"
              subtitle="You’ll both lose this chat."
              onPress={() => confirm('Unmatch', `Unmatch ${first}?`, () => run(() => matchesApi.unmatch(matchId), 'unmatched'))}
            />
          ) : null}
          <ListRow title="Report" subtitle="We review every report. They won’t know it was you." onPress={() => setMode('report')} />
          <ListRow
            title="Block"
            subtitle="They won’t see you and any match or chat ends."
            danger
            last
            onPress={() => confirm('Block', `Block ${first}? You can unblock later in Settings.`, () => run(() => safetyApi.blockUser(userId), 'blocked'))}
          />
          {error ? <Text style={styles.err}>{error}</Text> : null}
        </>
      ) : (
        <>
          <Text style={styles.label}>What’s wrong?</Text>
          <View style={styles.chips}>
            {REASONS.map((r, i) => (
              <Chip key={r.value} label={r.label} tintIndex={i} selected={reason === r.value} onPress={() => setReason(r.value)} />
            ))}
          </View>
          <Text style={styles.label}>Anything else? (optional)</Text>
          <TextInput
            style={styles.input}
            value={details}
            onChangeText={t => setDetails(t.slice(0, 1000))}
            placeholder="Add details that help us review"
            placeholderTextColor={Colors.faint}
            multiline
          />
          {error ? <Text style={styles.err}>{error}</Text> : null}
          <PillButton
            title="Send report"
            disabled={!reason}
            loading={busy}
            onPress={() => reason && run(() => safetyApi.reportUser(userId, { reason, details: details.trim() || undefined }), 'reported')}
            style={styles.btn}
          />
          <PillButton
            title="Report and block"
            variant="ghost"
            disabled={!reason || busy}
            onPress={() =>
              reason &&
              run(async () => {
                const r = await safetyApi.reportUser(userId, { reason, details: details.trim() || undefined });
                if (r.status === 'error') return r;
                return safetyApi.blockUser(userId);
              }, 'blocked')
            }
          />
        </>
      )}
    </Sheet>
  );
};

const styles = StyleSheet.create({
  label: { ...Typography.label, color: Colors.ink, marginTop: 4, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  input: {
    minHeight: 90,
    borderRadius: Radius.card,
    backgroundColor: Colors.white,
    padding: 14,
    textAlignVertical: 'top',
    ...Typography.body,
    color: Colors.ink,
  },
  btn: { marginTop: 16 },
  err: { ...Typography.label, color: Colors.danger, marginTop: 10 },
});
