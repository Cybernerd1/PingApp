import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Dimensions,
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

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  icon?: string;
  confirmText?: string;
  cancelText?: string | null;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  icon = '✨',
  confirmText = 'OK',
  cancelText,
  isDanger = false,
  onConfirm,
  onCancel,
}) => {
  const backdropOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.85);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 200 });
      cardScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 150 });
      cardScale.value = withTiming(0.85, { duration: 150 });
    }
  }, [visible]);

  const animatedBackdrop = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const animatedCard = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  if (!visible) return null;

  const handleClose = () => {
    if (onCancel) {
      onCancel();
    } else {
      onConfirm();
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.overlay, animatedBackdrop]}>
        <Animated.View style={[styles.dialogCard, animatedCard]}>
          {/* Top Icon Badge */}
          {icon ? (
            <View style={[styles.iconCircle, isDanger && styles.iconCircleDanger]}>
              <Text style={styles.iconText}>{icon}</Text>
            </View>
          ) : null}

          {/* Title & Body Message */}
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.messageText}>{message}</Text>

          {/* Action Buttons Row */}
          <View style={styles.buttonRow}>
            {cancelText && onCancel ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onCancel}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>{cancelText}</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onConfirm}
              style={[
                styles.confirmBtn,
                isDanger && styles.confirmBtnDanger,
              ]}
            >
              <Text style={styles.confirmBtnText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(43, 22, 32, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  dialogCard: {
    width: SCREEN_WIDTH * 0.85,
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(232, 68, 122, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconCircleDanger: {
    backgroundColor: 'rgba(235, 87, 87, 0.12)',
  },
  iconText: {
    fontSize: 28,
  },
  titleText: {
    ...Typography.heading,
    fontSize: 20,
    color: Colors.plum,
    textAlign: 'center',
    marginBottom: 8,
  },
  messageText: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  cancelBtnText: {
    ...Typography.body,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.plum,
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.magenta,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.magenta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmBtnDanger: {
    backgroundColor: Colors.danger,
    shadowColor: Colors.danger,
  },
  confirmBtnText: {
    ...Typography.body,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
});
