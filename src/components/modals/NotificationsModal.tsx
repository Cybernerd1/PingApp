import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { Typography, Radius } from '../../theme/typography';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  avatarUrl?: string;
  unread: boolean;
  type: 'like' | 'match' | 'system' | 'message';
}

interface NotificationsModalProps {
  visible: boolean;
  notifications: NotificationItem[];
  onClose: () => void;
  onClearAll: () => void;
  onSelectNotification: (item: NotificationItem) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  visible,
  notifications,
  onClose,
  onClearAll,
  onSelectNotification,
}) => {
  if (!visible) return null;

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onSelectNotification(item)}
      style={[styles.notificationCard, item.unread && styles.unreadCard]}
    >
      {item.avatarUrl ? (
        <Image source={{ uri: item.avatarUrl }} style={styles.avatarImage} />
      ) : (
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>
            {item.type === 'match'
              ? '💖'
              : item.type === 'like'
              ? '❤️'
              : item.type === 'message'
              ? '💬'
              : '✨'}
          </Text>
        </View>
      )}

      <View style={styles.contentCol}>
        <View style={styles.topRow}>
          <Text style={styles.titleText}>{item.title}</Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <Text style={styles.messageText} numberOfLines={2}>
          {item.message}
        </Text>
      </View>

      {item.unread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity activeOpacity={0.8} onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Notifications</Text>

            {notifications.length > 0 ? (
              <TouchableOpacity activeOpacity={0.8} onPress={onClearAll}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 50 }} />
            )}
          </View>

          {/* List or Empty State */}
          {notifications.length > 0 ? (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listPadding}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySubtitle}>
                When you get new matches, pings, or messages, they will appear here.
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  headerRow: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    backgroundColor: Colors.cream,
    zIndex: 10,
  },
  closeBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  closeIcon: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.plum,
  },
  headerTitle: {
    ...Typography.heading,
    fontSize: 20,
    color: Colors.plum,
  },
  clearAllText: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.magenta,
    fontWeight: '700',
  },
  listPadding: {
    padding: 20,
    gap: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  unreadCard: {
    backgroundColor: '#FFF9FB',
    borderColor: 'rgba(232, 68, 122, 0.2)',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.magenta,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(232, 68, 122, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
  },
  contentCol: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  titleText: {
    ...Typography.heading,
    fontSize: 15,
    color: Colors.plum,
  },
  timeText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textMuted,
  },
  messageText: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.magenta,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 54,
    marginBottom: 16,
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
