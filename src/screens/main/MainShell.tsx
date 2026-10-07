import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { ensureLocationReady } from '../../native/location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { GradientBackground } from '../../ui';
import { onForegroundMessage, getFCMToken, onTokenRefresh, onNotificationOpened } from '../../native/fcm';
import { devicesApi } from '../../api/devices';
import { chatsApi } from '../../api/chats';
import { matchesApi } from '../../api/matches';
import { unwrap } from '../../api/client';
import { NotificationsProvider, useNotifications } from '../../notifications/NotificationsContext';
import { NotificationsSheet } from './NotificationsSheet';
import { realtime } from '../../realtime/socket';
import { useSession } from '../../session/SessionContext';
import { NotificationToast, ToastConfig } from '../../ui/NotificationToast';
import { DeckProvider, useDeck } from './DeckContext';
import { HomeScreen } from './HomeScreen';
import { CHATS_KEY, ChatsScreen, MATCHES_KEY, OpenChat } from './ChatsScreen';
import { ChatThreadScreen } from './ChatThreadScreen';
import { AssistantChatScreen } from './AssistantChatScreen';
import { MyProfileScreen } from './profile/MyProfileScreen';
import { MatchOverlay } from './MatchOverlay';
import { MainTab, TabBar } from './TabBar';

/** Authenticated app: tabs + chat thread + realtime wiring. */
export const MainShell: React.FC<{ welcomeToast?: ToastConfig | null }> = ({ welcomeToast }) => (
  <DeckProvider>
    <NotificationsProvider>
      <ShellInner welcomeToast={welcomeToast ?? null} />
    </NotificationsProvider>
  </DeckProvider>
);

