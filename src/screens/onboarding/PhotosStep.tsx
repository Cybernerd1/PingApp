import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { Colors } from '../../theme/colors';
import { Radius, Typography } from '../../theme/typography';
import { Camera, Close, Plus, Star } from '../../ui';
import { photosApi } from '../../api/photos';
import { unwrap } from '../../api/client';
import { ProfilePhoto } from '../../api/types';
import { StepLayout } from './StepLayout';

interface Props {
  step: number;
  total: number;
  onBack: () => void;
  onDone: () => void;
}

const MAX = 6;
const GAP = 12;
const { width: W } = Dimensions.get('window');
const TILE_W = (W - 48 - GAP * 2) / 3;
const TILE_H = TILE_W * 1.3;

interface Pending {
  key: string;
  uri: string;
}

/** S6 — up to 6 photos; first one is the profile picture. */
export const PhotosStep: React.FC<Props> = ({ step, total, onBack, onDone }) => {
  const qc = useQueryClient();
  const photos = useQuery({
    queryKey: ['userPhotos'],
    queryFn: async () => unwrap(await photosApi.getPhotos()).photos,
  });
  const [pending, setPending] = useState<Pending[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const list: ProfilePhoto[] = [...(photos.data ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const remaining = MAX - list.length - pending.length;

  const refresh = () => qc.invalidateQueries({ queryKey: ['userPhotos'] });

  const uploadOne = async (asset: Asset) => {
    const key = `${asset.uri}-${Math.random()}`;
    setPending(p => [...p, { key, uri: asset.uri! }]);
    const form = new FormData();
    form.append('photos', {
      uri: asset.uri,
      name: asset.fileName ?? `photo-${Date.now()}.jpg`,
      type: asset.type ?? 'image/jpeg',
    } as any);
    const res = await photosApi.uploadPhotos(form);
    setPending(p => p.filter(x => x.key !== key));
    if (res.status === 'error') setError(res.details ? String(res.details) : res.message);
  };

  const pick = async () => {
    setError(null);
    if (remaining <= 0) return;
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: remaining,
      quality: 0.8,
      maxWidth: 1440,
      maxHeight: 1920,
    });
    if (result.didCancel) return;
    if (result.errorCode) {
      setError(result.errorMessage ?? 'Could not open your photos.');
      return;
    }
    const assets = (result.assets ?? []).filter(a => a.uri).slice(0, remaining);
    // Sequential keeps ordering stable on the server.
    for (const a of assets) {
      await uploadOne(a);
    }
    refresh();
  };

  const remove = async (id: string) => {
    setBusyId(id);
    setError(null);
    const res = await photosApi.deletePhoto(id);
    if (res.status === 'error') setError(res.message);
    await refresh();
    setBusyId(null);
  };

  const makeMain = async (id: string) => {
    setBusyId(id);
    setError(null);
    const res = await photosApi.setProfilePicture(id);
    if (res.status === 'error') setError(res.message);
    await refresh();
    setBusyId(null);
  };

  const slots = Array.from({ length: MAX });

  return (
    <StepLayout
      step={step}
      total={total}
      title="Add your best photos"
      subtitle="Add at least 1. Tap a photo to make it your main picture."
      onBack={onBack}
      onNext={onDone}
      nextDisabled={list.length < 1 || pending.length > 0}
      error={error ?? (photos.isError ? (photos.error as Error).message : null)}
    >
      {photos.isLoading ? (
        <ActivityIndicator color={Colors.primary} style={styles.loader} />
      ) : (
        <View style={styles.grid}>
          {slots.map((_, i) => {
            const photo = list[i];
            const pend = !photo ? pending[i - list.length] : undefined;

            if (photo) {
              const isMain = i === 0;
              return (
                <Pressable
                  key={photo.photo_id}
                  onPress={() => !isMain && makeMain(photo.photo_id)}
                  accessibilityLabel={isMain ? 'Main photo' : 'Photo, tap to make main'}
                  style={styles.tile}
                >
                  <Image source={{ uri: photo.photo_url }} style={styles.img} />
                  {isMain ? (
                    <View style={styles.mainBadge}>
                      <Star size={10} />
                      <Text style={styles.mainText}>Main</Text>
                    </View>
                  ) : null}
                  <Pressable
                    accessibilityLabel="Remove photo"
                    hitSlop={8}
                    onPress={() => remove(photo.photo_id)}
                    style={styles.remove}
                  >
                    <Close size={12} color={Colors.white} />
                  </Pressable>
                  {busyId === photo.photo_id ? (
                    <View style={styles.overlay}>
                      <ActivityIndicator color={Colors.white} />
                    </View>
                  ) : null}
                </Pressable>
              );
            }

            if (pend) {
              return (
                <View key={pend.key} style={styles.tile}>
                  <Image source={{ uri: pend.uri }} style={styles.img} />
                  <View style={styles.overlay}>
                    <ActivityIndicator color={Colors.white} />
                  </View>
                </View>
              );
            }

            const isNext = i === list.length + pending.length;
            return (
              <Pressable
                key={`empty-${i}`}
                onPress={pick}
                disabled={!isNext}
                accessibilityLabel="Add photo"
                style={[styles.tile, styles.empty, isNext && styles.emptyNext]}
              >
                {isNext ? (
                  <>
                    <Camera />
                    <View style={styles.plus}>
                      <Plus size={14} color={Colors.white} />
                    </View>
                  </>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      )}

      <Text style={styles.tip}>
        Tip: clear, recent photos of your face get more matches. Photos may be reviewed before they’re shown.
      </Text>
    </StepLayout>
  );
};

const styles = StyleSheet.create({
  loader: { marginTop: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  tile: { width: TILE_W, height: TILE_H, borderRadius: Radius.card, overflow: 'hidden', backgroundColor: Colors.glass },
  img: { width: '100%', height: '100%' },
  empty: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(18,16,22,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyNext: { borderColor: Colors.primary, backgroundColor: Colors.glassStrong },
  plus: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
  },
  mainText: { ...Typography.caption, color: Colors.white, fontWeight: '700' },
  remove: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(18,16,22,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(18,16,22,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tip: { ...Typography.caption, color: Colors.mute, marginTop: 18 },
});
