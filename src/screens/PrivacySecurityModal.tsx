import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Typography, Radius } from '../theme/typography';
import { BackArrowIcon, ShieldIcon } from '../components/illustrations/Icons';
import apiClient from '../services/apiClient';

interface PrivacySecurityModalProps {
  visible: boolean;
  user: any;
  onClose: () => void;
  onDeleteAccount: () => void;
}

export const PrivacySecurityModal: React.FC<PrivacySecurityModalProps> = ({
  visible,
  user,
  onClose,
  onDeleteAccount,
}) => {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  const handleChangePassword = async () => {
    if (!newPw || newPw.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }
    if (newPw !== confirmPw) {
      setPwError('Passwords do not match.');
      return;
    }
    setPwError('');
    setSaving(true);
    try {
      await apiClient.post('/auth/set-password', { password: newPw });
      setPwSuccess('Password updated successfully! ✅');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setTimeout(() => setPwSuccess(''), 3000);
    } catch (err: any) {
      setPwError(err?.response?.data?.message || 'Failed to update password. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account? 🗑',
      'This action is permanent and cannot be undone. All your matches, messages, and data will be deleted forever.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete My Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'Type "DELETE" to confirm account deletion.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Permanently Delete',
                  style: 'destructive',
                  onPress: onDeleteAccount,
                },
              ],
            );
          },
        },
      ],
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <BackArrowIcon size={22} color={Colors.plum} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy & Security</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Account Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Account Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sign-in Method</Text>
              <View style={styles.googleBadge}>
                <Text style={styles.googleBadgeText}>🔒 Google SSO</Text>
              </View>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Account ID</Text>
              <Text style={[styles.infoValue, { fontSize: 11, fontFamily: 'monospace' }]}>
                {(user?.id || '—').slice(0, 16)}…
              </Text>
            </View>
          </View>

          {/* Change Password */}
          <View style={[styles.card, { marginTop: 20 }]}>
            <Text style={styles.cardTitle}>Change Password</Text>
            <Text style={styles.cardSub}>
              Your backup sign-in password (separate from Google SSO).
            </Text>

            <Text style={styles.fieldLabel}>New Password</Text>
            <View style={styles.pwRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={newPw}
                onChangeText={setNewPw}
                secureTextEntry={!showNew}
                placeholder="Min. 8 characters"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowNew((v) => !v)} style={styles.eyeBtn}>
                <Text style={styles.eyeIcon}>{showNew ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Confirm New Password</Text>
            <View style={styles.pwRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={confirmPw}
                onChangeText={setConfirmPw}
                secureTextEntry={!showNew}
                placeholder="Re-enter password"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
              />
            </View>

            {!!pwError && <Text style={styles.errorText}>{pwError}</Text>}
            {!!pwSuccess && <Text style={styles.successText}>{pwSuccess}</Text>}

            <TouchableOpacity
              style={[styles.changeBtn, saving && { opacity: 0.6 }]}
              onPress={handleChangePassword}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving
                ? <ActivityIndicator size="small" color={Colors.white} />
                : <Text style={styles.changeBtnText}>Update Password</Text>
              }
            </TouchableOpacity>
          </View>

          {/* Privacy Info */}
          <View style={[styles.card, { marginTop: 20 }]}>
            <Text style={styles.cardTitle}>Data & Privacy</Text>
            {[
              { emoji: '🔒', title: 'End-to-End Messages', desc: 'Your conversations are private between you and your matches.' },
              { emoji: '📍', title: 'Location Privacy', desc: 'We only show approximate distance, never your exact location.' },
              { emoji: '👁', title: 'Profile Visibility', desc: 'Your profile is only visible to users within your discovery radius.' },
            ].map((item) => (
              <View key={item.title} style={styles.privacyItem}>
                <Text style={styles.privacyEmoji}>{item.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.privacyTitle}>{item.title}</Text>
                  <Text style={styles.privacyDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Danger Zone */}
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleDeleteAccount}
            activeOpacity={0.85}
          >
            <Text style={styles.deleteBtnText}>🗑  Delete Account</Text>
          </TouchableOpacity>
          <Text style={styles.deleteNote}>
            Permanently deletes your account, matches, and all data. This cannot be undone.
          </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Typography.bodyStrong, color: Colors.plum, fontSize: 17 },
  scroll: { padding: 20, paddingBottom: 48 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: 18,
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: { ...Typography.bodyStrong, fontSize: 16, color: Colors.plum, marginBottom: 4 },
  cardSub: { ...Typography.caption, fontSize: 13, color: Colors.textMuted, marginBottom: 14, lineHeight: 19 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  infoLabel: { ...Typography.caption, fontSize: 14, color: Colors.textMuted },
  infoValue: { ...Typography.bodyStrong, fontSize: 14, color: Colors.plum },
  googleBadge: {
    backgroundColor: 'rgba(232,68,122,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  googleBadgeText: { ...Typography.caption, fontSize: 12, color: Colors.magenta, fontWeight: '700' },
  fieldLabel: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.plum,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
    marginTop: 4,
  },
  pwRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    backgroundColor: Colors.cream,
    borderRadius: Radius.small,
    borderWidth: 1.5,
    borderColor: 'rgba(43,22,32,0.1)',
    paddingHorizontal: 14,
    height: 48,
    ...Typography.body,
    color: Colors.plum,
  },
  eyeBtn: { padding: 4 },
  eyeIcon: { fontSize: 18 },
  errorText: { ...Typography.caption, color: Colors.danger, marginTop: 10, textAlign: 'center' },
  successText: { ...Typography.caption, color: '#2FA84F', marginTop: 10, textAlign: 'center', fontWeight: '700' },
  changeBtn: {
    marginTop: 16,
    height: 48,
    borderRadius: Radius.pill,
    backgroundColor: Colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeBtnText: { ...Typography.bodyStrong, fontSize: 15, color: Colors.white },
  privacyItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  privacyEmoji: { fontSize: 20, marginTop: 2 },
  privacyTitle: { ...Typography.bodyStrong, fontSize: 14, color: Colors.plum, marginBottom: 3 },
  privacyDesc: { ...Typography.caption, fontSize: 12, color: Colors.textMuted, lineHeight: 18 },
  deleteBtn: {
    marginTop: 28,
    height: 50,
    borderRadius: Radius.card,
    backgroundColor: 'rgba(242,134,95,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(242,134,95,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: { ...Typography.bodyStrong, fontSize: 15, color: Colors.danger },
  deleteNote: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 17,
    paddingHorizontal: 16,
  },
});
