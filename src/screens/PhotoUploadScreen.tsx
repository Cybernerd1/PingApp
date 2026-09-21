import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  ActionSheetIOS,
  Dimensions,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  Asset,
} from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Typography, Radius, Spacing } from '../theme/typography';
import { Button } from '../components/Button';
import { CameraIcon, CloseIcon, UserIcon } from '../components/illustrations/Icons';
import apiClient from '../services/apiClient';
import { requestCameraPermission } from '../services/permissionsService';
import Svg, { Path, Circle } from 'react-native-svg';

const { width: SW } = Dimensions.get('window');
const PROFILE_SIZE = SW * 0.42;
const EXTRA_SIZE = (SW - 48 - 16) / 3; // 3 per row with gaps

// ─── Types ────────────────────────────────────────────────────────────────────
interface PhotoSlot {
  uri: string | null;
  fileName: string | null;
  type: string | null;
}

interface PhotoUploadScreenProps {
  user: any;
  onComplete: (updatedUser: any) => void;
}

// ─── Add Icon ─────────────────────────────────────────────────────────────────
const AddIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = Colors.magenta }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);

// ─── ImagePicker helper ───────────────────────────────────────────────────────
const pickFromSource = (
  source: 'camera' | 'library',
): Promise<Asset | null> => {
  return new Promise((resolve) => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.85 as const,
      maxWidth: 1200,
      maxHeight: 1200,
    };

    const handler = (res: ImagePickerResponse) => {
      if (res.didCancel || res.errorCode || !res.assets?.[0]) {
        resolve(null);
      } else {
        resolve(res.assets[0]);
      }
    };

    if (source === 'camera') {
      launchCamera(options, handler);
    } else {
      launchImageLibrary(options, handler);
    }
  });
};

