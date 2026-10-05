import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Button } from '../components/Button';
import { useLocation } from '../hooks/useLocation';

interface OnboardingLocationScreenProps {
  onComplete: () => void;
}

export const OnboardingLocationScreen: React.FC<OnboardingLocationScreenProps> = ({ onComplete }) => {
  const { startLocationSharing, isStartingLocation } = useLocation();

  const handleEnableLocation = async () => {
    // Default coords: Gurgaon / Delhi NCR (28.4595, 77.0266)
    const res = await startLocationSharing({ latitude: 28.4595, longitude: 77.0266 });
    if (res.status === 'success') {
      onComplete();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>📍</Text>
        <Text style={styles.title}>Enable Location</Text>
        <Text style={styles.subtitle}>
          Step 6 of 6 — Ping uses your location to discover matches nearby and show accurate distance tags.
        </Text>

        <Button
          title="Enable Location Sharing"
          onPress={handleEnableLocation}
          loading={isStartingLocation}
          style={styles.enableBtn}
        />

        <Button
          title="Maybe Later"
          variant="secondary"
          onPress={onComplete}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream, padding: 24, justifyContent: 'center' },
  content: { alignItems: 'center', width: '100%' },
  icon: { fontSize: 64, marginBottom: 16 },
  title: { ...Typography.display, color: Colors.magenta, marginBottom: 8, textAlign: 'center' },
  subtitle: { ...Typography.body, color: Colors.plum, textAlign: 'center', marginBottom: 32 },
  enableBtn: { width: '100%', marginBottom: 12 },
});
