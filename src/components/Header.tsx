import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LogoMark } from './illustrations/BrandAssets';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

interface HeaderProps {
  onNotificationPress?: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onNotificationPress,
  unreadCount = 2,
}) => {
  return (
    <View style={styles.container}>
      {/* Brand Title with Logo */}
      <View style={styles.leftBrand}>
        <LogoMark size={36} />
        <Text style={styles.brandTitle}>ping</Text>
      </View>

      {/* Notification Icon Button ONLY */}
      <View style={styles.rightActions}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onNotificationPress}
          style={styles.notificationBtn}
        >
          <Text style={styles.bellIcon}>🔔</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
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
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
  },
  bellIcon: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.magenta,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.cream,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
});
