import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { BellIcon } from './illustrations/Icons';
import { Colors } from '../theme/colors';

// Real logo assets
const PING_LOGO_FULL = require('../assets/images/ping_logo_full.png');

// Location pin SVG (no emoji)
const PinIcon = ({ size = 11, color = Colors.magenta }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
    <Circle cx={12} cy={9} r={2.5} stroke={color} strokeWidth={2} />
  </Svg>
);

interface HeaderProps {
  onNotificationPress?: () => void;
  unreadCount?: number;
  location?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onNotificationPress,
  unreadCount = 0,
  location,
}) => {
  return (
    <View style={styles.container}>
      {/* Brand Logo Left — full ping logo image */}
      <View style={styles.leftBrand}>
        <Image
          source={PING_LOGO_FULL}
          style={styles.logoImage}
          resizeMode="contain"
        />
        {location && (
          <View style={styles.locationBadge}>
            <PinIcon size={10} color={Colors.magenta} />
            <Text style={styles.locationText}>{location}</Text>
          </View>
        )}
      </View>

      {/* Right: Bell icon with badge */}
      <View style={styles.rightActions}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onNotificationPress}
          style={styles.iconBtn}
        >
          <BellIcon size={20} color={Colors.plum} />
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
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  leftBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImage: {
    height: 32,
    width: 110,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.blush,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.magenta,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.magenta,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: Colors.cream,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
});
