import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Button } from '../components/Button';
import { usePrivacy } from '../hooks/usePrivacy';

interface OnboardingPrivacyScreenProps {
  onNext: () => void;
}

export const OnboardingPrivacyScreen: React.FC<OnboardingPrivacyScreenProps> = ({ onNext }) => {
  const [showDistance, setShowDistance] = useState(true);
  const [showAge, setShowAge] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(false);
  const [profileVisible, setProfileVisible] = useState(true);

  const { createPrivacySettings, isCreatingPrivacy } = usePrivacy();

  const handleSave = async () => {
    const res = await createPrivacySettings({
      show_distance: showDistance,
      show_age: showAge,
      show_online_status: showOnlineStatus,
      profile_visible_in_discover: profileVisible,
    });
    if (res.status === 'success') {
      onNext();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Privacy Settings</Text>
      <Text style={styles.subtitle}>Step 5 of 6 — Choose what to display</Text>

      <View style={styles.row}>
        <Text style={styles.rowText}>Show Distance on Profile</Text>
        <Switch value={showDistance} onValueChange={setShowDistance} trackColor={{ true: Colors.magenta }} />
      </View>

      <View style={styles.row}>
        <Text style={styles.rowText}>Show Age on Profile</Text>
        <Switch value={showAge} onValueChange={setShowAge} trackColor={{ true: Colors.magenta }} />
      </View>

      <View style={styles.row}>
        <Text style={styles.rowText}>Show Online Status</Text>
        <Switch value={showOnlineStatus} onValueChange={setShowOnlineStatus} trackColor={{ true: Colors.magenta }} />
      </View>

      <View style={styles.row}>
        <Text style={styles.rowText}>Visible in Discover Deck</Text>
        <Switch value={profileVisible} onValueChange={setProfileVisible} trackColor={{ true: Colors.magenta }} />
      </View>

      <Button title="Continue to Location" onPress={handleSave} loading={isCreatingPrivacy} style={styles.btn} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  content: { padding: 24 },
  title: { ...Typography.display, color: Colors.magenta, marginBottom: 4 },
  subtitle: { ...Typography.caption, color: Colors.plum, marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  rowText: { ...Typography.bodyStrong, color: Colors.plum },
  btn: { marginTop: 32 },
});
