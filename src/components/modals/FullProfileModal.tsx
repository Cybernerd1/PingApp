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
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';
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

// ─── SVG Icons (no emoji) ─────────────────────────────────────────────────────
const BackArrow = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M5 12l7 7M5 12l7-7"
      stroke={Colors.coral}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const HeartIcon = ({ filled = false, size = 22, color = Colors.magenta }: { filled?: boolean; size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={filled ? 0 : 2}
    />
  </Svg>
);

const XIcon = ({ size = 20, color = Colors.coral }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1={18} y1={6} x2={6} y2={18} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    <Line x1={6} y1={6} x2={18} y2={18} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);

const StarIcon = ({ size = 20, color = Colors.magenta }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={color}
    />
  </Svg>
);

const PinIcon = ({ size = 14, color = Colors.magenta }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
    <Circle cx={12} cy={9} r={2.5} stroke={color} strokeWidth={2} />
  </Svg>
);

const BriefcaseIcon = ({ size = 14, color = Colors.textMuted }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={2} y={7} width={20} height={14} rx={2} stroke={color} strokeWidth={2} />
    <Path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const GraduationIcon = ({ size = 14, color = Colors.textMuted }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 10L12 5 2 10l10 5 10-5z"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
    <Path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const RulerIcon = ({ size = 14, color = Colors.textMuted }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={2} y={10} width={20} height={4} rx={1} stroke={color} strokeWidth={2} />
    <Path d="M6 10V8M10 10V7M14 10V8M18 10V7" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

const ZodiacIcon = ({ size = 14, color = Colors.textMuted }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
    <Path d="M12 3v18M3 12h18" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

const MusicIcon = ({ size = 14, color = Colors.textMuted }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18V5l12-2v13" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={6} cy={18} r={3} stroke={color} strokeWidth={2} />
    <Circle cx={18} cy={16} r={3} stroke={color} strokeWidth={2} />
  </Svg>
);

const VerifiedBadge = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17l-5-5"
      stroke={Colors.white}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────
interface FullProfileModalProps {
  visible: boolean;
  candidate: CandidateProfile | null;
  onClose: () => void;
  onLike: (candidate: CandidateProfile) => void;
  onPass: (candidate: CandidateProfile) => void;
  onSuperLike: (candidate: CandidateProfile) => void;
}

// ─── Compact info row ─────────────────────────────────────────────────────────
const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <View style={infoRowStyles.row}>
    <View style={infoRowStyles.iconWrap}>{icon}</View>
    <View style={infoRowStyles.textWrap}>
      <Text style={infoRowStyles.label}>{label}</Text>
      <Text style={infoRowStyles.value}>{value}</Text>
    </View>
  </View>
);

const infoRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF0EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.plum,
  },
});

// ─── Prompt card ─────────────────────────────────────────────────────────────
const PromptCard = ({ question, answer }: { question: string; answer: string }) => (
  <View style={promptStyles.card}>
    <Text style={promptStyles.question}>{question}</Text>
    <Text style={promptStyles.answer}>{answer}</Text>
  </View>
);

const promptStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF8F5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.coral,
  },
  question: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.coral,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  answer: {
    fontSize: 14,
    color: Colors.plum,
    lineHeight: 20,
    fontWeight: '500',
  },
});

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title }: { title: string }) => (
  <Text style={sectionHeaderStyles.title}>{title}</Text>
);

const sectionHeaderStyles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.plum,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
});

// ─── Interest pill ────────────────────────────────────────────────────────────
const InterestPill = ({ label }: { label: string }) => (
  <View style={pillStyles.pill}>
    <Text style={pillStyles.text}>{label}</Text>
  </View>
);

const pillStyles = StyleSheet.create({
  pill: {
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: 'rgba(171, 59, 105, 0.15)',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.plum,
  },
});

