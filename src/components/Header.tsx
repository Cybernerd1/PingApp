import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LogoMark } from './illustrations/BrandAssets';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

interface HeaderProps {
  onFilterPress?: () => void;
  onMatchesPress?: () => void;
  onProfilePress?: () => void;
  matchCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onFilterPress,
  onMatchesPress,
  onProfilePress,
  matchCount = 3,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.8} onPress={onProfilePress} style={styles.leftBrand}>
        <LogoMark size={38} />
        <Text style={styles.brandTitle}>ping</Text>
      </TouchableOpacity>

      <View style={styles.rightActions}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onFilterPress}
          style={styles.iconButton}
        >
          <Text style={styles.iconText}>🎛️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onMatchesPress}
          style={styles.iconButton}
        >
          <Text style={styles.iconText}>💬</Text>
          {matchCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{matchCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: Colors.cream,
  },
  leftBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandTitle: {
    ...Typography.heading,
    fontSize: 26,
    color: Colors.magenta,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  iconText: {
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.magenta,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
