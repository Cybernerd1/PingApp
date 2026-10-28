import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Colors } from '../theme/colors';
import { Typography, Radius } from '../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface ToastConfig {
  id?: string;
  title: string;
  message: string;
  avatarUrl?: string;
  icon?: string;
  onPress?: () => void;
  durationMs?: number;
}

interface NotificationToastProps {
  toast: ToastConfig | null;
  onDismiss: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  toast,
  onDismiss,
}) => {
  const insets = useSafeAreaInsets();
  // Start fully above the visible screen.
  const translateY = useSharedValue(-140);

  const dismissToast = () => {
    translateY.value = withTiming(-140, { duration: 220 }, finished => {
      'worklet';
      if (finished && onDismiss) runOnJS(onDismiss)();
    });
  };

  useEffect(() => {
    if (toast) {
      // Slide in so the card sits 8 px below the safe-area top (status bar / notch).
      translateY.value = withSpring(insets.top + 8, {
        damping: 14,
        stiffness: 160,
      });
      const timer = setTimeout(() => dismissToast(), toast.durationMs ?? 4500);
      return () => clearTimeout(timer);
    } else {
      translateY.value = withTiming(-140, { duration: 250 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast, insets.top]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!toast) return null;

  return (
    <Animated.View style={[styles.toastCard, animatedStyle]} pointerEvents="box-none">
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          if (toast.onPress) toast.onPress();
          dismissToast();
        }}
        style={styles.toastContentRow}
      >
        {/* Avatar or emoji icon badge */}
        {toast.avatarUrl ? (
          <Image source={{ uri: toast.avatarUrl }} style={styles.toastAvatar} />
        ) : (
          <View style={styles.iconBadge}>
            <Text style={styles.iconText}>{toast.icon ?? '🔔'}</Text>
          </View>
        )}

        {/* Text: title (sender name) + message body */}
        <View style={styles.textMetaContainer}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.brandBadge}>PING</Text>
            <Text style={styles.toastTitle} numberOfLines={1}>
              {toast.title}
            </Text>
          </View>
          {!!toast.message && (
            <Text style={styles.toastMessage} numberOfLines={2}>
              {toast.message}
            </Text>
          )}
        </View>

        {/* Quick dismiss */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={dismissToast}
          style={styles.closeBtn}
          hitSlop={8}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    marginHorizontal: SCREEN_WIDTH * 0.04,
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(232, 68, 122, 0.15)',
    zIndex: 9999,
  },
  toastContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toastAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.magenta,
    backgroundColor: Colors.primarySoft,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(232, 68, 122, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
  },
  textMetaContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  brandBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.magenta,
    backgroundColor: 'rgba(232, 68, 122, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  toastTitle: {
    ...Typography.heading,
    fontSize: 14,
    color: Colors.plum,
    fontWeight: '700',
    flexShrink: 1,
  },
  toastMessage: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 17,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '700',
  },
});
