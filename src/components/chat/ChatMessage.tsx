import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '../../theme/colors';

export interface ChatMessageProps {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp?: string;
  status?: 'sent' | 'delivered' | 'read';
}

export const ChatMessageComponent: React.FC<ChatMessageProps> = ({
  text,
  sender,
  timestamp,
  status,
}) => {
  const isMe = sender === 'me';

  return (
    <Animated.View
      entering={FadeInDown.duration(200).springify().damping(12)}
      style={[
        styles.container,
        isMe ? styles.myMessageContainer : styles.otherMessageContainer,
      ]}
    >
      <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
        <Text style={[styles.text, isMe ? styles.myText : styles.otherText]}>
          {text}
        </Text>
        <View style={styles.footer}>
          {timestamp && (
            <Text style={[styles.timestamp, isMe ? styles.myTimestamp : styles.otherTimestamp]}>
              {timestamp}
            </Text>
          )}
          {isMe && status && (
            <Text style={styles.statusTick}>
              {status === 'sent' ? '✓' : status === 'delivered' ? '✓✓' : '✓✓'}
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

// Wrapped in React.memo to ensure already-rendered messages never re-animate on FlatList re-renders
export const ChatMessage = React.memo(ChatMessageComponent);

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 12,
    flexDirection: 'row',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  myBubble: {
    backgroundColor: Colors.magenta,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  myText: {
    color: '#FFFFFF',
  },
  otherText: {
    color: Colors.plum,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  timestamp: {
    fontSize: 10,
  },
  myTimestamp: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  otherTimestamp: {
    color: Colors.plum,
    opacity: 0.5,
  },
  statusTick: {
    fontSize: 11,
    color: '#FFFFFF',
    marginLeft: 2,
  },
});
