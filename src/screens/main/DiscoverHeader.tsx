import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Bell, IconButton, Pin, Sliders } from '../../ui';
import { useNotifications } from '../../notifications/NotificationsContext';
import { locationApi } from '../../api/location';
import { getCurrentCoords, LocationPermissionDenied, LocationUnavailable } from '../../native/location';
import { useDeck } from './DeckContext';
import { FiltersSheet } from './FiltersSheet';

const PING_LOGO = require('../../assets/images/ping_logo_full.png');

interface Props {
  title: string;
  subtitle: string;
}

/** Ping logo · location pill · notifications · filters, then the big title. */
export const DiscoverHeader: React.FC<Props> = ({ title, subtitle }) => {
  const deck = useDeck();
  const notif = useNotifications();
  const [filters, setFilters] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locLabel, setLocLabel] = useState('Near you');

  const updateLocation = async () => {
    setLocating(true);
    try {
      const coords = await getCurrentCoords();
      const res = await locationApi.startLocationSharing(coords);
      if (res.status === 'success') {
        setLocLabel('Location updated');
        deck.reset();
      } else setLocLabel('Couldn’t update');
    } catch (e) {
      setLocLabel(
        e instanceof LocationPermissionDenied ? 'Location off' : e instanceof LocationUnavailable ? 'Rebuild app for GPS' : 'GPS unavailable',
      );
    } finally {
      setLocating(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Image source={PING_LOGO} style={styles.logo} resizeMode="contain" accessibilityLabel="Ping" />
        <Pressable
          onPress={updateLocation}
          disabled={locating}
          accessibilityRole="button"
          accessibilityLabel="Update my location"
          style={styles.loc}
        >
          {locating ? <ActivityIndicator size="small" color={Colors.primary} /> : <Pin />}
          <Text style={styles.locText} numberOfLines={1}>
            {locLabel}
          </Text>
          <Text style={styles.caret}>▾</Text>
        </Pressable>
        <View style={styles.flex} />
        <View>
          <IconButton accessibilityLabel="Notifications" onPress={() => notif.setSheetOpen(true)} variant="white">
            <Bell />
          </IconButton>
          {notif.unread > 0 ? <View style={styles.dot} /> : null}
        </View>
        <IconButton accessibilityLabel="Discovery filters" onPress={() => setFilters(true)} variant="white">
          <Sliders />
        </IconButton>
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.sub}>{subtitle}</Text>

      <FiltersSheet visible={filters} onClose={() => setFilters(false)} onSaved={deck.reset} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1 },
  // ping_logo_full.png is 910×506 — keep its aspect ratio.
  logo: { height: 48, width: 86 },
  dot: { position: 'absolute', top: 6, right: 6, width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.danger, borderWidth: 2, borderColor: Colors.white },
  loc: { flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: 180 },
  locText: { ...Typography.label, color: Colors.ink },
  caret: { color: Colors.mute, fontSize: 12 },
  title: { ...Typography.title, color: Colors.ink, marginTop: 14 },
  sub: { ...Typography.caption, color: Colors.mute, marginTop: 2, marginBottom: 10 },
});
