import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { Colors } from '../theme/colors';
import { Typography, Radius } from '../theme/typography';

// ─── Notification type icons (SVG, no emoji) ───────────────────────────────────
const MatchIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
      fill={Colors.magenta}
    />
  </Svg>
);

const LikeIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
      fill={Colors.coral}
    />
  </Svg>
);

const MessageIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
      fill={Colors.magenta}
    />
  </Svg>
);

const SystemIcon = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} fill={Colors.peach} />
    <Path d="M12 8v4M12 16h.01" stroke={Colors.plum} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const BellEmptyIcon = ({ size = 56 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z"
      stroke={Colors.textMuted} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
    />
    <Path
      d="M13.73 21a2 2 0 01-3.46 0"
      stroke={Colors.textMuted} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  avatarUrl?: string;
  unread: boolean;
  type: 'like' | 'match' | 'system' | 'message' | 'spam';
}

type FilterTab = 'All' | 'Matches' | 'Messages' | 'Likes' | 'Spam';

const FILTER_TABS: FilterTab[] = ['All', 'Matches', 'Messages', 'Likes', 'Spam'];

interface NotificationsScreenProps {
  notifications: NotificationItem[];
  onClearAll: () => void;
  onSelectNotification: (item: NotificationItem) => void;
  onMarkAllRead: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  notifications,
  onClearAll,
  onSelectNotification,
  onMarkAllRead,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Matches') return item.type === 'match';
    if (activeFilter === 'Messages') return item.type === 'message';
    if (activeFilter === 'Likes') return item.type === 'like';
    if (activeFilter === 'Spam') return item.type === 'spam';
    return true;
  });

  const getIconComponent = (type: string) => {
    switch (type) {
      case 'match': return <MatchIcon size={26} />;
      case 'like': return <LikeIcon size={26} />;
      case 'message': return <MessageIcon size={26} />;
      default: return <SystemIcon size={26} />;
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={() => onSelectNotification(item)}
      style={[styles.card, item.unread && styles.unreadCard]}
    >
      {/* Avatar / Icon */}
      <View style={styles.avatarContainer}>
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.avatarImg} />
        ) : (
          <View style={styles.iconCircle}>
            {getIconComponent(item.type)}
          </View>
        )}
        {/* Type badge on avatar */}
        {item.avatarUrl && (
          <View style={styles.typeBadge}>
            {getIconComponent(item.type)}
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.contentCol}>
        <Text style={styles.titleText}>{item.title}</Text>
        <Text style={styles.messageText} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>

      {/* Unread dot */}
      {item.unread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.some((n) => n.unread) && (
          <TouchableOpacity activeOpacity={0.8} onPress={onMarkAllRead}>
            <Text style={styles.markReadText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsContent}
        >
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.8}
              onPress={() => setActiveFilter(tab)}
              style={[styles.filterTab, activeFilter === tab && styles.filterTabActive]}
            >
              <Text style={[styles.filterTabText, activeFilter === tab && styles.filterTabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      {filteredNotifications.length > 0 ? (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <BellEmptyIcon size={48} />
          </View>
          <Text style={styles.emptyTitle}>All quiet here</Text>
          <Text style={styles.emptySubtitle}>
            When you get matches, pings, or messages, they'll show up here.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    ...Typography.heading,
    fontSize: 22,
    color: Colors.plum,
    fontWeight: '800',
  },
  markReadText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.magenta,
  },

  // Filter tabs
  filterTabsWrapper: {
    marginBottom: 8,
  },
  filterTabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  filterTabActive: {
    backgroundColor: Colors.magenta,
    borderColor: Colors.magenta,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  filterTabTextActive: {
    color: Colors.white,
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 4,
  },
  separator: {
    height: 8,
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 14,
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#FFF5F9',
    shadowColor: Colors.magenta,
    shadowOpacity: 0.1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatarImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: Colors.blush,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.blush,
    overflow: 'hidden',
  },
  contentCol: {
    flex: 1,
  },
  titleText: {
    ...Typography.heading,
    fontSize: 14,
    color: Colors.plum,
    fontWeight: '700',
    marginBottom: 2,
  },
  messageText: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.magenta,
    marginLeft: 8,
    flexShrink: 0,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    ...Typography.heading,
    fontSize: 20,
    color: Colors.plum,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
