import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Typography, Radius } from '../theme/typography';
import { ConfirmDialog } from '../components/modals/ConfirmDialog';

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isUser: boolean;
}

export interface MatchConversation {
  id: string;
  candidateId: string;
  username: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  messages: ChatMessage[];
}

const DUMMY_CONVERSATIONS: MatchConversation[] = [
  {
    id: 'conv_1',
    candidateId: 'cand_1',
    username: 'Sophia',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    lastMessage: 'I know this amazing hidden espresso bar near Mission!',
    time: '2m ago',
    unread: true,
    messages: [
      {
        id: 'm1',
        senderId: 'cand_1',
        text: 'Hey! Loved your design prompt 🎨',
        timestamp: '10:14 AM',
        isUser: false,
      },
      {
        id: 'm2',
        senderId: 'user',
        text: 'Thanks Sophia! Big fan of your pottery work as well 🏺',
        timestamp: '10:16 AM',
        isUser: true,
      },
      {
        id: 'm3',
        senderId: 'cand_1',
        text: 'I know this amazing hidden espresso bar near Mission! We should grab coffee this weekend ☕',
        timestamp: '10:18 AM',
        isUser: false,
      },
    ],
  },
  {
    id: 'conv_2',
    candidateId: 'cand_2',
    username: 'Liam',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    lastMessage: 'Let us make a collaborative Spotify playlist 🎸',
    time: '1h ago',
    unread: false,
    messages: [
      {
        id: 'm1',
        senderId: 'cand_2',
        text: 'Hey there! What indie rock bands are you listening to right now?',
        timestamp: '9:05 AM',
        isUser: false,
      },
      {
        id: 'm2',
        senderId: 'user',
        text: 'Lately listening to Fred again.. and The 1975!',
        timestamp: '9:20 AM',
        isUser: true,
      },
      {
        id: 'm3',
        senderId: 'cand_2',
        text: 'Awesome tastes! Let us make a collaborative Spotify playlist 🎸',
        timestamp: '9:25 AM',
        isUser: false,
      },
    ],
  },
  {
    id: 'conv_3',
    candidateId: 'cand_3',
    username: 'Maya',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    lastMessage: 'You matched with Maya! Send a Ping ✨',
    time: 'Yesterday',
    unread: false,
    messages: [
      {
        id: 'm1',
        senderId: 'cand_3',
        text: 'Hi! Great meeting you on Ping 🌿',
        timestamp: 'Yesterday',
        isUser: false,
      },
    ],
  },
];

