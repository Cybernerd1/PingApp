import React from 'react';
import { Image, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '../theme/colors';

interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: number;
  ring?: boolean;
  online?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Round photo with initial fallback, optional lilac ring + online dot. */
export const Avatar: React.FC<AvatarProps> = ({ uri, name, size = 44, ring, online, style }) => {
  const inner = ring ? size - 6 : size;
  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2 },
        ring && styles.ring,
        styles.center,
        style,
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: inner, height: inner, borderRadius: inner / 2 }} />
      ) : (
        <View style={[styles.fallback, styles.center, { width: inner, height: inner, borderRadius: inner / 2 }]}>
          <Text style={[styles.initial, { fontSize: inner * 0.4 }]}>{(name ?? '?').trim().charAt(0).toUpperCase()}</Text>
        </View>
      )}
      {online ? (
        <View style={[styles.dot, { width: size * 0.26, height: size * 0.26, borderRadius: size * 0.13 }]} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  ring: { backgroundColor: Colors.primarySoft, borderWidth: 2, borderColor: '#C7AEF2' },
  fallback: { backgroundColor: Colors.primarySoft },
  initial: { color: Colors.primaryDeep, fontWeight: '800' },
  dot: { position: 'absolute', right: 0, bottom: 0, backgroundColor: Colors.online, borderWidth: 2, borderColor: Colors.white },
});
