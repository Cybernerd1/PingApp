import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Close } from './icons';
import { IconButton } from './IconButton';

const { width: W, height: H } = Dimensions.get('window');

interface Props {
  visible: boolean;
  uri: string;
  onClose: () => void;
  /** Optional caption shown at the bottom. */
  caption?: string;
}

/**
 * Full-screen image viewer with a close button.
 * Tapping the backdrop also closes it.
 */
export const MediaViewer: React.FC<Props> = ({ visible, uri, onClose, caption }) => {
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const onShow = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 200 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      onShow={onShow}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <SafeAreaProvider>
        <View style={styles.root}>
          {/* Backdrop tap to close */}
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessible={false} />

          <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
            {/* Close button */}
            <View style={styles.header}>
              <IconButton
                accessibilityLabel="Close image"
                onPress={onClose}
                variant="white"
              >
                <Close size={18} />
              </IconButton>
            </View>

            {/* Image */}
            <Animated.View
              style={[
                styles.imageWrap,
                { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
              ]}
            >
              <Image
                source={{ uri }}
                style={styles.image}
                resizeMode="contain"
              />
            </Animated.View>

            {caption ? (
              <View style={styles.captionWrap}>
                <Text style={styles.caption} numberOfLines={3}>{caption}</Text>
              </View>
            ) : null}
          </SafeAreaView>
        </View>
      </SafeAreaProvider>
    </Modal>
  );
};

// ─── Hook helper ─────────────────────────────────────────────────────────────

/**
 * Convenience hook — returns a rendered <MediaViewer /> plus an openMedia()
 * function to open it imperatively.
 *
 * Usage:
 *   const { mediaViewer, openMedia } = useMediaViewer();
 *   openMedia(uri);
 *   return <>{mediaViewer}</>;
 */
export function useMediaViewer() {
  const [state, setState] = useState<{ uri: string; caption?: string } | null>(null);
  const closeMedia = () => setState(null);
  const openMedia = (uri: string, caption?: string) => setState({ uri, caption });

  const mediaViewer = state ? (
    <MediaViewer
      visible
      uri={state.uri}
      caption={state.caption}
      onClose={closeMedia}
    />
  ) : null;

  return { mediaViewer, openMedia, closeMedia };
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(10, 8, 14, 0.96)',
  },
  overlay: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: 'flex-end',
  },
  imageWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  image: {
    width: W - 16,
    height: H * 0.78,
    borderRadius: 12,
  },
  captionWrap: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 12,
    alignItems: 'center',
  },
  caption: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
});