export const ChatScreen: React.FC = () => {
  const [conversations, setConversations] = useState<MatchConversation[]>(DUMMY_CONVERSATIONS);
  const [activeConv, setActiveConv] = useState<MatchConversation | null>(null);
  const [inputText, setInputText] = useState('');
  const [unmatchTarget, setUnmatchTarget] = useState<MatchConversation | null>(null);

  const handleSendMessage = () => {
    if (!inputText.trim() || !activeConv) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'user',
      text: inputText.trim(),
      timestamp: 'Just now',
      isUser: true,
    };

    const updatedConv = {
      ...activeConv,
      lastMessage: inputText.trim(),
      time: 'Just now',
      messages: [...activeConv.messages, newMsg],
    };

    setActiveConv(updatedConv);
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConv.id ? updatedConv : c))
    );
    setInputText('');

    // Simulate dummy reply after 1.5s
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: `msg_reply_${Date.now()}`,
        senderId: activeConv.candidateId,
        text: `That sounds fantastic! Can't wait ✨😊`,
        timestamp: 'Just now',
        isUser: false,
      };

      setActiveConv((curr) => {
        if (curr && curr.id === activeConv.id) {
          const withReply = {
            ...curr,
            lastMessage: replyMsg.text,
            messages: [...curr.messages, replyMsg],
          };
          return withReply;
        }
        return curr;
      });
    }, 1500);
  };

  const handleConfirmUnmatch = () => {
    if (unmatchTarget) {
      setConversations((prev) => prev.filter((c) => c.id !== unmatchTarget.id));
      if (activeConv?.id === unmatchTarget.id) {
        setActiveConv(null);
      }
    }
    setUnmatchTarget(null);
  };

  if (activeConv) {
    return (
      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Chat Active Header */}
          <View style={styles.chatHeader}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveConv(null)}
              style={styles.backBtn}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>

            <Image source={{ uri: activeConv.avatar }} style={styles.headerAvatar} />

            <View style={styles.headerMeta}>
              <Text style={styles.headerName}>{activeConv.username}</Text>
              <Text style={styles.headerStatus}>Online now</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setUnmatchTarget(activeConv)}
              style={styles.unmatchBtn}
            >
              <Text style={styles.unmatchIcon}>⋮</Text>
            </TouchableOpacity>
          </View>

          {/* Messages List */}
          <FlatList
            data={activeConv.messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesPadding}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageBubble,
                  item.isUser ? styles.userBubble : styles.matchBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    item.isUser ? styles.userMessageText : styles.matchMessageText,
                  ]}
                >
                  {item.text}
                </Text>
                <Text
                  style={[
                    styles.timeText,
                    item.isUser ? styles.userTimeText : styles.matchTimeText,
                  ]}
                >
                  {item.timestamp}
                </Text>
              </View>
            )}
          />

          {/* Message Input Bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              placeholder={`Message ${activeConv.username}...`}
              placeholderTextColor={Colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSendMessage}
              style={[
                styles.sendBtn,
                !inputText.trim() && styles.sendBtnDisabled,
              ]}
            >
              <Text style={styles.sendIcon}>➔</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Custom Unmatch Confirm Box */}
        <ConfirmDialog
          visible={!!unmatchTarget}
          title={`Unmatch ${unmatchTarget?.username}?`}
          message="Are you sure you want to unmatch? This chat history will be permanently cleared."
          icon="💔"
          confirmText="Unmatch"
          cancelText="Cancel"
          isDanger
          onConfirm={handleConfirmUnmatch}
          onCancel={() => setUnmatchTarget(null)}
        />
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Matches Horizontal Ribbon */}
      <View style={styles.matchesRibbon}>
        <Text style={styles.sectionTitle}>New Matches ({conversations.length})</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={conversations}
          keyExtractor={(item) => `ribbon_${item.id}`}
          contentContainerStyle={styles.ribbonPadding}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveConv(item)}
              style={styles.matchAvatarItem}
            >
              <Image source={{ uri: item.avatar }} style={styles.ribbonAvatar} />
              <Text style={styles.ribbonName}>{item.username}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Conversations List */}
      <Text style={[styles.sectionTitle, { paddingHorizontal: 20, marginTop: 16 }]}>
        Conversations
      </Text>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.convListPadding}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveConv(item)}
            style={[styles.convCard, item.unread && styles.convCardUnread]}
          >
            <Image source={{ uri: item.avatar }} style={styles.convAvatar} />
            <View style={styles.convMeta}>
              <View style={styles.convTopRow}>
                <Text style={styles.convName}>{item.username}</Text>
                <Text style={styles.convTime}>{item.time}</Text>
              </View>
              <Text style={styles.convLastMsg} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  matchesRibbon: {
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    ...Typography.heading,
    fontSize: 16,
    color: Colors.plum,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  ribbonPadding: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 16,
  },
  matchAvatarItem: {
    alignItems: 'center',
    gap: 6,
  },
  ribbonAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.magenta,
  },
  ribbonName: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.plum,
    fontWeight: '600',
  },
  convListPadding: {
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 12,
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  convCardUnread: {
    backgroundColor: '#FFF9FB',
    borderColor: 'rgba(232, 68, 122, 0.2)',
  },
  convAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  convMeta: {
    flex: 1,
    marginLeft: 14,
  },
  convTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  convName: {
    ...Typography.heading,
    fontSize: 16,
    color: Colors.plum,
  },
  convTime: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textMuted,
  },
  convLastMsg: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textMuted,
  },
  chatHeader: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: Colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  backBtn: {
    paddingRight: 12,
  },
  backIcon: {
    fontSize: 22,
    color: Colors.plum,
    fontWeight: '800',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerMeta: {
    flex: 1,
    marginLeft: 12,
  },
  headerName: {
    ...Typography.heading,
    fontSize: 16,
    color: Colors.plum,
  },
  headerStatus: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.magenta,
    fontWeight: '600',
  },
  unmatchBtn: {
    padding: 8,
  },
  unmatchIcon: {
    fontSize: 22,
    color: Colors.plum,
  },
  messagesPadding: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '78%',
    padding: 14,
    borderRadius: 18,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.magenta,
    borderBottomRightRadius: 4,
  },
  matchBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  messageText: {
    ...Typography.body,
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: Colors.white,
  },
  matchMessageText: {
    color: Colors.plum,
  },
  timeText: {
    ...Typography.caption,
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTimeText: {
    color: 'rgba(255,255,255,0.7)',
  },
  matchTimeText: {
    color: Colors.textMuted,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    gap: 10,
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.cream,
    borderRadius: 22,
    paddingHorizontal: 18,
    fontSize: 15,
    color: Colors.plum,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.magenta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: 'rgba(232, 68, 122, 0.4)',
  },
  sendIcon: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '800',
  },
});
