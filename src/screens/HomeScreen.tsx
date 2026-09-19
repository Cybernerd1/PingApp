import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Typography, Radius } from '../theme/typography';
import { Header } from '../components/Header';
import { CardStack, CandidateProfile } from '../components/CardStack';
import { MascotEmptyStateSVG } from '../components/illustrations/BrandAssets';
import { Button } from '../components/Button';
import { MatchModal } from '../components/modals/MatchModal';
import apiClient from '../services/apiClient';

// Mock high-quality dating candidate profiles matching Ping design standards
const MOCK_CANDIDATES: CandidateProfile[] = [
  {
    id: 'cand_1',
    username: 'Sophia',
    age: 23,
    jobTitle: 'UX Designer & Coffee Enthusiast',
    bio: 'Looking for someone to explore hidden coffee spots, talk about design, and go on weekend road trips! ☕✨',
    interests: ['🎨 Design', '☕ Coffee', '📷 Photography', '✈️ Travel'],
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    ],
    distanceKm: 2.8,
  },
  {
    id: 'cand_2',
    username: 'Liam',
    age: 26,
    jobTitle: 'Software Engineer & Indie Musician',
    bio: 'Code by day, play acoustic guitar by night. Let us make a killer playlist together 🎸',
    interests: ['🎸 Guitar', '💻 Coding', '🎧 Indie Rock', '🍕 Pizza'],
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    ],
    distanceKm: 4.5,
  },
  {
    id: 'cand_3',
    username: 'Maya',
    age: 24,
    jobTitle: 'Architect & Potter',
    bio: 'Passionate about sustainable architecture and ceramics. Big fan of sunset walks and deep conversations.',
    interests: ['🏺 Pottery', '🏛️ Architecture', '🌿 Plants', '🍷 Wine'],
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    ],
    distanceKm: 1.2,
  },
  {
    id: 'cand_4',
    username: 'Ethan',
    age: 25,
    jobTitle: 'Fitness Coach & Hiker',
    bio: 'Early morning runner, bouldering lover, and amateur chef. Let us cook something awesome!',
    interests: ['🏃 Running', '🧗 Bouldering', '🍳 Cooking', '🐕 Dogs'],
    photos: [
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
    ],
    distanceKm: 3.1,
  },
];

interface HomeScreenProps {
  onOpenChat?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenChat }) => {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchModalVisible, setMatchModalVisible] = useState(false);
  const [matchedCandidate, setMatchedCandidate] = useState<CandidateProfile | null>(null);

  const fetchDiscoveryStack = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/discovery/stack');
      if (response.data?.data?.candidates?.length) {
        setCandidates(response.data.data.candidates);
      } else {
        setCandidates(MOCK_CANDIDATES);
      }
    } catch {
      // Fallback to rich mock candidate stack for offline/development testing
      setCandidates(MOCK_CANDIDATES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscoveryStack();
  }, []);

  const handleSwipe = async (
    action: 'like' | 'pass' | 'superlike',
    candidate: CandidateProfile
  ) => {
    try {
      const res = await apiClient.post('/discovery/swipe', {
        targetUserId: candidate.id,
        action: action === 'superlike' ? 'like' : action,
      });

      if (res.data?.data?.matched) {
        setMatchedCandidate(candidate);
        setMatchModalVisible(true);
      }
    } catch {
      // Simulate instant match on like/superlike for demo
      if (action === 'like' || action === 'superlike') {
        if (Math.random() > 0.4) {
          setMatchedCandidate(candidate);
          setMatchModalVisible(true);
        }
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <Header
          matchCount={3}
          onFilterPress={() =>
            Alert.alert('Filters', 'Distance: < 25 km\nAge: 20-30\nInterests: Coffee, Music, Tech')
          }
          onMatchesPress={onOpenChat}
        />

        {/* Main Swipe Deck Container */}
        <View style={styles.content}>
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={Colors.magenta} />
              <Text style={styles.loadingText}>Finding awesome people nearby...</Text>
            </View>
          ) : candidates.length > 0 ? (
            <CardStack
              candidates={candidates}
              onSwipe={handleSwipe}
              onEmpty={() => setCandidates([])}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MascotEmptyStateSVG width={220} height={200} />
              <Text style={styles.emptyTitle}>You have seen everyone nearby!</Text>
              <Text style={styles.emptySubtitle}>
                Expand your distance settings or check back soon for new pings.
              </Text>
              <Button
                title="Refresh Candidates"
                onPress={fetchDiscoveryStack}
                style={styles.refreshButton}
              />
            </View>
          )}
        </View>

        {/* Animated Reanimated Match Modal */}
        <MatchModal
          visible={matchModalVisible}
          matchAvatar={matchedCandidate?.photos?.[0]}
          matchName={matchedCandidate?.username}
          onSendMessage={() => {
            setMatchModalVisible(false);
            if (onOpenChat) onOpenChat();
          }}
          onKeepSwiping={() => setMatchModalVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textMuted,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    ...Typography.heading,
    fontSize: 22,
    color: Colors.plum,
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  refreshButton: {
    marginTop: 24,
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(43, 22, 32, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  matchCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: Radius.largeCard,
    padding: 28,
    alignItems: 'center',
  },
  matchHeader: {
    ...Typography.display,
    color: Colors.magenta,
    fontSize: 32,
    textAlign: 'center',
  },
  matchSub: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    fontSize: 15,
  },
  matchAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  avatarLeft: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.magenta,
  },
  avatarRight: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.coral,
    marginLeft: -20,
  },
  pingBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -10,
    zIndex: 10,
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalBtnPrimary: {
    width: '100%',
    marginBottom: 12,
  },
  modalBtnSecondary: {
    width: '100%',
  },
});
