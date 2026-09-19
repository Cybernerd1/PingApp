import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Typography, Radius } from '../theme/typography';
import { ConfirmDialog } from '../components/modals/ConfirmDialog';
import {
  EditProfileIcon,
  BellIcon,
  ShieldIcon,
  SettingsIcon,
  LogoutIcon,
  CameraIcon,
  ChevronRightIcon,
  UserIcon,
} from '../components/illustrations/Icons';

interface ProfileScreenProps {
  user?: any;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onLogout,
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const userData = user || {
    username: 'Alex Morgan',
    age: 25,
    jobTitle: 'Product Designer',
    location: 'San Francisco, CA',
    bio: 'Coffee addict, UI/UX enthusiast, and weekend surfer 🏄‍♂️ Looking for good vibes and great conversations.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    email: 'alex@ping.app',
    completionPercentage: 85,
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        {/* Profile Card Header */}
        <View style={styles.headerCard}>
          <View style={styles.avatarWrapper}>
            {userData.avatar && !avatarError ? (
              <Image
                source={{ uri: userData.avatar }}
                style={styles.avatarImage}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <View style={[styles.avatarImage, styles.avatarFallback]}>
                <UserIcon size={44} color={Colors.magenta} />
              </View>
            )}
            <TouchableOpacity activeOpacity={0.8} style={styles.editAvatarBadge}>
              <CameraIcon size={16} color={Colors.plum} />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>
            {userData.username}{userData.age ? `, ${userData.age}` : ''}
          </Text>
          <Text style={styles.userJob}>💼 {userData.jobTitle}</Text>
          <Text style={styles.userLocation}>📍 {userData.location}</Text>

          {/* Profile Completion Bar */}
          <View style={styles.completionContainer}>
            <View style={styles.completionTextRow}>
              <Text style={styles.completionLabel}>Profile Strength</Text>
              <Text style={styles.completionValue}>{userData.completionPercentage}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${userData.completionPercentage}%` }]} />
            </View>
          </View>
        </View>

        {/* Settings Action List */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Account Settings</Text>

          <TouchableOpacity activeOpacity={0.8} style={styles.settingItem}>
            <View style={styles.settingIconCircle}>
              <EditProfileIcon size={18} color={Colors.magenta} />
            </View>
            <Text style={styles.settingLabel}>Edit Profile & Photos</Text>
            <ChevronRightIcon size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} style={styles.settingItem}>
            <View style={styles.settingIconCircle}>
              <BellIcon size={18} color={Colors.magenta} />
            </View>
            <Text style={styles.settingLabel}>Push Notification Settings</Text>
            <ChevronRightIcon size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} style={styles.settingItem}>
            <View style={styles.settingIconCircle}>
              <ShieldIcon size={18} color={Colors.magenta} />
            </View>
            <Text style={styles.settingLabel}>Privacy & Security</Text>
            <ChevronRightIcon size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} style={styles.settingItem}>
            <View style={styles.settingIconCircle}>
              <SettingsIcon size={18} color={Colors.magenta} />
            </View>
            <Text style={styles.settingLabel}>Discovery Preferences</Text>
            <ChevronRightIcon size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Danger Zone: Logout Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowLogoutConfirm(true)}
          style={styles.logoutBtn}
        >
          <LogoutIcon size={18} color={Colors.danger} />
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Ping v1.0.0 • Made with ❤️</Text>
      </ScrollView>

      {/* Custom Logout Confirmation Dialog */}
      <ConfirmDialog
        visible={showLogoutConfirm}
        title="Log Out of Ping?"
        message="Are you sure you want to log out? You can log back in anytime to see your matches and pings."
        icon="🚪"
        confirmText="Log Out"
        cancelText="Cancel"
        isDanger
        onConfirm={() => {
          setShowLogoutConfirm(false);
          onLogout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scrollPadding: {
    padding: 20,
    gap: 20,
  },
  headerCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.magenta,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarFallback: {
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    ...Typography.heading,
    fontSize: 22,
    color: Colors.plum,
    marginBottom: 4,
  },
  userJob: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  userLocation: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.magenta,
    fontWeight: '600',
    marginBottom: 16,
  },
  completionContainer: {
    width: '100%',
    backgroundColor: Colors.cream,
    padding: 14,
    borderRadius: Radius.card,
  },
  completionTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  completionLabel: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.plum,
    fontWeight: '700',
  },
  completionValue: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.magenta,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.magenta,
    borderRadius: 4,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: 20,
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionHeading: {
    ...Typography.heading,
    fontSize: 16,
    color: Colors.plum,
    marginBottom: 14,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  settingIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(232, 68, 122, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingLabel: {
    flex: 1,
    ...Typography.body,
    fontSize: 15,
    color: Colors.plum,
    fontWeight: '600',
  },
  logoutBtn: {
    height: 52,
    backgroundColor: 'rgba(242, 134, 95, 0.1)',
    borderRadius: Radius.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(242, 134, 95, 0.25)',
  },
  logoutBtnText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.danger,
  },
  versionText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});
