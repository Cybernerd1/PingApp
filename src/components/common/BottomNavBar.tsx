import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography, Radius } from '../../theme/typography';

export type MainTabType = 'home' | 'chat' | 'profile';

interface BottomNavBarProps {
  activeTab: MainTabType;
  onTabSelect: (tab: MainTabType) => void;
  unreadChatCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabSelect,
  unreadChatCount = 1,
}) => {
  return (
    <View style={styles.navContainer}>
      <View style={styles.navInnerRow}>
        {/* Home Tab */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onTabSelect('home')}
          style={[styles.tabButton, activeTab === 'home' && styles.activeTabButton]}
        >
          <Text style={[styles.tabIcon, activeTab === 'home' && styles.activeTabIcon]}>
            🔥
          </Text>
          <Text style={[styles.tabLabel, activeTab === 'home' && styles.activeTabLabel]}>
            Home
          </Text>
        </TouchableOpacity>

        {/* Chat Tab */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onTabSelect('chat')}
          style={[styles.tabButton, activeTab === 'chat' && styles.activeTabButton]}
        >
          <View style={styles.iconWrapper}>
            <Text style={[styles.tabIcon, activeTab === 'chat' && styles.activeTabIcon]}>
              💬
            </Text>
            {unreadChatCount > 0 && activeTab !== 'chat' && (
              <View style={styles.chatBadge}>
                <Text style={styles.chatBadgeText}>{unreadChatCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.tabLabel, activeTab === 'chat' && styles.activeTabLabel]}>
            Chat
          </Text>
        </TouchableOpacity>

        {/* Profile Tab */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onTabSelect('profile')}
          style={[styles.tabButton, activeTab === 'profile' && styles.activeTabButton]}
        >
          <Text style={[styles.tabIcon, activeTab === 'profile' && styles.activeTabIcon]}>
            👤
          </Text>
          <Text style={[styles.tabLabel, activeTab === 'profile' && styles.activeTabLabel]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    backgroundColor: Colors.cream,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 14,
  },
  navInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.white,
    borderRadius: Radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 8,
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radius.pill,
    gap: 8,
  },
  activeTabButton: {
    backgroundColor: 'rgba(232, 68, 122, 0.12)',
  },
  iconWrapper: {
    position: 'relative',
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  activeTabIcon: {
    opacity: 1,
  },
  tabLabel: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  activeTabLabel: {
    color: Colors.magenta,
    fontWeight: '800',
  },
  chatBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: Colors.magenta,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  chatBadgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
});
