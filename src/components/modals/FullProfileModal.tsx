import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Modal,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../../theme/colors';
import { Typography, Radius } from '../../theme/typography';
import { CandidateProfile } from '../CardStack';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FullProfileModalProps {
  visible: boolean;
  candidate: CandidateProfile | null;
  onClose: () => void;
  onLike: (candidate: CandidateProfile) => void;
  onPass: (candidate: CandidateProfile) => void;
  onSuperLike: (candidate: CandidateProfile) => void;
}

export const FullProfileModal: React.FC<FullProfileModalProps> = ({
  visible,
  candidate,
  onClose,
  onLike,
  onPass,
  onSuperLike,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const translateY = useSharedValue(SCREEN_HEIGHT);

  useEffect(() => {
    if (visible) {
      setActivePhotoIdx(0);
      translateY.value = withSpring(0, {
        damping: 18,
        stiffness: 140,
        mass: 0.8,
      });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
    }
  }, [visible]);

  const animatedContainer = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible || !candidate) return null;

  const photos = candidate.photos && candidate.photos.length > 0
    ? candidate.photos
    : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800'];

  const fallbackInterests = [
    'Urban Hiking',
    'Generative Art',
    'Indie Espresso',
    'Vaporwave Architecture',
    'Deep Tech',
  ];

  const displayInterests = candidate.interests && candidate.interests.length > 0
    ? candidate.interests
    : fallbackInterests;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="dark-content" />
      <Animated.View style={[styles.modalOverlay, animatedContainer]}>
        <SafeAreaView style={styles.safeArea}>
          {/* Top Back Navigation Bar matching reference design */}
          <View style={styles.topNavHeader}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.backButtonRow}
            >
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backHeaderName}>{candidate.username}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={true}
          >
            {/* Hero Profile Photo Card */}
            <View style={styles.heroCardContainer}>
              <Image
                source={{ uri: photos[activePhotoIdx] }}
                style={styles.heroImage}
              />
              <View style={styles.heroGradient} />

              {/* Multi-Photo Dots */}
              {photos.length > 1 && (
                <View style={styles.photoDotsRow}>
                  {photos.map((_, i) => (
                    <TouchableOpacity
                      key={i}
                      activeOpacity={0.8}
                      onPress={() => setActivePhotoIdx(i)}
                      style={[
                        styles.photoDot,
                        i === activePhotoIdx && styles.photoDotActive,
                      ]}
                    />
                  ))}
                </View>
              )}

              {/* Bottom Left Hero Overlay Text */}
              <View style={styles.heroOverlayText}>
                <Text style={styles.heroTitle}>
                  {candidate.username},{candidate.age}
                </Text>
                <Text style={styles.heroSubtitle}>
                  {candidate.jobTitle || 'Product Manager @Stripe'}
                </Text>
              </View>
            </View>

            {/* About Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitleCoral}>About</Text>
              <Text style={styles.aboutBodyText}>
                {candidate.bio ||
                  'Night owl who loves exploring hidden coffee shops and street art. Always up for a spontaneous adventure or deep conversation over pour-over coffee.'}
              </Text>
            </View>

            {/* Interests Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitleCoral}>Interests</Text>
              <View style={styles.interestsPillsRow}>
                {displayInterests.map((interest, idx) => (
                  <View key={idx} style={styles.interestPill}>
                    <Text style={styles.interestPillText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Primary Action Button: Konnect / Ping */}
            <View style={styles.actionButtonContainer}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  onClose();
                  onLike(candidate);
                }}
                style={styles.konnectPrimaryBtn}
              >
                <Text style={styles.konnectBtnText}>Konnect</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Action Floating Controls */}
            <View style={styles.quickActionRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  onClose();
                  onPass(candidate);
                }}
                style={[styles.quickCircleBtn, styles.passCircle]}
              >
                <Text style={styles.actionIcon}>✖</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  onClose();
                  onSuperLike(candidate);
                }}
                style={[styles.quickCircleBtn, styles.superCircle]}
              >
                <Text style={styles.actionIcon}>⭐</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  onClose();
                  onLike(candidate);
                }}
                style={[styles.quickCircleBtn, styles.likeCircle]}
              >
                <Text style={styles.actionIcon}>❤️</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: '#FDF7F4',
  },
  safeArea: {
    flex: 1,
  },
  topNavHeader: {
    height: 54,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#FDF7F4',
  },
  backButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backArrow: {
    fontSize: 32,
    color: '#D94D26',
    fontWeight: '300',
    marginTop: -4,
  },
  backHeaderName: {
    ...Typography.heading,
    fontSize: 22,
    color: '#D94D26',
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroCardContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.52,
    position: 'relative',
    backgroundColor: '#1E1017',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: 'rgba(30, 16, 23, 0.65)',
  },
  photoDotsRow: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    zIndex: 10,
  },
  photoDot: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  photoDotActive: {
    backgroundColor: Colors.white,
  },
  heroOverlayText: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  heroTitle: {
    ...Typography.heading,
    fontSize: 28,
    color: Colors.white,
    fontWeight: '800',
  },
  heroSubtitle: {
    ...Typography.body,
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitleCoral: {
    ...Typography.heading,
    fontSize: 18,
    color: '#D94D26',
    fontWeight: '700',
    marginBottom: 10,
  },
  aboutBodyText: {
    ...Typography.body,
    fontSize: 15,
    color: '#4A3E39',
    lineHeight: 22,
  },
  compatibilityCard: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(217, 77, 38, 0.08)',
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  compatHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  compatTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compatIcon: {
    fontSize: 18,
  },
  compatHeadingText: {
    ...Typography.heading,
    fontSize: 16,
    color: '#D94D26',
    fontWeight: '700',
  },
  compatScoreBadge: {
    backgroundColor: '#FDEAE4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  compatScoreText: {
    ...Typography.caption,
    fontSize: 13,
    color: '#D94D26',
    fontWeight: '800',
  },
  progressItem: {
    marginBottom: 14,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabelBlue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
  },
  progressValBlue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
  },
  progressLabelCoral: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D94D26',
  },
  progressValCoral: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D94D26',
  },
  progressLabelGreen: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
  progressValGreen: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F3EFEF',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  fillBlue: {
    backgroundColor: '#818CF8',
  },
  fillCoral: {
    backgroundColor: '#FF7A59',
  },
  fillGreen: {
    backgroundColor: '#34D399',
  },
  interestsPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestPill: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  interestPillText: {
    ...Typography.body,
    fontSize: 13,
    color: '#4A3E39',
    fontWeight: '600',
  },
  actionButtonContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  konnectPrimaryBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FF6B4A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B4A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  konnectBtnText: {
    ...Typography.heading,
    fontSize: 18,
    color: Colors.white,
    fontWeight: '800',
  },
  currentVibeBox: {
    backgroundColor: '#FDEEE9',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 74, 0.2)',
    alignItems: 'center',
  },
  currentVibeText: {
    ...Typography.body,
    fontSize: 14,
    color: '#D94D26',
    fontWeight: '700',
  },
  quickActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginTop: 28,
  },
  quickCircleBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  passCircle: {
    borderWidth: 2,
    borderColor: Colors.coral,
  },
  superCircle: {
    borderWidth: 2,
    borderColor: Colors.magenta,
  },
  likeCircle: {
    backgroundColor: Colors.magenta,
  },
  actionIcon: {
    fontSize: 22,
  },
});
