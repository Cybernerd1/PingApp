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
import { profileApi } from '../../api/profile';
import { unwrap } from '../../api/client';
import { ChatConversation, DiscoverCandidate, MatchItem, UserProfile } from '../../api/types';
import { NotificationsProvider, useNotifications } from '../../notifications/NotificationsContext';
import { NotificationsSheet } from './NotificationsSheet';
import { realtime } from '../../realtime/socket';
import { useSession } from '../../session/SessionContext';
import { NotificationToast, ToastConfig } from '../../ui/NotificationToast';
import { DeckProvider, MatchEvent, useDeck } from './DeckContext';
import { HomeScreen } from './HomeScreen';
import { CHATS_KEY, ChatsScreen, MATCHES_KEY, OpenChat } from './ChatsScreen';
import { ChatThreadScreen } from './ChatThreadScreen';
import { AssistantChatScreen } from './AssistantChatScreen';
import { MyProfileScreen } from './profile/MyProfileScreen';
import { MatchOverlay } from './MatchOverlay';
import { ProfileSheet } from './ProfileSheet';
import { MainTab, TabBar } from './TabBar';

/** Authenticated app: tabs + chat thread + realtime wiring. */
export const MainShell: React.FC<{ welcomeToast?: ToastConfig | null }> = ({ welcomeToast }) => (
  <DeckProvider>
    <NotificationsProvider>
      <ShellInner welcomeToast={welcomeToast ?? null} />
    </NotificationsProvider>
  </DeckProvider>
);

