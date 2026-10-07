import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Keyboard,
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../theme/colors';
import { Radius, Typography } from '../../theme/typography';
import { ArrowLeft, GradientBackground, IconButton, More, Send, Sparkle, useConfirmDialog } from '../../ui';
import { assistantApi } from '../../api/assistant';
import { unwrap } from '../../api/client';
import { AssistantHistory, AssistantMessage } from '../../api/types';
import { useSession } from '../../session/SessionContext';

const MAX_LEN = 1000;
export const ASSISTANT_KEY = ['assistant'];

const SUGGESTIONS = [
  'Help me write my bio',
  'Give me 3 opening lines',
  'First date ideas',
  'How do I stay safe meeting someone?',
  'How do I get more matches?',
];

/** Round purple badge used for the assistant's avatar. */
export const AssistantAvatar: React.FC<{ size?: number }> = ({ size = 42 }) => (
  <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
    <Sparkle size={size * 0.5} color={Colors.white} />
  </View>
);

/** Ping Assistant — a helper bot chat (GET/POST/DELETE /assistant/messages). */
export const AssistantChatScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { me } = useSession();
  const qc = useQueryClient();
  const listRef = useRef<FlatList<AssistantMessage>>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [pending, setPending] = useState<AssistantMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { dialog, showDialog } = useConfirmDialog();

  // Lift the composer above the keyboard. If the OS already resized the window
  // (adjustResize), our container shrinks and no extra padding is needed.
  const [kbPad, setKbPad] = useState(0);
  const baseHeight = useRef(0);
  const kbOpen = useRef(false);
  const containerHeight = useRef(0);
  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const s = Keyboard.addListener(showEvt, e => {
      kbOpen.current = true;
      const kb = e.endCoordinates.height;
      if (Platform.OS === 'ios') return setKbPad(kb);
      setTimeout(() => {
        const shrunk = baseHeight.current - containerHeight.current;
        setKbPad(shrunk > kb * 0.5 ? 0 : kb);
      }, 120);
    });
    const h = Keyboard.addListener(hideEvt, () => {
      kbOpen.current = false;
      setKbPad(0);
    });
    return () => {
      s.remove();
      h.remove();
    };
  }, []);
  const onContainerLayout = (e: LayoutChangeEvent) => {
    containerHeight.current = e.nativeEvent.layout.height;
    if (!kbOpen.current) baseHeight.current = containerHeight.current;
  };

  const history = useQuery({
    queryKey: ASSISTANT_KEY,
    queryFn: async () => unwrap(await assistantApi.getMessages(100)),
  });

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  const messages = useMemo(
    () => [...(history.data?.messages ?? []), ...(pending ? [pending] : [])],
    [history.data, pending],
  );

  const scrollToEnd = useCallback(() => requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true })), []);
  useEffect(() => {
    scrollToEnd();
  }, [messages.length, sending, scrollToEnd]);

  const send = async (raw = text) => {
    const content = raw.trim();
    if (!content || sending) return;
    setError(null);
    setText('');
    setSending(true);
    setPending({ id: `local-${Date.now()}`, role: 'user', content, created_at: new Date().toISOString(), pending: true });

    const res = await assistantApi.send(content);
    setSending(false);
    setPending(null);
    if (res.status === 'error') {
      setText(content); // give it back so they can retry
      setError(res.httpStatus === 404 ? 'Lily isn’t on this server yet — deploy the latest backend.' : res.message);
      return;
    }
    qc.setQueryData<AssistantHistory>(ASSISTANT_KEY, old => ({
      ai_enabled: res.data.source === 'openrouter' || !!old?.ai_enabled,
      messages: [...(old?.messages ?? []), res.data.message, res.data.reply],
    }));
  };

  const clear = () =>
    showDialog({
      title: 'Clear chat?',
      message: 'This deletes your conversation with Lily.',
      buttons: [
        { label: 'Cancel', variant: 'cancel', onPress: () => {} },
        {
          label: 'Clear',
          variant: 'destructive',
          onPress: async () => {
            const res = await assistantApi.clear();
            if (res.status === 'error') return setError(res.message);
            qc.setQueryData<AssistantHistory>(ASSISTANT_KEY, old => ({ ai_enabled: !!old?.ai_enabled, messages: [] }));
          },
        },
      ],
    });

  const firstName = me.full_name?.split(' ')[0];

  const renderItem = ({ item }: { item: AssistantMessage }) => {
    const mine = item.role === 'user';
    return (
      <View style={[styles.bubbleRow, mine ? styles.right : styles.left]}>
        {!mine ? <AssistantAvatar size={28} /> : null}
        <View style={[styles.bubble, mine ? styles.mine : styles.theirs, item.pending && styles.pendingBubble]}>
          <Text style={[styles.text, mine && styles.textMine]} selectable>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <>
    <GradientBackground variant="soft">
      <SafeAreaView style={styles.flex} edges={['top', kbPad ? 'left' : 'bottom']}>
        <View style={styles.header}>
          <IconButton accessibilityLabel="Back to chats" onPress={onBack} variant="white">
            <ArrowLeft />
          </IconButton>
          <View style={styles.who}>
            <AssistantAvatar />
            <View style={styles.flex}>
              <Text style={styles.whoName}>Lily</Text>
              <Text style={styles.whoSub}>{sending ? 'typing…' : 'Your dating sidekick'}</Text>
            </View>
          </View>
          <IconButton accessibilityLabel="Clear chat" onPress={clear} variant="white" disabled={!history.data?.messages.length}>
            <More />
          </IconButton>
        </View>

        <View style={[styles.flex, { paddingBottom: kbPad }]} onLayout={onContainerLayout}>
          {history.isLoading ? (
            <ActivityIndicator style={styles.flex} color={Colors.primary} />
          ) : history.isError ? (
            <View style={[styles.flex, styles.center]}>
              <Text style={styles.err}>{(history.error as Error).message}</Text>
              <Pressable onPress={() => history.refetch()} hitSlop={8}>
                <Text style={styles.retry}>Try again</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={m => m.id}
              renderItem={renderItem}
              contentContainerStyle={styles.list}
              onContentSizeChange={scrollToEnd}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={
                <View style={styles.intro}>
                  <AssistantAvatar size={72} />
                  <Text style={styles.introTitle}>Hi{firstName ? ` ${firstName}` : ''}! I’m Lily</Text>
                  <Text style={styles.introSub}>
                    Ask me for bio help, opening lines, replies to your matches, date ideas or safety tips.
                  </Text>
                </View>
              }
              ListFooterComponent={
                sending ? (
                  <View style={[styles.bubbleRow, styles.left]}>
                    <AssistantAvatar size={28} />
                    <View style={[styles.bubble, styles.theirs]}>
                      <ActivityIndicator size="small" color={Colors.primary} />
                    </View>
                  </View>
                ) : undefined
              }
            />
          )}

          {!messages.length && !history.isLoading ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
              keyboardShouldPersistTaps="handled"
            >
              {SUGGESTIONS.map(s => (
                <Pressable key={s} onPress={() => send(s)} style={({ pressed }) => [styles.chip, pressed && styles.pressed]}>
                  <Text style={styles.chipText}>{s}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}

          {error ? <Text style={styles.errBar}>{error}</Text> : null}
          <View style={styles.composer}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={v => setText(v.slice(0, MAX_LEN))}
              placeholder="Ask Lily…"
              placeholderTextColor={Colors.faint}
              multiline
              maxLength={MAX_LEN}
              accessibilityLabel="Message Lily"
            />
            <IconButton accessibilityLabel="Send" onPress={() => send()} disabled={!text.trim() || sending} variant="primary" size={44}>
              <Send size={18} />
            </IconButton>
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
    {dialog}
  </>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  avatar: { backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 8 },
  who: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  whoName: { ...Typography.bodyStrong, color: Colors.ink },
  whoSub: { ...Typography.caption, color: Colors.mute },
  list: { paddingHorizontal: 16, paddingVertical: 12, flexGrow: 1 },
  intro: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 12 },
  introTitle: { ...Typography.heading, color: Colors.ink, marginTop: 14, textAlign: 'center' },
  introSub: { ...Typography.body, color: Colors.mute, marginTop: 6, textAlign: 'center' },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginVertical: 4 },
  left: { justifyContent: 'flex-start' },
  right: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  mine: { backgroundColor: Colors.primary, borderBottomRightRadius: 6 },
  theirs: { backgroundColor: Colors.white, borderBottomLeftRadius: 6 },
  pendingBubble: { opacity: 0.6 },
  text: { ...Typography.body, color: Colors.ink },
  textMine: { color: Colors.white },
  chips: { gap: 8, paddingHorizontal: 12, paddingBottom: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primarySoft,
  },
  chipText: { ...Typography.label, color: Colors.primaryDeep },
  pressed: { opacity: 0.7 },
  err: { ...Typography.body, color: Colors.danger, textAlign: 'center' },
  retry: { ...Typography.label, color: Colors.primary, marginTop: 12 },
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
