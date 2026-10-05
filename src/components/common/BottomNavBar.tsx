import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography, Radius } from '../../theme/typography';
import { HomeIcon, ChatBubbleIcon, UserIcon, BellIcon } from '../illustrations/Icons';

export type MainTabType = 'home' | 'chat' | 'notifications' | 'profile';

interface BottomNavBarProps {
  activeTab: MainTabType;
  onTabSelect: (tab: MainTabType) => void;
  unreadChatCount?: number;
  unreadNotificationCount?: number;
}

interface TabItem {
  id: MainTabType;
  label: string;
  icon: (active: boolean) => React.ReactNode;
  badge?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabSelect,
  unreadChatCount = 0,
  unreadNotificationCount = 0,
}) => {
  const tabs: TabItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: (active) => <HomeIcon size={22} color={active ? Colors.magenta : Colors.textMuted} />,
    },
    {
      id: 'chat',
      label: 'Chats',
      icon: (active) => (
        <ChatBubbleIcon size={22} color={active ? Colors.magenta : Colors.textMuted} />
      ),
      badge: unreadChatCount,
    },
    {
      id: 'notifications',
      label: 'Activity',
      icon: (active) => <BellIcon size={22} color={active ? Colors.magenta : Colors.textMuted} />,
      badge: unreadNotificationCount,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: (active) => <UserIcon size={22} color={active ? Colors.magenta : Colors.textMuted} />,
    },
  ];

  return (
    <View style={styles.navContainer}>
      <View style={styles.navInnerRow}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.8}
              onPress={() => onTabSelect(tab.id)}
              style={[styles.tabButton, isActive && styles.activeTabButton]}
            >
              <View style={styles.iconWrapper}>
                {tab.icon(isActive)}
                {/* Badge */}
                {typeof tab.badge === 'number' && tab.badge > 0 && !isActive && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    backgroundColor: Colors.cream,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 16,
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
    paddingHorizontal: 4,
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: Radius.pill,
    gap: 3,
  },
  activeTabButton: {
    backgroundColor: 'rgba(232, 68, 122, 0.10)',
  },
  iconWrapper: {
    position: 'relative',
  },
  tabLabel: {
    ...Typography.body,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  activeTabLabel: {
    color: Colors.magenta,
    fontWeight: '800',
  },
  badge: {
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
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
});