const ShellInner: React.FC<{ welcomeToast: ToastConfig | null }> = ({ welcomeToast }) => {
  const { me } = useSession();
  const qc = useQueryClient();
  const deck = useDeck();
  const notif = useNotifications();
  const addNotif = notif.add;
  const [tab, setTab] = useState<MainTab>('home');
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [openChat, setOpenChat] = useState<OpenChat | null>(null);
  const [unread, setUnread] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<ToastConfig | null>(welcomeToast);
  const openChatRef = useRef<OpenChat | null>(null);
  openChatRef.current = openChat;

  const open = useCallback((c: OpenChat) => {
    setUnread(prev => {
      const n = new Set(prev);
      n.delete(c.chatId);
      return n;
    });
    setOpenChat(c);
  }, []);

  /**
   * Open a conversation from just its id (push notification tap, in-app
   * notification, toast). Looks it up in /chats, then /matches (a brand-new
   * match has no messages yet). Falls back to the Chats tab.
   */
  const openChatById = useCallback(
    async (chatId?: string | null) => {
      setTab('chats');
      if (!chatId) return;
      try {
        const chats = await qc.fetchQuery({
          queryKey: CHATS_KEY,
          queryFn: async () => unwrap(await chatsApi.getChats(50, 0)),
          staleTime: 0,
        });
        const c = chats.find(x => x.chat_id === chatId);
        if (c) {
          open({ chatId: c.chat_id, matchId: c.match_id, userId: c.matched_user_id, name: c.matched_user_name, photo: c.matched_user_photo_url });
          return;
        }
        const ms = await qc.fetchQuery({
          queryKey: MATCHES_KEY,
          queryFn: async () => unwrap(await matchesApi.getMatches()).matches,
          staleTime: 0,
        });
        const m = ms.find(x => x.chat_id === chatId);
        if (m) {
          open({
            chatId,
            matchId: m.match_id,
            userId: m.matched_user.user_id,
            name: m.matched_user.full_name,
            photo: m.matched_user.profile_picture?.photo_url ?? null,
          });
        }
      } catch {
        // stay on the Chats tab
      }
    },
    [qc, open],
  );

  // Realtime: connect once, surface new messages / matches anywhere in the app.
  useEffect(() => {
    realtime.connect();
    const offMsg = realtime.on('new_message', ({ message }) => {
      qc.invalidateQueries({ queryKey: CHATS_KEY });
      qc.invalidateQueries({ queryKey: MATCHES_KEY });
      if (message.sender_id === me.user_id || openChatRef.current?.chatId === message.chat_id) return;
      setUnread(prev => new Set(prev).add(message.chat_id));
      addNotif({
        title: 'New message',
        body: message.message_type === 'image' ? '📷 Sent you a photo' : message.content,
        icon: '💬',
        chatId: message.chat_id,
      });
      setToast({
        title: 'New message',
        message: message.message_type === 'image' ? '📷 Sent you a photo' : message.content,
        icon: '💬',
        onPress: () => openChatById(message.chat_id),
      });
    });
    const offMatch = realtime.on('match_created', evt => {
      qc.invalidateQueries({ queryKey: MATCHES_KEY });
      qc.invalidateQueries({ queryKey: CHATS_KEY });
      // The person who liked second sees the overlay from the swipe response;
      // the other person gets this toast.
      addNotif({ title: 'New match 💜', body: 'You’ve got a new match. Say hi first!', icon: '✨', chatId: evt.chat?.id });
      if (!deck.lastMatch) {
        setToast({
          title: 'You’ve got a new match! 💜',
          message: 'Say hi first?',
          icon: '✨',
          onPress: () => openChatById(evt.chat?.id),
        });
      }
    });
    return () => {
      offMsg();
      offMatch();
    };
  }, [qc, me.user_id, deck.lastMatch, addNotif, openChatById]);

  // Register this device for push (background / closed-app notifications).
  // getFCMToken() returns null until the native Firebase module is built in.
  useEffect(() => {
    const reg = (t: string | null) => {
      if (t) devicesApi.register(t);
    };
    getFCMToken().then(reg);
    return onTokenRefresh(reg);
  }, [me.user_id]);

  // Tapping a push (app in background, or launched from it) opens that chat.
  useEffect(() => onNotificationOpened(data => openChatById(data?.chat_id as string | undefined)), [openChatById]);

  // Pushes received while the app is open → inbox
  useEffect(
    () =>
      onForegroundMessage(p => {
        const type = p.data?.type;
        addNotif({
          title: p.title,
          body: p.body,
          icon: type === 'match' ? '✨' : type === 'like' ? '💜' : '💬',
          chatId: p.data?.chat_id,
          avatarUrl: p.data?.avatar_url,
        });
      }),
    [addNotif],
  );

  useEffect(() => () => realtime.disconnect(), []);

  // On open / resume: make sure location permission is granted and device GPS is on
  // (prompts for permission, then shows the native "turn on location" dialog).
  useEffect(() => {
    let busy = false;
    const check = async () => {
      if (busy) return;
      busy = true;
      await ensureLocationReady();
      busy = false;
    };
    check();
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') check();
    });
    return () => sub.remove();
  }, []);

  if (openChat) {
    return <ChatThreadScreen chat={openChat} onBack={() => setOpenChat(null)} />;
  }
  if (assistantOpen) {
    return <AssistantChatScreen onBack={() => setAssistantOpen(false)} />;
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <NotificationToast toast={toast} onDismiss={() => setToast(null)} />
        <View style={styles.flex}>
          {tab === 'home' && <HomeScreen />}
          {tab === 'chats' && <ChatsScreen unread={unread} onOpen={open} onOpenAssistant={() => setAssistantOpen(true)} />}
          {tab === 'profile' && <MyProfileScreen />}
        </View>
        <TabBar active={tab} onSelect={setTab} unreadChats={unread.size} />
      </SafeAreaView>

      <NotificationsSheet
        visible={notif.sheetOpen}
        onClose={() => notif.setSheetOpen(false)}
        onOpenChats={() => setTab('chats')}
        onOpenChat={chatId => openChatById(chatId)}
      />

      <MatchOverlay
        match={deck.lastMatch}
        onClose={deck.clearMatch}
        onMessage={m => {
          deck.clearMatch();
          if (m.chatId) {
            open({
              chatId: m.chatId,
              matchId: m.matchId,
              userId: m.candidate.user_id,
              name: m.candidate.full_name,
              photo: m.candidate.photos[0]?.photo_url ?? null,
            });
          }
        }}
      />
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { ...Typography.title, color: Colors.ink, marginTop: 12, paddingHorizontal: 20 },
});
