import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  ActionSheetIOS,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  launchCamera,
  launchImageLibrary,
  Asset,
  ImagePickerResponse,
} from 'react-native-image-picker';
import { Colors } from '../theme/colors';
import { Typography, Radius } from '../theme/typography';
import { BackArrowIcon, CameraIcon, CloseIcon, UserIcon } from '../components/illustrations/Icons';
import apiClient from '../services/apiClient';
import { requestCameraPermission } from '../services/permissionsService';
import Svg, { Path } from 'react-native-svg';

const { width: SW } = Dimensions.get('window');
const SLOT_SIZE = (SW - 48 - 24) / 4; // 4 slots per row

interface EditProfileModalProps {
  visible: boolean;
  user: any;
  onClose: () => void;
  onSaved: (updatedUser: any) => void;
}

type GenderOption = 'man' | 'woman' | 'non-binary' | 'other' | 'prefer_not_to_say';
const GENDER_OPTIONS: { value: GenderOption; label: string; emoji: string }[] = [
  { value: 'man', label: 'Man', emoji: '👨' },
  { value: 'woman', label: 'Woman', emoji: '👩' },
  { value: 'non-binary', label: 'Non-binary', emoji: '🧑' },
  { value: 'other', label: 'Other', emoji: '✨' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say', emoji: '🤐' },
];

const AddIcon = ({ size = 20, color = Colors.magenta }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);

const pickFromSource = (source: 'camera' | 'library'): Promise<Asset | null> =>
  new Promise((resolve) => {
    const opts = { mediaType: 'photo' as const, quality: 0.85 as const, maxWidth: 1200, maxHeight: 1200 };
    const handler = (res: ImagePickerResponse) =>
      resolve(res.didCancel || res.errorCode || !res.assets?.[0] ? null : res.assets[0]);
    source === 'camera' ? launchCamera(opts, handler) : launchImageLibrary(opts, handler);
  });

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  user,
  onClose,
  onSaved,
}) => {
  // ── State ─────────────────────────────────────────────────────────────────
  const [name, setName] = useState<string>(user?.name || '');
  const [about, setAbout] = useState<string>(user?.about || '');
  const [gender, setGender] = useState<GenderOption | null>(user?.gender || null);
  const [saving, setSaving] = useState(false);
  const [savingPhotos, setSavingPhotos] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Photos: existing from backend + any new picks
  const existingPhotos: { url: string; publicId: string }[] = user?.photos || [];
  const [localPhotos, setLocalPhotos] = useState<
    ({ uri: string; fileName: string; type: string; isNew: true } |
     { url: string; publicId: string; isNew: false })[]
  >(existingPhotos.map((p) => ({ ...p, isNew: false as const })));

  // ── Photo source picker ───────────────────────────────────────────────────
  const showSourcePicker = useCallback((onPick: (asset: Asset) => void) => {
    const pickFrom = async (src: 'camera' | 'library') => {
      if (src === 'camera') {
        const ok = await requestCameraPermission();
        if (!ok) {
          Alert.alert('Camera Denied', 'Please allow camera access in Settings.');
          return;
        }
      }
      const asset = await pickFromSource(src);
      if (asset) onPick(asset);
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', '📷 Take Photo', '🖼 Choose from Library'], cancelButtonIndex: 0 },
        (i) => { if (i === 1) pickFrom('camera'); if (i === 2) pickFrom('library'); },
      );
    } else {
      Alert.alert('Add Photo', 'Choose a source', [
        { text: '📷 Take Photo', onPress: () => pickFrom('camera') },
        { text: '🖼 Library', onPress: () => pickFrom('library') },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }, []);

  const handleAddPhoto = () => {
    if (localPhotos.length >= 4) {
      Alert.alert('Max Photos', 'You can have at most 4 photos.');
      return;
    }
    showSourcePicker((asset) => {
      setLocalPhotos((prev) => [
        ...prev,
        { uri: asset.uri!, fileName: asset.fileName!, type: asset.type!, isNew: true },
      ]);
    });
  };

  const handleRemovePhoto = (idx: number) => {
    setLocalPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Save profile fields ───────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!name.trim() || name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const res = await apiClient.patch('/profile', { name, about, gender });
      setSuccess('Profile saved!');
      setTimeout(() => setSuccess(''), 2500);
      onSaved(res.data?.data?.user ?? user);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Save photos ───────────────────────────────────────────────────────────
  const handleSavePhotos = async () => {
    const newOnes = localPhotos.filter((p) => p.isNew);
    if (newOnes.length === 0 && localPhotos.length === existingPhotos.length) {
      setError('No changes to save.');
      return;
    }
    setSavingPhotos(true);
    setError('');
    try {
      const form = new FormData();
      for (const p of localPhotos) {
        if (p.isNew) {
          form.append('photos', {
            uri: (p as any).uri,
            name: (p as any).fileName || 'photo.jpg',
            type: (p as any).type || 'image/jpeg',
          } as any);
        }
      }
      // If all are existing we just keep them (no API call needed unless we're replacing)
      if (newOnes.length > 0) {
        const res = await apiClient.post('/profile/photos', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Photos updated!');
        setTimeout(() => setSuccess(''), 2500);
        const updatedUser = { ...user, photos: res.data?.data?.photos };
        onSaved(updatedUser);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Photo upload failed. Try again.');
    } finally {
      setSavingPhotos(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <BackArrowIcon size={22} color={Colors.plum} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* ── Photos Section ── */}
          <Text style={styles.sectionLabel}>Photos</Text>
          <View style={styles.photoGrid}>
            {localPhotos.map((slot, idx) => (
              <View key={idx} style={styles.photoSlot}>
                <Image
                  source={{ uri: slot.isNew ? (slot as any).uri : (slot as any).url }}
                  style={styles.photoImg}
                />
                <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemovePhoto(idx)}>
                  <CloseIcon size={10} color={Colors.white} />
                </TouchableOpacity>
                {idx === 0 && (
                  <View style={styles.profileBadge}>
                    <Text style={styles.profileBadgeText}>Profile</Text>
                  </View>
                )}
              </View>
            ))}
            {localPhotos.length < 4 && (
              <TouchableOpacity style={styles.addSlot} onPress={handleAddPhoto}>
                <AddIcon size={24} color={Colors.magenta} />
                <Text style={styles.addSlotText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.savePhotoBtn, savingPhotos && { opacity: 0.6 }]}
            onPress={handleSavePhotos}
            disabled={savingPhotos}
          >
            {savingPhotos
              ? <ActivityIndicator size="small" color={Colors.magenta} />
              : <Text style={styles.savePhotoBtnText}>Update Photos</Text>
            }
          </TouchableOpacity>

          {/* ── Profile Fields ── */}
          <Text style={[styles.sectionLabel, { marginTop: 28 }]}>About You</Text>

          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="words"
          />

          <Text style={styles.fieldLabel}>Username</Text>
          <View style={styles.usernameDisplay}>
            <Text style={styles.usernameAt}>@</Text>
            <Text style={styles.usernameValue}>{user?.username || '—'}</Text>
            <Text style={styles.usernameNote}>Cannot be changed</Text>
          </View>

          <Text style={styles.fieldLabel}>About Me</Text>
          <TextInput
            style={[styles.input, styles.aboutInput]}
            value={about}
            onChangeText={setAbout}
            placeholder="A short bio..."
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={300}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{about.length}/300</Text>

          <Text style={styles.fieldLabel}>Gender</Text>
          <View style={styles.genderGrid}>
            {GENDER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.genderChip, gender === opt.value && styles.genderChipActive]}
                onPress={() => setGender(opt.value)}
                activeOpacity={0.8}
              >
                <Text style={styles.genderEmoji}>{opt.emoji}</Text>
                <Text style={[styles.genderLabel, gender === opt.value && styles.genderLabelActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}
          {!!success && <Text style={styles.successText}>{success}</Text>}

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSaveProfile}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving
              ? <ActivityIndicator size="small" color={Colors.white} />
              : <Text style={styles.saveBtnText}>Save Changes</Text>
            }
          </TouchableOpacity>
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
  sectionLabel: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.plum,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  // Photos
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoSlot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE * 1.3,
    borderRadius: Radius.card,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImg: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(43,22,32,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(232,68,122,0.85)',
    paddingVertical: 3,
    alignItems: 'center',
  },
  profileBadgeText: { ...Typography.caption, fontSize: 10, color: Colors.white, fontWeight: '700' },
  addSlot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE * 1.3,
    borderRadius: Radius.card,
    backgroundColor: Colors.blush,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(232,68,122,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addSlotText: { ...Typography.caption, fontSize: 11, color: Colors.magenta, fontWeight: '700' },
  savePhotoBtn: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.small,
    borderWidth: 1.5,
    borderColor: Colors.magenta,
  },
  savePhotoBtnText: { ...Typography.caption, fontSize: 14, color: Colors.magenta, fontWeight: '700' },
  // Fields
  fieldLabel: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.plum,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: Radius.small,
    borderWidth: 1.5,
    borderColor: 'rgba(43,22,32,0.12)',
    paddingHorizontal: 14,
    height: 48,
    ...Typography.body,
    color: Colors.plum,
  },
  aboutInput: { height: 96, paddingTop: 12, paddingBottom: 12 },
  charCount: { ...Typography.caption, fontSize: 11, color: Colors.textMuted, textAlign: 'right', marginTop: 4 },
  usernameDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(43,22,32,0.04)',
    borderRadius: Radius.small,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  usernameAt: { ...Typography.bodyStrong, fontSize: 16, color: Colors.magenta },
  usernameValue: { ...Typography.bodyStrong, fontSize: 15, color: Colors.plum },
  usernameNote: { ...Typography.caption, fontSize: 11, color: Colors.textMuted, marginLeft: 'auto' },
  genderGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  genderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: 'rgba(43,22,32,0.12)',
  },
  genderChipActive: { borderColor: Colors.magenta, backgroundColor: 'rgba(232,68,122,0.08)' },
  genderEmoji: { fontSize: 15 },
  genderLabel: { ...Typography.caption, fontSize: 13, color: Colors.plum, fontWeight: '600' },
  genderLabelActive: { color: Colors.magenta },
  errorText: { ...Typography.caption, color: Colors.danger, textAlign: 'center', marginTop: 12 },
  successText: { ...Typography.caption, color: '#2FA84F', textAlign: 'center', marginTop: 12, fontWeight: '700' },
  saveBtn: {
    marginTop: 24,
    height: 52,
    borderRadius: Radius.pill,
    backgroundColor: Colors.magenta,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.magenta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  saveBtnText: { ...Typography.bodyStrong, fontSize: 16, color: Colors.white },
});
