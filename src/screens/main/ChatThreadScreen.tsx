import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { launchImageLibrary } from 'react-native-image-picker';
import { Colors } from '../../theme/colors';
import { Radius, Typography } from '../../theme/typography';
import { ArrowLeft, Avatar, GradientBackground, IconButton, ImageIcon, More, Send, useMediaViewer } from '../../ui';
import { chatsApi } from '../../api/chats';
import { unwrap } from '../../api/client';
import { ChatMessage } from '../../api/types';
import { realtime } from '../../realtime/socket';
import { useSession } from '../../session/SessionContext';
import { CHATS_KEY, MATCHES_KEY, OpenChat, timeAgo } from './ChatsScreen';
import { ProfileSheet } from './ProfileSheet';

const MAX_LEN = 1000;

/** S13 — conversation: history over REST, live messages over Socket.IO. */
export const ChatThreadScreen: React.FC<{ chat: OpenChat; onBack: () => void }> = ({ chat, onBack }) => {
  const { me } = useSession();
  const qc = useQueryClient();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const { mediaViewer, openMedia } = useMediaViewer();
  const [text, setText] = useState('');
  const [live, setLive] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [connected, setConnected] = useState(realtime.connected);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [readByThem, setReadByThem] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSent = useRef(0);

  const history = useQuery({
    queryKey: ['messages', chat.chatId],
    queryFn: async () => unwrap(await chatsApi.getMessages(chat.chatId)).messages,
  });

  // Join room, listen for events.
  useEffect(() => {
    realtime.joinChat(chat.chatId);
    realtime.markRead(chat.chatId);
    const offs = [
      realtime.on('connection', ({ connected: c }) => setConnected(c)),
      realtime.on('new_message', ({ message }) => {
        if (message.chat_id !== chat.chatId) return;
        setLive(prev => {
          // Replace my optimistic copy if this is its echo.
          const idx = prev.findIndex(m => m.pending && m.sender_id === message.sender_id && m.content === message.content);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = message;
            return copy;
          }
          if (prev.some(m => m.message_id === message.message_id)) return prev;
          return [...prev, message];
        });
        if (message.sender_id !== me.user_id) {
          setTyping(false);
          realtime.markRead(chat.chatId);
        }
      }),
      realtime.on('user_typing', p => p.chat_id === chat.chatId && p.user_id !== me.user_id && setTyping(true)),
      realtime.on('user_stop_typing', p => p.chat_id === chat.chatId && setTyping(false)),
      realtime.on('message_status', p => p.chat_id === chat.chatId && p.status === 'read' && setReadByThem(true)),
      realtime.on('error', e => {
        setError(e.message);
        setLive(prev => prev.filter(m => !m.pending));
      }),
    ];
    return () => {
      offs.forEach(off => off());
      realtime.stopTyping(chat.chatId);
      realtime.leaveChat(chat.chatId);
      qc.invalidateQueries({ queryKey: CHATS_KEY });
      qc.invalidateQueries({ queryKey: MATCHES_KEY });
    };
  }, [chat.chatId, me.user_id, qc]);

  // Auto-hide "typing…" if the stop event never arrives.
  useEffect(() => {
    if (!typing) return;
    const t = setTimeout(() => setTyping(false), 6000);
    return () => clearTimeout(t);
  }, [typing]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  const messages = useMemo(() => {
    const base = history.data ?? [];
    const seen = new Set(base.map(m => m.message_id));
    return [...base, ...live.filter(m => !seen.has(m.message_id))];
  }, [history.data, live]);

  // With inverted list, newest message is at the top (offset 0).
  const scrollToEnd = useCallback(
    () => requestAnimationFrame(() => listRef.current?.scrollToOffset({ offset: 0, animated: true })),
    [],
  );
  useEffect(() => {
    scrollToEnd();
  }, [messages.length, scrollToEnd]);

  const onChange = (v: string) => {
    setText(v.slice(0, MAX_LEN));
    const now = Date.now();
    if (now - lastTypingSent.current > 2500) {
      realtime.typing(chat.chatId);
      lastTypingSent.current = now;
    }
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => realtime.stopTyping(chat.chatId), 3000);
  };

  const pushOptimistic = (content: string, type: ChatMessage['message_type'], mediaUrl?: string) => {
    setLive(prev => [
      ...prev,
      {
        message_id: `local-${Date.now()}`,
        chat_id: chat.chatId,
        sender_id: me.user_id,
        content,
        message_type: type,
        media_url: mediaUrl ?? null,
        is_read: false,
        created_at: new Date().toISOString(),
        pending: true,
      },
    ]);
  };

  const send = () => {
    const body = text.trim();
    if (!body) return;
    setError(null);
    if (!realtime.sendMessage(chat.chatId, body)) {
      setError('Not connected — reconnecting, try again in a moment.');
      realtime.connect();
      return;
    }
    pushOptimistic(body, 'text');
    setReadByThem(false);
    setText('');
    realtime.stopTyping(chat.chatId);
  };

  const sendPhoto = async () => {
    setError(null);
    const picked = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, quality: 0.8, maxWidth: 1600, maxHeight: 1600 });
    const asset = picked.assets?.[0];
    if (picked.didCancel || !asset?.uri) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', { uri: asset.uri, name: asset.fileName ?? `chat-${Date.now()}.jpg`, type: asset.type ?? 'image/jpeg' } as any);
    const res = await chatsApi.uploadMedia(chat.chatId, form);
    setUploading(false);
    if (res.status === 'error') return setError(res.message);
    if (!realtime.sendMessage(chat.chatId, '', 'image', res.data.media_url)) {
      setError('Not connected — photo uploaded but not sent. Try again.');
      return;
    }
    pushOptimistic('', 'image', res.data.media_url);
  };

  const renderItem = ({ item, index }: { item: ChatMessage; index: number }) => {
    const mine = item.sender_id === me.user_id;
    const prev = messages[index - 1];
    const showTime = !prev || new Date(item.created_at).getTime() - new Date(prev.created_at).getTime() > 30 * 60_000;
    return (
      <View>
        {showTime ? <Text style={styles.stamp}>{new Date(item.created_at).toLocaleString(undefined, { hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short' })}</Text> : null}
        <View style={[styles.bubbleRow, mine ? styles.right : styles.left]}>
          <View style={[styles.bubble, mine ? styles.mine : styles.theirs, item.message_type === 'image' && styles.imageBubble, item.pending && styles.pending]}>
            {item.message_type === 'image' && item.media_url ? (
              <Pressable onPress={() => openMedia(item.media_url!)} accessibilityRole="button" accessibilityLabel="View full image">
                <Image source={{ uri: item.media_url }} style={styles.image} />
              </Pressable>
            ) : (
              <Text style={[styles.text, mine && styles.textMine]}>{item.content}</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const last = messages[messages.length - 1];
  const seen = !!last && !last.pending && last.sender_id === me.user_id && (last.is_read || readByThem);

  return (
    <GradientBackground variant="soft">
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <IconButton accessibilityLabel="Back to chats" onPress={onBack} variant="white">
            <ArrowLeft />
          </IconButton>
          <Pressable style={styles.who} onPress={() => setProfileOpen(true)} accessibilityLabel={`View ${chat.name}'s profile`}>
            <Avatar uri={chat.photo} name={chat.name} size={42} />
            <View style={styles.flex}>
              <Text style={styles.whoName} numberOfLines={1}>
                {chat.name}
              </Text>
              <Text style={styles.whoSub}>{typing ? 'typing…' : connected ? 'Tap to view profile' : 'Connecting…'}</Text>
            </View>
          </Pressable>
          <IconButton accessibilityLabel="More options" onPress={() => setProfileOpen(true)} variant="white">
            <More />
          </IconButton>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          {history.isLoading ? (
            <ActivityIndicator style={styles.flex} color={Colors.primary} />
          ) : history.isError ? (
            <View style={[styles.flex, styles.center]}>
              <Text style={styles.err}>{(history.error as Error).message}</Text>
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={[...messages].reverse()}
              keyExtractor={m => m.message_id}
              renderItem={renderItem}
              contentContainerStyle={styles.list}
              inverted
              keyboardShouldPersistTaps="handled"
              ListFooterComponent={
                <>
                  {seen ? <Text style={styles.seen}>Seen {timeAgo(last.created_at)}</Text> : null}
                  {typing ? <Text style={styles.typing}>{chat.name.split(' ')[0]} is typing…</Text> : null}
                </>
              }
              ListHeaderComponent={
                history.isLoading ? null :
                messages.length === 0 ? (
                  <View style={styles.center}>
                    <Avatar uri={chat.photo} name={chat.name} size={88} ring />
                    <Text style={styles.emptyTitle}>You matched with {chat.name.split(' ')[0]}</Text>
                    <Text style={styles.emptySub}>It starts with a Ping. Say hi 👋</Text>
                  </View>
                ) : null
              }
            />
          )}

          {error ? <Text style={styles.errBar}>{error}</Text> : null}
          <View style={styles.composer}>
            <IconButton accessibilityLabel="Send a photo" onPress={sendPhoto} disabled={uploading} variant="white" size={44}>
              {uploading ? <ActivityIndicator size="small" color={Colors.primary} /> : <ImageIcon />}
            </IconButton>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={onChange}
              placeholder="Type a message…"
              placeholderTextColor={Colors.faint}
              multiline
              maxLength={MAX_LEN}
              accessibilityLabel="Message"
            />
            <IconButton accessibilityLabel="Send" onPress={send} disabled={!text.trim()} variant="primary" size={44}>
              <Send size={18} />
            </IconButton>
          </View>
        </KeyboardAvoidingView>

        <ProfileSheet
          visible={profileOpen}
          userId={chat.userId}
          matchId={chat.matchId}
          onClose={() => setProfileOpen(false)}
          onSafetyAction={kind => {
            if (kind !== 'reported') onBack();
          }}
        />
        </SafeAreaView>
        {mediaViewer}
      </GradientBackground>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 8 },
  who: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  whoName: { ...Typography.bodyStrong, color: Colors.ink },
  whoSub: { ...Typography.caption, color: Colors.mute },
  list: { paddingHorizontal: 16, paddingVertical: 12, flexGrow: 1 },
  stamp: { ...Typography.caption, color: Colors.faint, textAlign: 'center', marginVertical: 10 },
  bubbleRow: { flexDirection: 'row', marginVertical: 3 },
  left: { justifyContent: 'flex-start' },
  right: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  mine: { backgroundColor: Colors.primary, borderBottomRightRadius: 6 },
  theirs: { backgroundColor: Colors.white, borderBottomLeftRadius: 6 },
  imageBubble: { padding: 4 },
  pending: { opacity: 0.6 },
  text: { ...Typography.body, color: Colors.ink },
  textMine: { color: Colors.white },
  image: { width: 220, height: 260, borderRadius: 16, backgroundColor: Colors.primarySoft },
  seen: { ...Typography.caption, color: Colors.mute, textAlign: 'right', marginTop: 4 },
  typing: { ...Typography.caption, color: Colors.primaryDeep, marginTop: 6 },
  emptyTitle: { ...Typography.heading, color: Colors.ink, marginTop: 14 },
  emptySub: { ...Typography.body, color: Colors.mute, marginTop: 4 },
  err: { ...Typography.body, color: Colors.danger, textAlign: 'center', padding: 24 },
  errBar: { ...Typography.caption, color: Colors.danger, paddingHorizontal: 20, paddingBottom: 6 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: Radius.card,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    ...Typography.body,
    color: Colors.ink,
  },
});
