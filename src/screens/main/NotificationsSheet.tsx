import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { EmptyState, GlassCard, PillButton, Sheet } from '../../ui';
import { useNotifications } from '../../notifications/NotificationsContext';

const ago = (t: number) => {
  const m = Math.floor((Date.now() - t) / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h` : `${Math.floor(h / 24)}d`;
};

export const NotificationsSheet: React.FC<{
  visible: boolean;
  onClose: () => void;
  onOpenChats: () => void;
  onOpenChat: (chatId: string) => void;
}> = ({ visible, onClose, onOpenChats, onOpenChat }) => {
  const { items, markAllRead, clear } = useNotifications();
  useEffect(() => {
    if (visible) markAllRead();
  }, [visible, markAllRead]);

  return (
    <Sheet visible={visible} onClose={onClose} title="Notifications">
      {items.length === 0 ? (
        <EmptyState emoji="🔔" title="All caught up" message="New matches and messages will show up here." />
      ) : (
        <>
          <GlassCard strong padded={false}>
            <View style={styles.list}>
              {items.map((n, i) => (
                <Pressable
                  key={n.id}
                  disabled={!n.chatId}
                  accessibilityRole={n.chatId ? 'button' : undefined}
                  onPress={() => {
                    if (!n.chatId) return;
                    onClose();
                    onOpenChat(n.chatId);
                  }}
                  style={({ pressed }) => [styles.row, i === items.length - 1 && styles.last, pressed && styles.pressed]}
                >
                  <Text style={styles.icon}>{n.icon}</Text>
                  <View style={styles.flex}>
                    <Text style={styles.title}>{n.title}</Text>
                    <Text style={styles.body} numberOfLines={2}>
                      {n.body}
                    </Text>
                  </View>
                  <Text style={styles.time}>{ago(n.at)}</Text>
                </Pressable>
              ))}
            </View>
          </GlassCard>
          <PillButton title="Open chats" onPress={() => { onClose(); onOpenChats(); }} style={styles.btn} />
          <PillButton title="Clear all" variant="ghost" onPress={clear} />
        </>
      )}
    </Sheet>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.line },
  last: { borderBottomWidth: 0 },
  pressed: { opacity: 0.6 },
  icon: { fontSize: 22 },
  title: { ...Typography.bodyStrong, color: Colors.ink },
  body: { ...Typography.caption, color: Colors.mute, marginTop: 2 },
  time: { ...Typography.caption, color: Colors.faint },
  btn: { marginTop: 14 },
});
