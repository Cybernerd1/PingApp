import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Radius, Typography } from '../theme/typography';
import { Close } from './icons';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Fill most of the screen (lists / forms). */
  tall?: boolean;
  scroll?: boolean;
}

/** Bottom sheet modal used for filters, edit forms, menus. */
export const Sheet: React.FC<SheetProps> = props => (
  <Modal visible={props.visible} transparent animationType="slide" onRequestClose={props.onClose} statusBarTranslucent navigationBarTranslucent>
    <SafeAreaProvider>
      <SheetContent {...props} />
    </SafeAreaProvider>
  </Modal>
);

const SheetContent: React.FC<SheetProps> = ({ onClose, title, children, footer, tall, scroll = true }) => {
  const insets = useSafeAreaInsets();
  return (
    <>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
        <View style={[styles.sheet, tall && styles.tall, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.grabber} />
          {title ? (
            <View style={styles.header}>
              <Text style={styles.title} accessibilityRole="header">
                {title}
              </Text>
              <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close" style={styles.close}>
                <Close size={16} />
              </Pressable>
            </View>
          ) : null}
          {scroll ? (
            <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.body, styles.flex]}>{children}</View>
          )}
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(18,16,22,0.35)' },
  sheet: {
    backgroundColor: '#F6F3FB',
    borderTopLeftRadius: Radius.largeCard,
    borderTopRightRadius: Radius.largeCard,
    maxHeight: '88%',
  },
  tall: { height: '88%' },
  grabber: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: 'rgba(18,16,22,0.15)', marginTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4 },
  title: { ...Typography.heading, color: Colors.ink, flex: 1 },
  close: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  footer: { paddingHorizontal: 20, paddingTop: 8 },
});
