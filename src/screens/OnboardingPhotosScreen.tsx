import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Button } from '../components/Button';
import { PhotoGrid } from '../components/PhotoGrid';
import { usePhotos } from '../hooks/usePhotos';
import { ProfilePhoto } from '../api/types';

interface OnboardingPhotosScreenProps {
  onNext: () => void;
}

export const OnboardingPhotosScreen: React.FC<OnboardingPhotosScreenProps> = ({ onNext }) => {
  const { photos, uploadPhotos, isUploadingPhotos, deletePhoto, setProfilePicture } = usePhotos();
  const [localPhotos, setLocalPhotos] = useState<ProfilePhoto[]>([
    { photo_id: 'p1', photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', is_profile_picture: true },
  ]);

  const handleAddPhoto = () => {
    // Demo addition / trigger react-native-image-picker
    const newPhoto: ProfilePhoto = {
      photo_id: `p_${Date.now()}`,
      photo_url: `https://picsum.photos/400/600?random=${Date.now()}`,
    };
    setLocalPhotos([...localPhotos, newPhoto]);
  };

  const handleRemovePhoto = (photoId: string) => {
    setLocalPhotos(localPhotos.filter(p => p.photo_id !== photoId));
  };

  const activePhotosList = photos.length > 0 ? photos : localPhotos;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Add your best photos</Text>
      <Text style={styles.subtitle}>Step 3 of 6 — Upload at least 1 photo</Text>

      <PhotoGrid
        photos={activePhotosList}
        onAddPhoto={handleAddPhoto}
        onRemovePhoto={handleRemovePhoto}
      />

      <Button
        title="Continue to Preferences"
        onPress={onNext}
        disabled={activePhotosList.length === 0}
        style={styles.btn}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  content: { padding: 24 },
  title: { ...Typography.display, color: Colors.magenta, marginBottom: 4 },
  subtitle: { ...Typography.caption, color: Colors.plum, marginBottom: 24 },
  btn: { marginTop: 32 },
});
