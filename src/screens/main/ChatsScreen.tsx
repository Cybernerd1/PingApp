import React from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Avatar, EmptyState } from '../../ui';
import { chatsApi } from '../../api/chats';
import { matchesApi } from '../../api/matches';
import { unwrap } from '../../api/client';
import { ChatConversation, LastMessage } from '../../api/types';
import { useSession } from '../../session/SessionContext';
import { assistantApi } from '../../api/assistant';
import { ASSISTANT_KEY, AssistantAvatar } from './AssistantChatScreen';

export interface OpenChat {
  chatId: string;
  matchId: string | null;
  userId: string;
  name: string;
  photo: string | null;
}

export const CHATS_KEY = ['chats'];
export const MATCHES_KEY = ['matches'];

export function timeAgo(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < 60) return 'now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)}d`;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

const preview = (m: LastMessage | null, meId: string) => {
  if (!m) return 'You matched — say hi 👋';
  const body = m.message_type === 'image' ? '📷 Photo' : m.message_type === 'voice' ? '🎤 Voice note' : m.content;
  return m.sender_user_id === meId ? `You: ${body}` : body;
};

/** S12 — new matches row + conversations (GET /matches, GET /chats). */
export const ChatsScreen: React.FC<{
  unread: Set<string>;
  onOpen: (c: OpenChat) => void;
  onOpenAssistant: () => void;
}> = ({ unread, onOpen, onOpenAssistant }) => {
  const { me } = useSession();
  const assistant = useQuery({
    queryKey: ASSISTANT_KEY,
    queryFn: async () => unwrap(await assistantApi.getMessages(100)),
    retry: false,
  });
  const assistantLast = assistant.data?.messages[assistant.data.messages.length - 1];
  const chats = useQuery({ queryKey: CHATS_KEY, queryFn: async () => unwrap(await chatsApi.getChats(50, 0)) });
  const matches = useQuery({ queryKey: MATCHES_KEY, queryFn: async () => unwrap(await matchesApi.getMatches()).matches });

  const fresh = (matches.data ?? []).filter(m => !m.has_conversation && m.chat_id);
  const list = [...(chats.data ?? [])].sort(
    (a, b) => new Date(b.last_message?.sent_at ?? b.updated_at).getTime() - new Date(a.last_message?.sent_at ?? a.updated_at).getTime(),
  );
  const refreshing = chats.isRefetching || matches.isRefetching;
  const refresh = () => {
    chats.refetch();
    matches.refetch();
    assistant.refetch();
  };

  const openConv = (c: ChatConversation) =>
    onOpen({ chatId: c.chat_id, matchId: c.match_id, userId: c.matched_user_id, name: c.matched_user_name, photo: c.matched_user_photo_url });

  return (
    <FlatList
      data={list}
      keyExtractor={c => c.chat_id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.primary} />}
      ListHeaderComponent={
        <View>
          <Text style={styles.title} accessibilityRole="header">
            Chats
          </Text>
          <Pressable
            onPress={onOpenAssistant}
            style={({ pressed }) => [styles.row, styles.assistantRow, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Chat with Ping Assistant"
          >
            <AssistantAvatar size={56} />
            <View style={styles.rowBody}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>Ping Assistant</Text>
                <View style={styles.pin}>
                  <Text style={styles.pinText}>AI</Text>
                </View>
              </View>
              <Text style={styles.preview} numberOfLines={1}>
                {assistantLast
                  ? `${assistantLast.role === 'user' ? 'You: ' : ''}${assistantLast.content}`
                  : 'Bio tips, openers, date ideas — ask me anything'}
              </Text>
            </View>
            {assistantLast ? <Text style={styles.time}>{timeAgo(assistantLast.created_at)}</Text> : null}
          </Pressable>
          {fresh.length ? (
            <>
              <Text style={styles.section}>New matches</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.freshRow}>
                {fresh.map(m => (
                  <Pressable
                    key={m.match_id}
                    style={styles.freshItem}
                    accessibilityLabel={`Chat with ${m.matched_user.full_name}`}
                    onPress={() =>
                      onOpen({
                        chatId: m.chat_id!,
                        matchId: m.match_id,
                        userId: m.matched_user.user_id,
                        name: m.matched_user.full_name,
                        photo: m.matched_user.profile_picture?.photo_url ?? null,
                      })
                    }
                  >
                    <Avatar uri={m.matched_user.profile_picture?.photo_url} name={m.matched_user.full_name} size={68} ring />
                    <Text style={styles.freshName} numberOfLines={1}>
                      {m.matched_user.full_name.split(' ')[0]}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          ) : null}
          {list.length ? <Text style={styles.section}>Messages</Text> : null}
        </View>
      }
      ListEmptyComponent={
        chats.isLoading ? (
          <EmptyState loading title="Loading chats…" />
        ) : chats.isError ? (
          <EmptyState emoji="📡" title="Couldn’t load chats" message={(chats.error as Error).message} actionLabel="Try again" onAction={refresh} />
        ) : fresh.length ? undefined : (
          <EmptyState emoji="💬" title="No chats yet" message="When you and someone like each other, you can chat here." />
        )
      }
      renderItem={({ item }) => {
        const isUnread = unread.has(item.chat_id);
        return (
          <Pressable
            onPress={() => openConv(item)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`Chat with ${item.matched_user_name}${isUnread ? ', unread' : ''}`}
          >
            <Avatar uri={item.matched_user_photo_url} name={item.matched_user_name} size={56} />
            <View style={styles.rowBody}>
              <Text style={styles.name} numberOfLines={1}>
                {item.matched_user_name}
              </Text>
              <Text style={[styles.preview, isUnread && styles.previewUnread]} numberOfLines={1}>
                {preview(item.last_message, me.user_id)}
              </Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.time}>{timeAgo(item.last_message?.sent_at ?? item.created_at)}</Text>
              {isUnread ? <View style={styles.unreadDot} /> : null}
            </View>
          </Pressable>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 },
  title: { ...Typography.title, color: Colors.ink, marginTop: 12, marginBottom: 8 },
  section: { ...Typography.label, color: Colors.mute, marginTop: 14, marginBottom: 10 },
  freshRow: { gap: 14, paddingBottom: 6 },
  freshItem: { alignItems: 'center', width: 72 },
  freshName: { ...Typography.caption, color: Colors.ink, fontWeight: '600', marginTop: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    marginBottom: 10,
    borderRadius: 22,
    backgroundColor: Colors.glassStrong,
  },
  pressed: { opacity: 0.7 },
  assistantRow: { borderWidth: 1, borderColor: Colors.primarySoft, marginTop: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pin: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6, backgroundColor: Colors.primarySoft },
  pinText: { fontSize: 10, fontWeight: '800', color: Colors.primaryDeep },
  rowBody: { flex: 1 },
  name: { ...Typography.bodyStrong, color: Colors.ink },
  preview: { ...Typography.caption, color: Colors.mute, marginTop: 2 },
  previewUnread: { color: Colors.ink, fontWeight: '700' },
  rowRight: { alignItems: 'flex-end', gap: 6 },
  time: { ...Typography.caption, color: Colors.faint },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
});
