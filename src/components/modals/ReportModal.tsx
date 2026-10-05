import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { Typography, Radius } from '../../theme/typography';
import { Button } from '../Button';
import { CloseIcon } from '../illustrations/Icons';

interface ReportModalProps {
  visible: boolean;
  targetName: string;
  targetUserId: string;
  onClose: () => void;
  onSubmitReport: (reason: string, details?: string) => Promise<void>;
}

const REPORT_REASONS = [
  { id: 'inappropriate_photos', label: 'Inappropriate Photos', emoji: '🔞' },
  { id: 'spam', label: 'Spam or Commercial Scam', emoji: '⚠️' },
  { id: 'harassment', label: 'Harassment or Offensive Behavior', emoji: '🚫' },
  { id: 'fake_profile', label: 'Fake Profile / Impersonation', emoji: '🕵️' },
  { id: 'other', label: 'Other Reason', emoji: '💬' },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  targetName,
  targetUserId,
  onClose,
  onSubmitReport,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('inappropriate_photos');
  const [details, setDetails] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmitReport(selectedReason, details.trim() || undefined);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setDetails('');
        onClose();
      }, 1500);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Report {targetName}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <CloseIcon size={20} color={Colors.plum} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {submitted ? (
            <View style={styles.submittedContainer}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successTitle}>Report Submitted</Text>
              <Text style={styles.successSubtitle}>
                Thank you for making Ping a safe place. Our safety team will review this report within 24 hours.
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.subtitle}>
                Why are you reporting this user? We will keep your report anonymous.
              </Text>

              {REPORT_REASONS.map((r) => {
                const isSelected = selectedReason === r.id;
                return (
                  <TouchableOpacity
                    key={r.id}
                    activeOpacity={0.8}
                    onPress={() => setSelectedReason(r.id)}
                    style={[styles.reasonRow, isSelected && styles.reasonRowSelected]}
                  >
                    <Text style={styles.emoji}>{r.emoji}</Text>
                    <Text style={[styles.reasonLabel, isSelected && styles.reasonLabelSelected]}>
                      {r.label}
                    </Text>
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}

              <Text style={styles.sectionLabel}>Additional Details (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Provide any additional context for our moderation team..."
                placeholderTextColor={Colors.textMuted}
                value={details}
                onChangeText={setDetails}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />

              <Button
                title={loading ? 'Submitting Report...' : 'Submit Report'}
                onPress={handleSubmit}
                loading={loading}
                style={styles.submitBtn}
              />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cream },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    backgroundColor: Colors.white,
  },
  title: { ...Typography.heading, fontSize: 18, color: Colors.plum },
  closeBtn: { padding: 4 },
  content: { padding: 20 },
  subtitle: { ...Typography.body, color: Colors.textMuted, fontSize: 14, marginBottom: 20 },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: Radius.card,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.06)',
    marginBottom: 10,
    gap: 12,
  },
  reasonRowSelected: {
    borderColor: Colors.magenta,
    backgroundColor: 'rgba(232, 68, 122, 0.04)',
  },
  emoji: { fontSize: 20 },
  reasonLabel: { ...Typography.bodyStrong, flex: 1, fontSize: 15, color: Colors.plum },
  reasonLabelSelected: { color: Colors.magenta },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: Colors.magenta },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.magenta },
  sectionLabel: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.plum,
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: 14,
    height: 100,
    ...Typography.body,
    color: Colors.plum,
    marginBottom: 20,
  },
  submitBtn: { marginTop: 10 },
  submittedContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2FA84F',
    color: Colors.white,
    fontSize: 36,
    textAlign: 'center',
    lineHeight: 64,
    marginBottom: 16,
    overflow: 'hidden',
  },
  successTitle: { ...Typography.heading, fontSize: 22, color: Colors.plum, marginBottom: 8 },
  successSubtitle: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