// ─── Main Component ───────────────────────────────────────────────────────────
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
        damping: 20,
        stiffness: 150,
        mass: 0.8,
      });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 280 });
    }
  }, [visible]);

  const animatedContainer = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // React Native's Modal handles Android back via onRequestClose — no BackHandler needed
  if (!visible || !candidate) return null;

  const photos =
    candidate.photos && candidate.photos.length > 0
      ? candidate.photos
      : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800'];

  const interests =
    candidate.interests && candidate.interests.length > 0
      ? candidate.interests
      : [];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}   // Android back button → closes modal cleanly
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <Animated.View style={[styles.container, animatedContainer]}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>

          {/* ── Top nav bar ── */}
          <View style={styles.topNav}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.backBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <BackArrow />
            </TouchableOpacity>
            <Text style={styles.topNavName} numberOfLines={1}>
              {candidate.username}
            </Text>
            <View style={styles.verifiedBadgeWrap}>
              <VerifiedBadge />
            </View>
          </View>
        </SafeAreaView>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces
        >
          {/* ── Hero photo section ── */}
          <View style={styles.heroSection}>
            <Image
              source={{ uri: photos[activePhotoIdx] }}
              style={styles.heroImage}
              resizeMode="cover"
            />

            {/* Photo bar indicators */}
            {photos.length > 1 && (
              <View style={styles.photoIndicators}>
                {photos.map((_, i) => (
                  <TouchableOpacity
                    key={i}
                    activeOpacity={0.8}
                    onPress={() => setActivePhotoIdx(i)}
                    style={[styles.indicatorBar, i === activePhotoIdx && styles.indicatorActive]}
                  />
                ))}
              </View>
            )}

            {/* Photo tap zones */}
            {photos.length > 1 && (
              <>
                <TouchableOpacity
                  activeOpacity={1}
                  style={styles.photoTapLeft}
                  onPress={() => setActivePhotoIdx(Math.max(0, activePhotoIdx - 1))}
                />
                <TouchableOpacity
                  activeOpacity={1}
                  style={styles.photoTapRight}
                  onPress={() => setActivePhotoIdx(Math.min(photos.length - 1, activePhotoIdx + 1))}
                />
              </>
            )}

            {/* Hero overlay */}
            <View style={styles.heroOverlay} />
            <View style={styles.heroInfo} pointerEvents="none">
              <View style={styles.heroNameRow}>
                <Text style={styles.heroName}>
                  {candidate.username}
                  <Text style={styles.heroAge}>, {candidate.age}</Text>
                </Text>
              </View>
              {candidate.jobTitle ? (
                <View style={styles.heroMetaRow}>
                  <BriefcaseIcon size={13} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.heroMeta}>{candidate.jobTitle}</Text>
                </View>
              ) : null}
              {candidate.location ? (
                <View style={styles.heroMetaRow}>
                  <PinIcon size={13} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.heroMeta}>
                    {candidate.location} · {candidate.distanceKm} km away
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* ── Quick info grid ── */}
          <View style={styles.infoCard}>
            {candidate.location ? (
              <InfoRow
                icon={<PinIcon size={15} color={Colors.coral} />}
                label="Location"
                value={candidate.location}
              />
            ) : null}
            {candidate.height ? (
              <InfoRow
                icon={<RulerIcon size={15} color={Colors.coral} />}
                label="Height"
                value={candidate.height}
              />
            ) : null}
            {candidate.zodiac ? (
              <InfoRow
                icon={<ZodiacIcon size={15} color={Colors.coral} />}
                label="Zodiac"
                value={candidate.zodiac}
              />
            ) : null}
            {candidate.education ? (
              <InfoRow
                icon={<GraduationIcon size={15} color={Colors.coral} />}
                label="Education"
                value={candidate.education}
              />
            ) : null}
            {candidate.lookingFor ? (
              <InfoRow
                icon={<HeartIcon size={15} color={Colors.coral} />}
                label="Looking for"
                value={candidate.lookingFor}
              />
            ) : null}
          </View>

          {/* ── About ── */}
          {candidate.bio ? (
            <View style={styles.section}>
              <SectionHeader title="About Me" />
              <Text style={styles.bioText}>{candidate.bio}</Text>
            </View>
          ) : null}

          {/* ── Interests ── */}
          {interests.length > 0 ? (
            <View style={styles.section}>
              <SectionHeader title="Passions & Interests" />
              <View style={styles.pillsWrap}>
                {interests.map((interest, i) => (
                  <InterestPill key={i} label={interest} />
                ))}
              </View>
            </View>
          ) : null}

          {/* ── Prompts ── */}
          {candidate.prompts && candidate.prompts.length > 0 ? (
            <View style={styles.section}>
              <SectionHeader title="Conversation Starters" />
              {candidate.prompts.map((p, i) => (
                <PromptCard key={i} question={p.question} answer={p.answer} />
              ))}
            </View>
          ) : null}

          {/* ── Spotify track ── */}
          {candidate.spotifyTrack ? (
            <View style={styles.section}>
              <SectionHeader title="My Anthem" />
              <View style={styles.spotifyCard}>
                <Image
                  source={{ uri: candidate.spotifyTrack.image }}
                  style={styles.spotifyAlbum}
                />
                <View style={styles.spotifyText}>
                  <Text style={styles.spotifyTrack}>{candidate.spotifyTrack.track}</Text>
                  <Text style={styles.spotifyArtist}>{candidate.spotifyTrack.name}</Text>
                </View>
                <MusicIcon size={18} color={Colors.coral} />
              </View>
            </View>
          ) : null}

          {/* ── Action buttons ── */}
          <View style={styles.actionsSection}>
            {/* Like (Konnect) primary button */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.konnectBtn}
              onPress={() => {
                onClose();
                onLike(candidate);
              }}
            >
              <HeartIcon filled size={22} color={Colors.white} />
              <Text style={styles.konnectBtnText}>Konnect</Text>
            </TouchableOpacity>

            {/* Secondary row: Pass + Superlike */}
            <View style={styles.secondaryBtns}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.circleBtn, styles.passBtn]}
                onPress={() => {
                  onClose();
                  onPass(candidate);
                }}
              >
                <XIcon size={22} color={Colors.coral} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.circleBtn, styles.superlikeBtn]}
                onPress={() => {
                  onClose();
                  onSuperLike(candidate);
                }}
              >
                <StarIcon size={22} color={Colors.magenta} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 48 }} />
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF7F4',
  },
  safeArea: {
    backgroundColor: 'transparent',
    zIndex: 10,
  },

  // Top nav
  topNav: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    backgroundColor: '#FDF7F4',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topNavName: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.plum,
    letterSpacing: -0.3,
  },
  verifiedBadgeWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.magenta,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Scroll
  scrollContent: {
    paddingBottom: 20,
  },

  // Hero photo
  heroSection: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.52,
    position: 'relative',
    backgroundColor: Colors.plum,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  photoIndicators: {
    position: 'absolute',
    top: 12,
    left: 14,
    right: 14,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  indicatorBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.38)',
  },
  indicatorActive: {
    backgroundColor: Colors.white,
  },
  photoTapLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '40%',
    height: '100%',
    zIndex: 5,
  },
  photoTapRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '40%',
    height: '100%',
    zIndex: 5,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(38, 16, 28, 0.7)',
  },
  heroInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  heroName: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  heroAge: {
    fontWeight: '400',
    color: 'rgba(255,255,255,0.85)',
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  heroMeta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.82)',
    fontWeight: '500',
  },

  // Info card
  infoCard: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  // Section
  section: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  bioText: {
    fontSize: 15,
    color: '#4A3E39',
    lineHeight: 23,
    fontWeight: '400',
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  // Spotify
  spotifyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    gap: 12,
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  spotifyAlbum: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: Colors.blush,
  },
  spotifyText: {
    flex: 1,
  },
  spotifyTrack: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.plum,
    marginBottom: 2,
  },
  spotifyArtist: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },

  // Action buttons
  actionsSection: {
    marginHorizontal: 16,
    marginTop: 32,
    gap: 14,
  },
  konnectBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.magenta,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.magenta,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
    elevation: 8,
  },
  konnectBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.3,
  },
  secondaryBtns: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  circleBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  passBtn: {
    borderWidth: 2,
    borderColor: Colors.coral,
  },
  superlikeBtn: {
    borderWidth: 2,
    borderColor: Colors.magenta,
  },
});
