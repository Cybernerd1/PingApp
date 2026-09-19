import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Header } from '../components/Header';
import { CardStack, CandidateProfile } from '../components/CardStack';
import { MascotEmptyStateSVG } from '../components/illustrations/BrandAssets';
import { Button } from '../components/Button';
import { MatchModal } from '../components/modals/MatchModal';
import { FullProfileModal } from '../components/modals/FullProfileModal';
import apiClient from '../services/apiClient';

// Rich dating candidate profiles matching Ping design standards
const MOCK_CANDIDATES: CandidateProfile[] = [
  {
    id: 'cand_1',
    username: 'Sophia',
    age: 23,
    jobTitle: 'UX Designer & Coffee Enthusiast',
    bio: 'Looking for someone to explore hidden coffee spots, talk about design, and go on weekend road trips! ☕✨ Always up for spontaneous museum dates or tasting local food markets.',
    interests: ['🎨 Design', '☕ Coffee', '📷 Photography', '✈️ Travel', '🎧 Electronic'],
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    ],
    distanceKm: 2.8,
    location: 'Downtown, SF',
    height: "5'6\" (168 cm)",
    zodiac: '♌ Leo',
    education: 'Stanford University',
    hometown: 'San Francisco, CA',
    lookingFor: '💖 Long-term relationship',
    prompts: [
      {
        question: 'My simple pleasures...',
        answer: 'Hot pour-over espresso on crisp autumn mornings and finding rare vinyl records.',
      },
      {
        question: 'Together, we could...',
        answer: 'Cook an ambitious Italian dinner, debate interface design, and plan a weekend getaway.',
      },
    ],
    spotifyTrack: {
      name: 'Fred again..',
      track: 'Adore U',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80',
    },
  },
  {
    id: 'cand_2',
    username: 'Liam',
    age: 26,
    jobTitle: 'Software Engineer & Indie Musician',
    bio: 'Code by day, play acoustic guitar by night. Let us make a killer playlist together 🎸 Big fan of vinyl records, ramen nights, and coastal hikes.',
    interests: ['🎸 Guitar', '💻 Coding', '🎧 Indie Rock', '🍕 Pizza', '🐕 Dogs'],
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    ],
    distanceKm: 4.5,
    location: 'Mission District, SF',
    height: "6'1\" (185 cm)",
    zodiac: '♊ Gemini',
    education: 'UC Berkeley',
    hometown: 'Seattle, WA',
    lookingFor: '🥂 Casual & fun dates',
    prompts: [
      {
        question: 'Two truths and a lie...',
        answer: 'I play 4 instruments, I have climbed Mt. Rainier, I hate avocado toast.',
      },
      {
        question: 'My ideal Sunday...',
        answer: 'Farmer market stroll, jamming on the porch, and baking sourdough pizza.',
      },
    ],
    spotifyTrack: {
      name: 'The 1975',
      track: 'About You',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
    },
  },
  {
    id: 'cand_3',
    username: 'Maya',
    age: 24,
    jobTitle: 'Architect & Potter',
    bio: 'Passionate about sustainable architecture and ceramics. Big fan of sunset walks, botanical gardens, and deep late-night conversations.',
    interests: ['🏺 Pottery', '🏛️ Architecture', '🌿 Plants', '🍷 Wine', '🎨 Fine Arts'],
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    ],
    distanceKm: 1.2,
    location: 'Marina, SF',
    height: "5'7\" (170 cm)",
    zodiac: '♎ Libra',
    education: 'Cornell AAP',
    hometown: 'Portland, OR',
    lookingFor: '✨ Someone who loves creativity',
    prompts: [
      {
        question: 'I take pride in...',
        answer: 'Hand-throwing all the coffee mugs in my studio and building green rooftops.',
      },
    ],
    spotifyTrack: {
      name: 'Leon Bridges',
      track: 'Texas Sun',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80',
    },
  },
  {
    id: 'cand_4',
    username: 'Ethan',
    age: 25,
    jobTitle: 'Fitness Coach & Hiker',
    bio: 'Early morning runner, bouldering lover, and amateur chef. Let us cook something awesome after a summit hike!',
    interests: ['🏃 Running', '🧗 Bouldering', '🍳 Cooking', '🐕 Dogs', '🏞️ Trail Running'],
    photos: [
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    ],
    distanceKm: 3.1,
    location: 'Pacific Heights, SF',
    height: "6'0\" (183 cm)",
    zodiac: '♐ Sagittarius',
    education: 'UCLA',
    hometown: 'Denver, CO',
    lookingFor: '⛰️ Adventure buddy',
    prompts: [
      {
        question: 'First round is on me if...',
        answer: 'You can out-climb me at the boulder gym or teach me a secret pasta recipe.',
      },
    ],
    spotifyTrack: {
      name: 'Odesza',
      track: 'A Moment Apart',
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=300&q=80',
    },
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
  const [expandedCandidate, setExpandedCandidate] = useState<CandidateProfile | null>(null);

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
              onExpandProfile={(candidate) => setExpandedCandidate(candidate)}
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

        {/* Expanded Full Candidate Profile Modal */}
        <FullProfileModal
          visible={!!expandedCandidate}
          candidate={expandedCandidate}
          onClose={() => setExpandedCandidate(null)}
          onLike={(cand) => {
            handleSwipe('like', cand);
            setCandidates((prev) => prev.filter((c) => c.id !== cand.id));
          }}
          onPass={(cand) => {
            handleSwipe('pass', cand);
            setCandidates((prev) => prev.filter((c) => c.id !== cand.id));
          }}
          onSuperLike={(cand) => {
            handleSwipe('superlike', cand);
            setCandidates((prev) => prev.filter((c) => c.id !== cand.id));
          }}
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
});
