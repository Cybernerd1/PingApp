import React from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Radius, Typography } from '../theme/typography';
import { ProfilePhoto } from '../api/types';

interface PhotoGridProps {
  photos: ProfilePhoto[];
  maxPhotos?: number;
  onAddPhoto: () => void;
  onRemovePhoto: (photoId: string) => void;
  onSetMainPhoto?: (photoId: string) => void;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  maxPhotos = 6,
  onAddPhoto,
  onRemovePhoto,
  onSetMainPhoto,
}) => {
  const slots = Array.from({ length: maxPhotos });

  return (
    <View style={styles.grid}>
      {slots.map((_, index) => {
        const photo = photos[index];
        const isMain = photo?.is_profile_picture || index === 0;

        return (
          <View key={index} style={styles.slotContainer}>
            {photo ? (
              <View style={styles.photoWrapper}>
                <Image source={{ uri: photo.photo_url }} style={styles.image} />
                {isMain ? (
                  <View style={styles.mainBadge}>
                    <Text style={styles.mainBadgeText}>Main</Text>
                  </View>
                ) : onSetMainPhoto ? (
                  <TouchableOpacity
                    style={styles.setMainButton}
                    onPress={() => onSetMainPhoto(photo.photo_id)}
                  >
                    <Text style={styles.setMainText}>Make Main</Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => onRemovePhoto(photo.photo_id)}
                >
                  <Text style={styles.deleteText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addSlot}
                activeOpacity={0.7}
                onPress={onAddPhoto}
              >
                <Text style={styles.addPlus}>+</Text>
                <Text style={styles.addText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    width: '100%',
  },
  slotContainer: {
    width: '30%',
    aspectRatio: 0.8,
  },
  photoWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: Radius.medium,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.blush,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mainBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: Colors.magenta,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  mainBadgeText: {
    ...Typography.caption,
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  setMainButton: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(43, 22, 32, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  setMainText: {
    ...Typography.caption,
    color: Colors.white,
    fontSize: 9,
  },
  deleteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.danger,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  addSlot: {
    width: '100%',
    height: '100%',
    borderRadius: Radius.medium,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPlus: {
    fontSize: 24,
    color: Colors.magenta,
    fontWeight: '600',
  },
  addText: {
    ...Typography.caption,
    color: Colors.plum,
    fontSize: 10,
    marginTop: 2,
  },
});
