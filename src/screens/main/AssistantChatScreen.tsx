import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
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
import { ArrowLeft, GradientBackground, IconButton, Markdown, More, Send, Sparkle, useConfirmDialog } from '../../ui';
import { useKeyboardPadding } from '../../ui/useKeyboardPadding';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const { pad, onContainerLayout } = useKeyboardPadding();
  const insets = useSafeAreaInsets();
  const composerPadBottom = pad > 0 ? pad + 4 : insets.bottom + 4;

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
          {mine ? (
            <Text style={[styles.text, styles.textMine]} selectable>
              {item.content}
            </Text>
          ) : (
            <Markdown text={item.content} color={Colors.ink} />
          )}
        </View>
      </View>
    );
  };

  return (
    <>
    <GradientBackground variant="soft">
      <SafeAreaView style={styles.flex} edges={['top']}>
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

        <View style={styles.flex} onLayout={onContainerLayout}>
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

          {/* Suggestion pills — only shown when the conversation is empty */}
          {!history.isLoading && messages.length === 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
              keyboardShouldPersistTaps="handled"
            >
              {SUGGESTIONS.map(s => {
                const off = sending;
                return (
                  <Pressable
                    key={s}
                    onPress={() => send(s)}
                    disabled={off}
                    accessibilityRole="button"
                    accessibilityLabel={`Suggestion: ${s}`}
                    accessibilityState={{ disabled: off }}
                    style={({ pressed }) => [styles.chip, off && styles.chipOff, pressed && !off && styles.pressed]}
                  >
                    <Text style={styles.chipText} numberOfLines={1}>
                      {s}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : null}

          {error ? (
            <View style={styles.errBarWrap}>
              <Text style={styles.errBar}>{error}</Text>
            </View>
          ) : null}
          {/* 4 px gap between composer and keyboard / home indicator */}
          <View style={[styles.composer, { paddingBottom: composerPadBottom }]}>
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
  chips: { gap: 8, paddingHorizontal: 12, paddingTop: 4, paddingBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primarySoft,
    maxWidth: 220,
  },
  chipOff: { opacity: 0.5 },
  chipText: { ...Typography.label, color: Colors.primaryDeep, lineHeight: 18 },
  pressed: { opacity: 0.7 },
  err: { ...Typography.body, color: Colors.danger, textAlign: 'center' },
  retry: { ...Typography.label, color: Colors.primary, marginTop: 12 },
  errBarWrap: { marginHorizontal: 12, marginBottom: 4, borderRadius: 10, backgroundColor: 'rgba(220,53,69,0.08)', paddingHorizontal: 12, paddingVertical: 6 },
  errBar: { ...Typography.caption, color: Colors.danger, textAlign: 'center' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8 },
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
