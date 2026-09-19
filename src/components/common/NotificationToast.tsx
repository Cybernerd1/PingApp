import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../../theme/colors';
import { Typography, Radius } from '../../theme/typography';

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
  const translateY = useSharedValue(-120);

  useEffect(() => {
    if (toast) {
      translateY.value = withSpring(10, {
        damping: 14,
        stiffness: 160,
      });

      const timer = setTimeout(() => {
        dismissToast();
      }, toast.durationMs || 4500);

      return () => clearTimeout(timer);
    } else {
      translateY.value = withTiming(-120, { duration: 250 });
    }
  }, [toast]);

  const dismissToast = () => {
    translateY.value = withTiming(-120, { duration: 200 }, () => {
      onDismiss();
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!toast) return null;

  return (
    <SafeAreaView pointerEvents="box-none" style={styles.toastContainerWrapper}>
      <Animated.View style={[styles.toastCard, animatedStyle]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            if (toast.onPress) toast.onPress();
            dismissToast();
          }}
          style={styles.toastContentRow}
        >
          {/* Avatar or Icon Badge */}
          {toast.avatarUrl ? (
            <Image source={{ uri: toast.avatarUrl }} style={styles.toastAvatar} />
          ) : (
            <View style={styles.iconBadge}>
              <Text style={styles.iconText}>{toast.icon || '🔔'}</Text>
            </View>
          )}

          {/* Text Meta */}
          <View style={styles.textMetaContainer}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.brandBadge}>PING</Text>
              <Text style={styles.toastTitle} numberOfLines={1}>
                {toast.title}
              </Text>
            </View>
            <Text style={styles.toastMessage} numberOfLines={2}>
              {toast.message}
            </Text>
          </View>

          {/* Quick Dismiss Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={dismissToast}
            style={styles.closeBtn}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  toastContainerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastCard: {
    width: SCREEN_WIDTH * 0.92,
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
