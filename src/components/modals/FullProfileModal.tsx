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
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../../theme/colors';
import { Typography, Radius } from '../../theme/typography';
import { CandidateProfile } from '../CardStack';
import { Tag } from '../Tag';

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

  const prompts = candidate.prompts || [
    {
      question: 'My simple pleasures...',
      answer: 'Hot espresso on crisp mornings, discovering hidden vinyl shops, and long drives.',
    },
    {
      question: 'Together, we could...',
      answer: 'Cook an ambitious Italian dinner, debate design, and travel somewhere unplanned.',
    },
  ];

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
          {/* Top Floating Close Button */}
          <View style={styles.topHeaderBar}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              style={styles.closeCircleBtn}
            >
              <Text style={styles.closeBtnIcon}>↓</Text>
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitleName}>{candidate.username}</Text>
              <Text style={styles.headerTitleSub}>Swipe down to close</Text>
            </View>

            <View style={{ width: 42 }} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={true}
          >
            {/* Main Hero Photo Gallery */}
            <View style={styles.heroGalleryContainer}>
              <Image
                source={{ uri: photos[activePhotoIdx] }}
                style={styles.heroImage}
              />
              <View style={styles.imageDarkGradient} />

              {/* Photo Pagination Indicators */}
              {photos.length > 1 && (
                <View style={styles.paginationRow}>
                  {photos.map((_, i) => (
                    <TouchableOpacity
                      key={i}
                      activeOpacity={0.8}
                      onPress={() => setActivePhotoIdx(i)}
                      style={[
                        styles.paginationDot,
                        i === activePhotoIdx && styles.paginationDotActive,
                      ]}
                    />
                  ))}
                </View>
              )}

              {/* Overlay Hero Text */}
              <View style={styles.heroTextOverlay}>
                <View style={styles.nameRow}>
                  <Text style={styles.heroName}>{candidate.username}</Text>
                  <Text style={styles.heroAge}>, {candidate.age}</Text>
                  <Text style={styles.verifiedBadge}> ✓</Text>
                </View>

                <View style={styles.heroSubRow}>
                  {candidate.jobTitle ? (
                    <Text style={styles.heroJob}>💼 {candidate.jobTitle}</Text>
                  ) : null}
                  <Text style={styles.heroDistance}>📍 {candidate.distanceKm} km away</Text>
                </View>
              </View>
            </View>

            {/* Quick Basics Pills Container */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeading}>Basics</Text>
              <View style={styles.basicsGrid}>
                {candidate.location ? (
                  <View style={styles.basicPill}>
                    <Text style={styles.basicPillText}>📍 {candidate.location}</Text>
                  </View>
                ) : null}

                {candidate.height ? (
                  <View style={styles.basicPill}>
                    <Text style={styles.basicPillText}>📏 {candidate.height}</Text>
                  </View>
                ) : null}

                {candidate.zodiac ? (
                  <View style={styles.basicPill}>
                    <Text style={styles.basicPillText}>✨ {candidate.zodiac}</Text>
                  </View>
                ) : null}

                {candidate.education ? (
                  <View style={styles.basicPill}>
                    <Text style={styles.basicPillText}>🎓 {candidate.education}</Text>
                  </View>
                ) : null}

                {candidate.hometown ? (
                  <View style={styles.basicPill}>
                    <Text style={styles.basicPillText}>🏡 From {candidate.hometown}</Text>
                  </View>
                ) : null}

                {candidate.lookingFor ? (
                  <View style={styles.basicPill}>
                    <Text style={styles.basicPillText}>💘 {candidate.lookingFor}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* About Me / Bio Card */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionHeading}>About Me</Text>
              <Text style={styles.bioBody}>{candidate.bio}</Text>
            </View>

            {/* Passions & Interests */}
            {candidate.interests && candidate.interests.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeading}>Interests & Passions</Text>
                <View style={styles.tagsFlexRow}>
                  {candidate.interests.map((interest, idx) => (
                    <Tag key={idx} label={interest} />
                  ))}
                </View>
              </View>
            )}

            {/* Prompts Cards */}
            {prompts.map((p, idx) => (
              <View key={idx} style={styles.promptCard}>
                <Text style={styles.promptQuestion}>{p.question}</Text>
                <Text style={styles.promptAnswer}>{p.answer}</Text>
              </View>
            ))}

            {/* Spotify / Music Anthem Feature Card */}
            {candidate.spotifyTrack && (
              <View style={styles.spotifyCard}>
                <View style={styles.spotifyHeaderRow}>
                  <Text style={styles.spotifyBadgeText}>🎵 My Anthem</Text>
                  <Text style={styles.spotifyLogoText}>Spotify</Text>
                </View>
                <View style={styles.spotifyTrackRow}>
                  <Image
                    source={{ uri: candidate.spotifyTrack.image }}
                    style={styles.albumArt}
                  />
                  <View style={styles.trackMeta}>
                    <Text style={styles.trackTitle}>{candidate.spotifyTrack.track}</Text>
                    <Text style={styles.trackArtist}>{candidate.spotifyTrack.name}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Additional Photo Gallery Grid */}
            {photos.length > 1 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeading}>Gallery</Text>
                {photos.slice(1).map((photoUrl, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: photoUrl }}
                    style={styles.galleryFullPhoto}
                  />
                ))}
              </View>
            )}

            {/* Spacer for Floating Action Footer */}
            <View style={{ height: 110 }} />
          </ScrollView>

          {/* Sticky Bottom Action Buttons */}
          <View style={styles.stickyFooterBar}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                onClose();
                onPass(candidate);
              }}
              style={[styles.actionCircleBtn, styles.passBtn]}
            >
              <Text style={styles.actionIcon}>✖</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                onClose();
                onSuperLike(candidate);
              }}
              style={[styles.actionCircleBtn, styles.superBtn]}
            >
              <Text style={styles.actionIcon}>⭐</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                onClose();
                onLike(candidate);
              }}
              style={[styles.actionCircleBtn, styles.likeBtn]}
            >
              <Text style={styles.actionIcon}>❤️</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  safeArea: {
    flex: 1,
  },
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    zIndex: 20,
  },
  closeCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  closeBtnIcon: {
    fontSize: 22,
    color: Colors.plum,
    fontWeight: '800',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitleName: {
    ...Typography.heading,
    fontSize: 18,
    color: Colors.plum,
  },
  headerTitleSub: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textMuted,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroGalleryContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.58,
    position: 'relative',
    backgroundColor: '#000000',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageDarkGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(43, 22, 32, 0.75)',
  },
  paginationRow: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    zIndex: 10,
  },
  paginationDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  paginationDotActive: {
    backgroundColor: Colors.white,
  },
  heroTextOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  heroName: {
    ...Typography.heading,
    fontSize: 32,
    color: Colors.white,
    fontWeight: '800',
  },
  heroAge: {
    ...Typography.heading,
    fontSize: 28,
    color: Colors.white,
    fontWeight: '400',
  },
  verifiedBadge: {
    fontSize: 22,
    color: '#3897F0',
    fontWeight: '800',
  },
  heroSubRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroJob: {
    ...Typography.body,
    fontSize: 15,
    color: Colors.blush,
  },
  heroDistance: {
    ...Typography.caption,
    fontSize: 14,
    color: Colors.white,
    fontWeight: '600',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeading: {
    ...Typography.heading,
    fontSize: 18,
    color: Colors.plum,
    marginBottom: 12,
  },
  basicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  basicPill: {
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  basicPillText: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.plum,
    fontWeight: '600',
  },
  cardSection: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  bioBody: {
    ...Typography.body,
    fontSize: 15,
    color: Colors.plum,
    lineHeight: 22,
  },
  tagsFlexRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  promptCard: {
    marginHorizontal: 20,
    marginTop: 18,
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: 'rgba(232, 68, 122, 0.15)',
    shadowColor: Colors.magenta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  promptQuestion: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.magenta,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  promptAnswer: {
    ...Typography.heading,
    fontSize: 20,
    color: Colors.plum,
    lineHeight: 28,
  },
  spotifyCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#121212',
    padding: 18,
    borderRadius: Radius.card,
  },
  spotifyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  spotifyBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1DB954',
  },
  spotifyLogoText: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  spotifyTrackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  albumArt: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  trackMeta: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    color: '#B3B3B3',
  },
  galleryFullPhoto: {
    width: '100%',
    height: 380,
    borderRadius: Radius.card,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  stickyFooterBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: Colors.cream,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingBottom: 10,
  },
  actionCircleBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  passBtn: {
    borderWidth: 2,
    borderColor: Colors.coral,
  },
  superBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  likeBtn: {
    backgroundColor: Colors.magenta,
  },
  actionIcon: {
    fontSize: 24,
  },
});
