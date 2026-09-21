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
import { BackArrowIcon, SettingsIcon } from '../components/illustrations/Icons';
import Svg, { Path } from 'react-native-svg';

const STORAGE_KEY = '@ping_discovery_prefs';

interface DiscoveryPrefs {
  ageMin: number;
  ageMax: number;
  distanceKm: number;
  showMen: boolean;
  showWomen: boolean;
  showNonBinary: boolean;
  showEveryone: boolean;
  globalMode: boolean;
}

const DEFAULT_PREFS: DiscoveryPrefs = {
  ageMin: 18,
  ageMax: 35,
  distanceKm: 25,
  showMen: false,
  showWomen: false,
  showNonBinary: false,
  showEveryone: true,
  globalMode: false,
};

interface DiscoveryPreferencesModalProps {
  visible: boolean;
  user: any;
  onClose: () => void;
}

// ─── Simple range step control ────────────────────────────────────────────────
const StepControl: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onDecrement: () => void;
  onIncrement: () => void;
}> = ({ label, value, min, max, unit = '', onDecrement, onIncrement }) => (
  <View style={stepStyles.wrapper}>
    <View style={{ flex: 1 }}>
      <Text style={stepStyles.label}>{label}</Text>
      <Text style={stepStyles.value}>
        {value}{unit}{value === max ? '+' : ''}
      </Text>
    </View>
    <View style={stepStyles.controls}>
      <TouchableOpacity
        style={[stepStyles.btn, value <= min && stepStyles.btnDisabled]}
        onPress={onDecrement}
        disabled={value <= min}
      >
        <Text style={stepStyles.btnText}>−</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[stepStyles.btn, value >= max && stepStyles.btnDisabled]}
        onPress={onIncrement}
        disabled={value >= max}
      >
        <Text style={stepStyles.btnText}>+</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const stepStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  label: { ...Typography.caption, fontSize: 13, color: Colors.textMuted, marginBottom: 2 },
  value: { ...Typography.bodyStrong, fontSize: 16, color: Colors.plum },
  controls: { flexDirection: 'row', gap: 8 },
  btn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(232,68,122,0.25)',
  },
  btnDisabled: { opacity: 0.35 },
  btnText: { fontSize: 22, fontWeight: '600', color: Colors.magenta, lineHeight: 26 },
});

export const DiscoveryPreferencesModal: React.FC<DiscoveryPreferencesModalProps> = ({
  visible,
  user,
  onClose,
}) => {
  const [prefs, setPrefs] = useState<DiscoveryPrefs>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (visible && !loaded) {
      AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
        if (raw) {
          try { setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) }); } catch { /* ignore */ }
        }
        setLoaded(true);
      });
    }
  }, [visible, loaded]);

  const save = async (next: DiscoveryPrefs) => {
    setPrefs(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const update = <K extends keyof DiscoveryPrefs>(key: K, val: DiscoveryPrefs[K]) =>
    save({ ...prefs, [key]: val });

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <BackArrowIcon size={22} color={Colors.plum} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Discovery Preferences</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Age Range ── */}
          <Text style={styles.sectionLabel}>Age Range</Text>
          <View style={styles.card}>
            <View style={styles.ageRangeDisplay}>
              <Text style={styles.ageRangeText}>
                {prefs.ageMin} — {prefs.ageMax === 60 ? '60+' : prefs.ageMax}
              </Text>
            </View>
            <StepControl
              label="Minimum Age"
              value={prefs.ageMin}
              min={18}
              max={prefs.ageMax - 1}
              unit=" yrs"
              onDecrement={() => update('ageMin', Math.max(18, prefs.ageMin - 1))}
              onIncrement={() => update('ageMin', Math.min(prefs.ageMax - 1, prefs.ageMin + 1))}
            />
            <StepControl
              label="Maximum Age"
              value={prefs.ageMax}
              min={prefs.ageMin + 1}
              max={60}
              unit=" yrs"
              onDecrement={() => update('ageMax', Math.max(prefs.ageMin + 1, prefs.ageMax - 1))}
              onIncrement={() => update('ageMax', Math.min(60, prefs.ageMax + 1))}
            />
          </View>

          {/* ── Distance ── */}
          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Maximum Distance</Text>
          <View style={styles.card}>
            <StepControl
              label="Distance radius"
              value={prefs.distanceKm}
              min={1}
              max={100}
              step={5}
              unit=" km"
              onDecrement={() => update('distanceKm', Math.max(1, prefs.distanceKm - 5))}
              onIncrement={() => update('distanceKm', Math.min(100, prefs.distanceKm + 5))}
            />
            <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>Global Mode 🌍</Text>
                <Text style={styles.switchDesc}>See people worldwide, not just nearby.</Text>
              </View>
              <Switch
                value={prefs.globalMode}
                onValueChange={(v) => update('globalMode', v)}
                trackColor={{ false: 'rgba(0,0,0,0.1)', true: Colors.magenta }}
                thumbColor={Colors.white}
              />
            </View>
          </View>

          {/* ── Show Me ── */}
          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Show Me</Text>
          <View style={styles.card}>
            {([
              { key: 'showEveryone', label: 'Everyone 🌈', desc: 'Show all genders' },
              { key: 'showMen', label: 'Men 👨', desc: null },
              { key: 'showWomen', label: 'Women 👩', desc: null },
              { key: 'showNonBinary', label: 'Non-binary 🧑', desc: null },
            ] as { key: keyof DiscoveryPrefs; label: string; desc: string | null }[]).map((item, idx, arr) => (
              <View
                key={item.key}
                style={[styles.switchRow, idx < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)' }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchLabel}>{item.label}</Text>
                  {item.desc && <Text style={styles.switchDesc}>{item.desc}</Text>}
                </View>
                <Switch
                  value={prefs[item.key] as boolean}
                  onValueChange={(v) => update(item.key, v)}
                  trackColor={{ false: 'rgba(0,0,0,0.1)', true: Colors.magenta }}
                  thumbColor={Colors.white}
                />
              </View>
            ))}
          </View>

          <Text style={styles.footnote}>
            These preferences are applied locally and will guide your discovery feed. Backend
            filter support coming soon.
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
  sectionLabel: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.plum,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    paddingHorizontal: 18,
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  ageRangeDisplay: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  ageRangeText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.magenta,
    letterSpacing: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    gap: 12,
  },
  switchLabel: { ...Typography.bodyStrong, fontSize: 15, color: Colors.plum, marginBottom: 2 },
  switchDesc: { ...Typography.caption, fontSize: 12, color: Colors.textMuted },
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
