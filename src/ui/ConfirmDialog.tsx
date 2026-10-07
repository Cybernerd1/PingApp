import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Radius, Typography } from '../theme/typography';

export interface DialogButton {
  label: string;
  onPress: () => void;
  variant?: 'default' | 'destructive' | 'cancel';
}

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  buttons: DialogButton[];
  onDismiss?: () => void;
  /** Rendered below the message — use for custom content. */
  children?: React.ReactNode;
}

/**
 * Custom confirm/alert dialog — replaces React Native's built-in Alert.alert.
 * Matches Ping's design system (ink surface, purple accents, pill buttons).
 */
export const ConfirmDialog: React.FC<Props> = ({
  visible,
  title,
  message,
  buttons,
  onDismiss,
  children,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onDismiss}
    statusBarTranslucent
    navigationBarTranslucent
  >
    <SafeAreaProvider>
      <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
        <Pressable style={styles.backdrop} onPress={onDismiss} />
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          {children ? <View style={styles.childrenWrap}>{children}</View> : null}
          <View style={styles.row}>
            {buttons.map((btn, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [
                  styles.btn,
                  btn.variant === 'destructive' && styles.btnDestructive,
                  btn.variant === 'cancel' && styles.btnCancel,
                  pressed && styles.btnPressed,
                ]}
                onPress={btn.onPress}
                accessibilityRole="button"
                accessibilityLabel={btn.label}
              >
                <Text
                  style={[
                    styles.btnText,
                    btn.variant === 'destructive' && styles.btnTextDestructive,
                    btn.variant === 'cancel' && styles.btnTextCancel,
                  ]}
                >
                  {btn.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  </Modal>
);

// ─── Hook helper ─────────────────────────────────────────────────────────────

interface DialogState {
  visible: boolean;
  title: string;
  message?: string;
  buttons: DialogButton[];
  children?: React.ReactNode;
}

const DEFAULT_STATE: DialogState = { visible: false, title: '', buttons: [] };

/**
 * Convenience hook — returns a rendered <ConfirmDialog /> plus a showDialog()
 * function to open it imperatively.
 *
 * Usage:
 *   const { dialog, showDialog } = useConfirmDialog();
 *   showDialog({ title: 'Delete?', message: '...', buttons: [...] });
 *   return <>{dialog}</>
 */
export function useConfirmDialog() {
  const [state, setState] = React.useState<DialogState>(DEFAULT_STATE);
  const dismiss = () => setState(s => ({ ...s, visible: false }));
  const showDialog = (opts: Omit<DialogState, 'visible'>) =>
    setState({ ...opts, visible: true });

  const dialog = (
    <ConfirmDialog
      visible={state.visible}
      title={state.title}
      message={state.message}
      buttons={state.buttons}
      onDismiss={dismiss}
    >
      {state.children}
    </ConfirmDialog>
  );
  return { dialog, showDialog, dismissDialog: dismiss };
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 16, 22, 0.55)',
  },
  card: {
    width: '82%',
    backgroundColor: Colors.white,
    borderRadius: Radius.largeCard,
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
  },
  title: { ...Typography.heading, color: Colors.ink, textAlign: 'center', marginBottom: 6 },
  message: { ...Typography.body, color: Colors.mute, textAlign: 'center', lineHeight: 22 },
  childrenWrap: { marginTop: 12 },
  row: { marginTop: 24, flexDirection: 'row', gap: 10 },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.line,
  },
  btnDestructive: { backgroundColor: Colors.danger },
  btnPressed: { opacity: 0.75 },
  btnText: { ...Typography.bodyStrong, color: Colors.white, fontSize: 15 },
  btnTextCancel: { color: Colors.ink },
  btnTextDestructive: { color: Colors.white },
});
