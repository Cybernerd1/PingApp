import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { Radius, Shadow } from '../../theme/typography';
import { ChatIcon, HomeIcon, UserIcon } from '../../ui';

export type MainTab = 'home' | 'chats' | 'profile';

interface Props {
  active: MainTab;
  onSelect: (t: MainTab) => void;
  unreadChats?: number;
}

const TABS: { id: MainTab; label: string; Icon: React.FC<{ size?: number; color?: string }> }[] = [
  { id: 'home', label: 'Home', Icon: HomeIcon },
  { id: 'chats', label: 'Chats', Icon: ChatIcon },
  { id: 'profile', label: 'Profile', Icon: UserIcon },
];

/** Black floating pill nav — all tabs look identical, no CTA. */
export const TabBar: React.FC<Props> = ({ active, onSelect, unreadChats = 0 }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]} pointerEvents="box-none">
      <View style={styles.bar}>
        {TABS.map(t => {
          const on = active === t.id;
          return (
            <Pressable
              key={t.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={t.label}
              onPress={() => onSelect(t.id)}
              style={styles.tab}
              hitSlop={4}
            >
              <View>
                <t.Icon size={22} color={on ? Colors.white : 'rgba(255,255,255,0.55)'} />
                {t.id === 'chats' && unreadChats > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadChats > 9 ? '9+' : unreadChats}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.label, on && styles.labelOn]}>{t.label}</Text>
              {on ? <View style={styles.underline} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 14, paddingTop: 6, backgroundColor: 'transparent' },
  bar: {
    height: 68,
    borderRadius: Radius.pill,
    backgroundColor: Colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    ...Shadow.lifted,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, height: '100%' },
  label: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.55)' },
  labelOn: { color: Colors.white },
  underline: { position: 'absolute', bottom: 10, width: 18, height: 2, borderRadius: 1, backgroundColor: Colors.white },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: Colors.white, fontSize: 9, fontWeight: '800' },
});