/** Main photo URL of a profile (order 0 / is_profile_picture). */
function photoOf(p?: Pick<UserProfile, 'photos'> | null): string | null {
  const photos = [...(p?.photos ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return (photos.find(ph => ph.is_profile_picture) ?? photos[0])?.photo_url ?? null;
}

/** Turn a fetched profile into a discover candidate for the match overlay. */
function userToCandidate(p: UserProfile): DiscoverCandidate {
  return {
    user_id: p.user_id,
    full_name: p.full_name,
    age: p.age ?? null,
    gender: p.gender ?? null,
    bio: p.bio ?? null,
    distance_km: null,
    interests: p.interests ?? [],
    photos: (p.photos ?? []).map(ph => ({ photo_id: ph.photo_id, photo_url: ph.photo_url })),
  };
}

type UserCard = { name: string | null; photo: string | null };

const ShellInner: React.FC<{ welcomeToast: ToastConfig | null }> = ({ welcomeToast }) => {
  const { me } = useSession();
  const qc = useQueryClient();
  const deck = useDeck();
  const notif = useNotifications();
  const addNotif = notif.add;
  const [tab, setTab] = useState<MainTab>('home');
  // Keep each tab mounted after its first visit: hidden (display:none) instead
  // of unmounted, so switching tabs never re-mounts screens or re-triggers
  // their queries. Panes render inside a flex:1 container; hidden panes use
  // display:'none' so only the active one occupies layout.
  const [visited, setVisited] = useState<Record<MainTab, boolean>>({ home: true, chats: false, profile: false });
  const selectTab = useCallback((t: MainTab) => {
    setVisited(prev => (prev[t] ? prev : { ...prev, [t]: true }));
    setTab(t);
  }, []);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [openChat, setOpenChat] = useState<OpenChat | null>(null);
  const [unread, setUnread] = useState<Map<string, number>>(new Map());
  // Only show the onboarding-complete toast, NOT the welcome-back login toast.
  const [toast, setToast] = useState<ToastConfig | null>(
    welcomeToast && !welcomeToast.message?.includes('meet some amazing people') ? welcomeToast : null,
  );
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [remoteMatch, setRemoteMatch] = useState<MatchEvent | null>(null);
  const openChatRef = useRef<OpenChat | null>(null);
  openChatRef.current = openChat;
  const remoteMatchRef = useRef<MatchEvent | null>(null);
  /** Sender name/avatar cache so toasts can show who's pinging. */
  const userCards = useRef(new Map<string, UserCard>());

  const describeUser = useCallback(
    async (userId: string): Promise<UserCard> => {
      const cached = userCards.current.get(userId);
      if (cached) return cached;
      // The chats list usually already has this user's name + photo.
      const chats = qc.getQueryData<ChatConversation[]>(CHATS_KEY);
      const c = chats?.find(x => x.matched_user_id === userId);
      if (c) {
        const card: UserCard = { name: c.matched_user_name, photo: c.matched_user_photo_url ?? null };
        userCards.current.set(userId, card);
        return card;
      }
      try {
        const res = await profileApi.getUserProfileById(userId);
        if (res.status === 'success') {
          const card: UserCard = { name: res.data.full_name, photo: photoOf(res.data) };
          userCards.current.set(userId, card);
          return card;
        }
      } catch {
        // fall through to anonymous
      }
      return { name: null, photo: null };
    },
    [qc],
  );

  const open = useCallback((c: OpenChat) => {
    setUnread(prev => {
      const n = new Map(prev);
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

  /**
   * Open a conversation from a MatchItem (from Matches screen / ProfileSheet chat button).
   * Looks up the chat_id from the cached chats list or the match itself.
   */
  const openChatByMatch = useCallback(
    async (match: MatchItem) => {
      setTab('chats');
      // Try the local chats cache first (instant — avoids a network round-trip)
      const chats = qc.getQueryData<ChatConversation[]>(CHATS_KEY);
      const cached = chats?.find(x => x.matched_user_id === match.matched_user.user_id);
      const resolvedChatId = cached?.chat_id ?? match.chat_id;
      if (resolvedChatId) {
        open({
          chatId: resolvedChatId,
          matchId: match.match_id,
          userId: match.matched_user.user_id,
          name: match.matched_user.full_name,
          photo: match.matched_user.profile_picture?.photo_url ?? null,
        });
      } else {
        // No chat started yet — fall back to id-based lookup which handles this case
        openChatById(resolvedChatId ?? undefined);
      }
    },
    [qc, open, openChatById],
  );

  /** Open the profile of whoever is on the other side of a chat/match id. */
  const openProfileByChatId = useCallback(
    async (chatId?: string | null) => {
      if (!chatId) return;
      try {
        const chats = await qc.fetchQuery({
          queryKey: CHATS_KEY,
          queryFn: async () => unwrap(await chatsApi.getChats(50, 0)),
          staleTime: 0,
        });
        const c = chats.find(x => x.chat_id === chatId);
        if (c) {
          setProfileUserId(c.matched_user_id);
          return;
        }
        const ms = await qc.fetchQuery({
          queryKey: MATCHES_KEY,
          queryFn: async () => unwrap(await matchesApi.getMatches()).matches,
          staleTime: 0,
        });
        const m = ms.find(x => x.chat_id === chatId);
        if (m) setProfileUserId(m.matched_user.user_id);
      } catch {
        // nothing to open
      }
    },
    [qc],
  );

  // Realtime: connect once, surface new messages / matches anywhere in the app.
  useEffect(() => {
    realtime.connect();
    const offMsg = realtime.on('new_message', ({ message }) => {
      qc.invalidateQueries({ queryKey: CHATS_KEY });
      qc.invalidateQueries({ queryKey: MATCHES_KEY });
      if (message.sender_id === me.user_id || openChatRef.current?.chatId === message.chat_id) return;
      setUnread(prev => {
        const n = new Map(prev);
        n.set(message.chat_id, (n.get(message.chat_id) ?? 0) + 1);
        return n;
      });
      const body = message.message_type === 'image' ? '📷 Sent you a photo' : message.content;
      // Surface who sent it — name + photo — in both the inbox and the toast.
      describeUser(message.sender_id).then(({ name, photo }) => {
        addNotif({
          title: name ? `${name} sent a message` : 'New message',
          body,
          icon: '💬',
          chatId: message.chat_id,
          userId: message.sender_id,
          kind: 'message',
          avatarUrl: photo ?? undefined,
        });
        setToast({
          title: name ?? 'New message',
          message: body,
          icon: '💬',
          avatarUrl: photo ?? undefined,
          onPress: () => openChatById(message.chat_id),
        });
      });
    });
    const offMatch = realtime.on('match_created', evt => {
      qc.invalidateQueries({ queryKey: MATCHES_KEY });
      qc.invalidateQueries({ queryKey: CHATS_KEY });
      describeUser(evt.matched_user_id).then(({ name, photo }) => {
        addNotif({
          title: 'New match 💜',
          body: 'You’ve got a new match. Say hi first!',
          icon: '✨',
          chatId: evt.chat?.id,
          userId: evt.matched_user_id,
          kind: 'match',
          avatarUrl: photo ?? undefined,
        });
        // The person who liked second sees the overlay from the swipe response;
        // the other person gets the same match screen here. If an overlay is
        // already up, fall back to a toast that opens the new match's profile.
        if (!deck.lastMatch && !remoteMatchRef.current) {
          profileApi
            .getUserProfileById(evt.matched_user_id)
            .then(res => {
              if (res.status !== 'success') return;
              remoteMatchRef.current = {
                candidate: userToCandidate(res.data),
                chatId: evt.chat?.id ?? null,
                matchId: evt.match?.id ?? null,
              };
              setRemoteMatch(remoteMatchRef.current);
            })
            .catch(() => {});
        } else {
          setToast({
            title: `You matched with ${name?.split(' ')[0] ?? 'someone'}! 💜`,
            message: 'Tap to view their profile',
            icon: '✨',
            avatarUrl: photo ?? undefined,
            onPress: () => setProfileUserId(evt.matched_user_id),
          });
        }
      });
    });
    return () => {
      offMsg();
      offMatch();
    };
  }, [qc, me.user_id, deck.lastMatch, addNotif, openChatById, describeUser]);

  // Register this device for push (background / closed-app notifications).
  // getFCMToken() returns null until the native Firebase module is built in.
  useEffect(() => {
    const reg = (t: string | null) => {
      if (t) devicesApi.register(t);
    };
    getFCMToken().then(reg);
    return onTokenRefresh(reg);
  }, [me.user_id]);

  // Tapping a push (app in background, or launched from it) — match/like pushes
  // open the sender's profile, message pushes open the chat.
  useEffect(
    () =>
      onNotificationOpened(data => {
        if (data?.type === 'match' || data?.type === 'like') openProfileByChatId(data?.chat_id as string | undefined);
        else openChatById(data?.chat_id as string | undefined);
      }),
    [openChatById, openProfileByChatId],
  );

  // Pushes received while the app is open → inbox (the socket events already
  // fire the live toast/overlay; this only records the notification).
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
          kind: type === 'match' ? 'match' : type === 'like' ? 'like' : 'message',
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
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.flex}>
          {visited.home && (
            <View style={tab === 'home' ? styles.pane : styles.paneHidden}>
              <HomeScreen />
            </View>
          )}
          {visited.chats && (
            <View style={tab === 'chats' ? styles.pane : styles.paneHidden}>
              <ChatsScreen unread={unread} onOpen={open} onOpenAssistant={() => setAssistantOpen(true)} />
            </View>
          )}
          {visited.profile && (
            <View style={tab === 'profile' ? styles.pane : styles.paneHidden}>
              <MyProfileScreen onOpenChat={openChatByMatch} />
            </View>
          )}
        </View>
        <TabBar active={tab} onSelect={selectTab} unreadChats={Array.from(unread.values()).reduce((a, b) => a + b, 0)} />
      </SafeAreaView>

      {/* Toast is rendered outside SafeAreaView so it can slide in from the very top */}
      <NotificationToast toast={toast} onDismiss={() => setToast(null)} />

      <NotificationsSheet
        visible={notif.sheetOpen}
        onClose={() => notif.setSheetOpen(false)}
        onOpenChats={() => setTab('chats')}
        onOpenChat={chatId => openChatById(chatId)}
        onOpenProfile={userId => setProfileUserId(userId)}
      />

      <MatchOverlay
        match={deck.lastMatch ?? remoteMatch}
        onClose={() => {
          deck.clearMatch();
          remoteMatchRef.current = null;
          setRemoteMatch(null);
        }}
        onMessage={m => {
          deck.clearMatch();
          remoteMatchRef.current = null;
          setRemoteMatch(null);
          if (m.chatId) {
            open({
              chatId: m.chatId,
              matchId: m.matchId,
              userId: m.candidate.user_id,
              name: m.candidate.full_name,
              photo: m.candidate.photos[0]?.photo_url ?? null,
            });
          } else {
            setProfileUserId(m.candidate.user_id);
          }
        }}
      />

      {/* Other user's profile — opened from match/like notifications. */}
      <ProfileSheet
        visible={!!profileUserId}
        userId={profileUserId}
        onClose={() => setProfileUserId(null)}
        onOpenChat={match => openChatByMatch(match)}
      />
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pane: { flex: 1 },
  paneHidden: { display: 'none' },
  title: { ...Typography.title, color: Colors.ink, marginTop: 12, paddingHorizontal: 20 },
});
