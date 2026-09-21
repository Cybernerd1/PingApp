import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../theme/colors';
import { Typography, Radius } from '../theme/typography';
import { BackArrowIcon, BellIcon } from '../components/illustrations/Icons';

const STORAGE_KEY = '@ping_notification_prefs';

interface NotifPrefs {
  matches: boolean;
  messages: boolean;
  superPings: boolean;
  promotions: boolean;
  nearbyActivity: boolean;
}

const DEFAULT_PREFS: NotifPrefs = {
  matches: true,
  messages: true,
  superPings: true,
  promotions: false,
  nearbyActivity: true,
};

const SETTINGS: { key: keyof NotifPrefs; label: string; description: string; emoji: string }[] = [
  {
    key: 'matches',
    label: 'New Matches',
    description: 'Get notified when someone pings you back.',
    emoji: '💖',
  },
  {
    key: 'messages',
    label: 'New Messages',
    description: 'Alerts when a match sends you a message.',
    emoji: '💬',
  },
  {
    key: 'superPings',
    label: 'Super Pings',
    description: 'Know when someone sends you a Super Ping.',
    emoji: '⭐',
  },
  {
    key: 'nearbyActivity',
    label: 'Nearby Activity',
    description: 'People near you who match your preferences.',
    emoji: '📍',
  },
  {
    key: 'promotions',
    label: 'Promotions & Tips',
    description: 'Product updates, tips, and feature announcements.',
    emoji: '📣',
  },
];

interface NotificationSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);

  // Load saved prefs
  useEffect(() => {
    if (visible && !loaded) {
      AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
        if (raw) {
          try {
            setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
          } catch { /* ignore */ }
        }
        setLoaded(true);
      });
    }
  }, [visible, loaded]);

  const toggle = async (key: keyof NotifPrefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <BackArrowIcon size={22} color={Colors.plum} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Banner */}
          <View style={styles.banner}>
            <Text style={styles.bannerEmoji}>🔔</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Stay in the loop</Text>
              <Text style={styles.bannerSub}>
                Choose which alerts Ping sends you. You can change these any time.
              </Text>
            </View>
          </View>

          {/* Toggle List */}
          <View style={styles.card}>
            {SETTINGS.map((s, idx) => (
              <View
                key={s.key}
                style={[styles.row, idx < SETTINGS.length - 1 && styles.rowBorder]}
              >
                <View style={styles.emojiCircle}>
                  <Text style={styles.emoji}>{s.emoji}</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{s.label}</Text>
                  <Text style={styles.rowDesc}>{s.description}</Text>
                </View>
                <Switch
                  value={prefs[s.key]}
                  onValueChange={() => toggle(s.key)}
                  trackColor={{ false: 'rgba(0,0,0,0.1)', true: Colors.magenta }}
                  thumbColor={Colors.white}
                  ios_backgroundColor="rgba(0,0,0,0.1)"
                />
              </View>
            ))}
          </View>

          <Text style={styles.footnote}>
            Push notification availability depends on your device settings. To completely disable
            notifications, go to your device's Notification Settings.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cream },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Typography.bodyStrong, color: Colors.plum, fontSize: 17 },
  scroll: { padding: 20, paddingBottom: 48 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(232,68,122,0.08)',
    borderRadius: Radius.card,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(232,68,122,0.15)',
  },
  bannerEmoji: { fontSize: 36 },
  bannerTitle: { ...Typography.bodyStrong, color: Colors.plum, fontSize: 15, marginBottom: 4 },
  bannerSub: { ...Typography.caption, color: Colors.textMuted, fontSize: 13, lineHeight: 19 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    overflow: 'hidden',
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 12,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)' },
  emojiCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 18 },
  rowText: { flex: 1 },
  rowLabel: { ...Typography.bodyStrong, fontSize: 15, color: Colors.plum, marginBottom: 2 },
  rowDesc: { ...Typography.caption, fontSize: 12, color: Colors.textMuted, lineHeight: 17 },
  footnote: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
});
