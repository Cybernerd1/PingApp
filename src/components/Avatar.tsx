import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../theme/colors';
import { Radius, Typography } from '../theme/typography';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  isOnline?: boolean;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name = 'User',
  size = 56,
  isOnline = false,
  style,
}) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <View style={[{ width: size, height: size }, styles.wrapper, style]}>
      {uri ? (
        <Image source={{ uri }} style={[styles.image, { borderRadius: size / 2 }]} />
      ) : (
        <View style={[styles.placeholder, { borderRadius: size / 2 }]}>
          <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{initial}</Text>
        </View>
      )}
      {isOnline ? <View style={[styles.onlineBadge, { width: size * 0.25, height: size * 0.25 }]} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.magenta,
  },
  initial: {
    ...Typography.bodyStrong,
    color: Colors.magenta,
    fontWeight: '700',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Colors.white,
  },
});