// ─── Component ────────────────────────────────────────────────────────────────
export const PhotoUploadScreen: React.FC<PhotoUploadScreenProps> = ({ user, onComplete }) => {
  const [profilePhoto, setProfilePhoto] = useState<PhotoSlot>({ uri: null, fileName: null, type: null });
  const [extraPhotos, setExtraPhotos] = useState<PhotoSlot[]>([
    { uri: null, fileName: null, type: null },
    { uri: null, fileName: null, type: null },
    { uri: null, fileName: null, type: null },
  ]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // ── Source picker ─────────────────────────────────────────────────────────
  const showSourcePicker = useCallback(
    (onPick: (asset: Asset) => void) => {
      const pickFrom = async (source: 'camera' | 'library') => {
        if (source === 'camera') {
          const granted = await requestCameraPermission();
          if (!granted) {
            Alert.alert(
              'Camera Access Denied',
              'Please allow camera access in Settings to take photos.',
            );
            return;
          }
        }
        const asset = await pickFromSource(source);
        if (asset) onPick(asset);
      };

      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          { options: ['Cancel', '📷 Take Photo', '🖼 Choose from Library'], cancelButtonIndex: 0 },
          (idx) => {
            if (idx === 1) pickFrom('camera');
            if (idx === 2) pickFrom('library');
          },
        );
      } else {
        Alert.alert('Add Photo', 'Choose a source', [
          { text: '📷 Take Photo', onPress: () => pickFrom('camera') },
          { text: '🖼 Choose from Library', onPress: () => pickFrom('library') },
          { text: 'Cancel', style: 'cancel' },
        ]);
      }
    },
    [],
  );

  // ── Slot handlers ─────────────────────────────────────────────────────────
  const handleProfileSlot = () => {
    showSourcePicker((asset) =>
      setProfilePhoto({ uri: asset.uri!, fileName: asset.fileName!, type: asset.type! }),
    );
  };

  const handleExtraSlot = (idx: number) => {
    showSourcePicker((asset) =>
      setExtraPhotos((prev) => {
        const next = [...prev];
        next[idx] = { uri: asset.uri!, fileName: asset.fileName!, type: asset.type! };
        return next;
      }),
    );
  };

  const removeExtra = (idx: number) => {
    setExtraPhotos((prev) => {
      const next = [...prev];
      next[idx] = { uri: null, fileName: null, type: null };
      return next;
    });
  };

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!profilePhoto.uri) {
      setError('Please add at least a profile photo.');
      return;
    }
    setError('');
    setUploading(true);

    try {
      const form = new FormData();

      // Profile photo first
      form.append('photos', {
        uri: profilePhoto.uri,
        name: profilePhoto.fileName || 'profile.jpg',
        type: profilePhoto.type || 'image/jpeg',
      } as any);

      // Up to 3 extra photos
      for (const slot of extraPhotos) {
        if (slot.uri) {
          form.append('photos', {
            uri: slot.uri,
            name: slot.fileName || 'photo.jpg',
            type: slot.type || 'image/jpeg',
          } as any);
        }
      }

      const res = await apiClient.post('/onboarding/photos', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onComplete(res.data?.data?.user ?? user);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || 'Upload failed. Please try again.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Photos?',
      'You can always add photos later from your profile. Your account is already set up!',
      [
        { text: 'Add Photos', style: 'cancel' },
        { text: 'Skip for Now', onPress: () => onComplete(user) },
      ],
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text style={styles.title}>Add Your Photos 📸</Text>
        <Text style={styles.subtitle}>
          Show your best self! A profile photo is required — add up to 3 more to stand out.
        </Text>

        {/* ── Profile Photo Slot ── */}
        <Text style={styles.sectionLabel}>Profile Photo</Text>
        <View style={styles.profileSlotRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleProfileSlot}
            style={[styles.profileSlot, profilePhoto.uri && styles.profileSlotFilled]}
          >
            {profilePhoto.uri ? (
              <>
                <Image source={{ uri: profilePhoto.uri }} style={styles.profileImage} />
                <View style={styles.editBadge}>
                  <CameraIcon size={14} color={Colors.plum} />
                </View>
              </>
            ) : (
              <View style={styles.profilePlaceholder}>
                <UserIcon size={48} color="rgba(232,68,122,0.3)" />
                <View style={styles.addBadge}>
                  <AddIcon size={16} color={Colors.white} />
                </View>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.profileHint}>
            <Text style={styles.hintTitle}>Required ✨</Text>
            <Text style={styles.hintBody}>
              This is the first photo people see. Choose a clear, well-lit photo where your face is visible.
            </Text>
          </View>
        </View>

        {/* ── Extra Photos Grid ── */}
        <Text style={[styles.sectionLabel, { marginTop: 28 }]}>Additional Photos</Text>
        <Text style={styles.extraHint}>Optional — add up to 3 more photos to tell your story.</Text>
        <View style={styles.extraGrid}>
          {extraPhotos.map((slot, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.85}
              onPress={() => handleExtraSlot(idx)}
              style={[styles.extraSlot, slot.uri && styles.extraSlotFilled]}
            >
              {slot.uri ? (
                <>
                  <Image source={{ uri: slot.uri }} style={styles.extraImage} />
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeExtra(idx)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <CloseIcon size={12} color={Colors.white} />
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.extraPlaceholder}>
                  <AddIcon size={22} color="rgba(232,68,122,0.4)" />
                  <Text style={styles.extraPlaceholderNum}>{idx + 1}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Photo Tips</Text>
          {[
            'Clear face photo as your first image',
            'Natural lighting looks best',
            'Show your hobbies or travels',
            'Smile — it makes a difference!',
          ].map((tip) => (
            <Text key={tip} style={styles.tipItem}>
              • {tip}
            </Text>
          ))}
        </View>

        {/* Error */}
        {!!error && <Text style={styles.errorText}>{error}</Text>}

        {/* Actions */}
        <Button
          title={uploading ? 'Uploading…' : 'Upload & Finish Setup 🎉'}
          onPress={handleUpload}
          loading={uploading}
          style={styles.uploadBtn}
        />

        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
  title: {
    ...Typography.heading,
    fontSize: 28,
    color: Colors.plum,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 21,
    marginBottom: 28,
  },
  sectionLabel: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.plum,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },

  // ── Profile Slot ──
  profileSlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileSlot: {
    width: PROFILE_SIZE,
    height: PROFILE_SIZE,
    borderRadius: PROFILE_SIZE / 2,
    backgroundColor: Colors.blush,
    borderWidth: 2.5,
    borderColor: 'rgba(232,68,122,0.2)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  profileSlotFilled: {
    borderStyle: 'solid',
    borderColor: Colors.magenta,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: PROFILE_SIZE / 2,
  },
  profilePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  editBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.magenta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHint: {
    flex: 1,
  },
  hintTitle: {
    ...Typography.bodyStrong,
    fontSize: 15,
    color: Colors.plum,
    marginBottom: 6,
  },
  hintBody: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 19,
  },

  // ── Extra Grid ──
  extraHint: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 14,
    marginTop: -6,
  },
  extraGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  extraSlot: {
    width: EXTRA_SIZE,
    height: EXTRA_SIZE * 1.3,
    borderRadius: Radius.card,
    backgroundColor: Colors.blush,
    borderWidth: 2,
    borderColor: 'rgba(232,68,122,0.2)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  extraSlotFilled: {
    borderStyle: 'solid',
    borderColor: Colors.magenta,
  },
  extraImage: {
    width: '100%',
    height: '100%',
  },
  extraPlaceholder: {
    alignItems: 'center',
    gap: 4,
  },
  extraPlaceholderNum: {
    ...Typography.caption,
    fontSize: 11,
    color: 'rgba(232,68,122,0.4)',
    fontWeight: '700',
  },
  removeBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(43,22,32,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Tips ──
  tipsCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: 18,
    marginTop: 24,
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  tipsTitle: {
    ...Typography.bodyStrong,
    fontSize: 14,
    color: Colors.plum,
    marginBottom: 10,
  },
  tipItem: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 22,
  },

  // ── Actions ──
  errorText: {
    ...Typography.caption,
    color: Colors.danger,
    fontSize: 13,
    marginTop: 16,
    textAlign: 'center',
  },
  uploadBtn: {
    marginTop: 24,
  },
  skipBtn: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipText: {
    ...Typography.caption,
    fontSize: 14,
    color: Colors.textMuted,
    textDecorationLine: 'underline',
  },
});
