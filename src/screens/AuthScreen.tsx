import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, G } from 'react-native-svg';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Button } from '../components/Button';
import { LogoMark } from '../components/illustrations/BrandAssets';
import { ConfirmDialog } from '../components/modals/ConfirmDialog';
import { signInWithGoogle } from '../services/authService';

interface AuthScreenProps {
  onSuccess: (result: { user: any; isNewUser: boolean; onboardingComplete: boolean }) => void;
}

const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 48 48">
    <G>
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.66 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.66 48 24 48z"
      />
    </G>
  </Svg>
);

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);

  // Custom Alert Modal State
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    icon?: string;
    confirmText?: string;
    cancelText?: string | null;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleGoogleSignIn = async () => {
    console.log('🔘 [AuthScreen] "Sign in with Google" button pressed — calling signInWithGoogle()...');
    setLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res && res.user) {
        onSuccess({
          user: res.user,
          isNewUser: res.isNewUser,
          onboardingComplete: res.onboardingComplete,
        });
      }
    } catch (err: any) {
      // Distinguish timeout / server-waking-up from hard auth failures
      const isNetworkOrTimeout =
        err?.code === 'ECONNABORTED' ||
        err?.message === 'Network Error' ||
        err?.message?.toLowerCase().includes('timeout');

      setModalConfig({
        visible: true,
        title: isNetworkOrTimeout ? 'Server is Starting Up ☕' : 'Sign-In Error',
        message: isNetworkOrTimeout
          ? 'Our server is waking up from sleep (Render free tier). Please wait a few seconds and try again.'
          : err.message || 'Unable to sign in with Google. Please try again.',
        icon: isNetworkOrTimeout ? '⏳' : '⚠️',
        confirmText: 'OK',
        cancelText: null,
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Header: Logo & Tagline ONLY */}
        <View style={styles.brandContainer}>
          <LogoMark size={72} />
          <Text style={styles.brandName}>ping</Text>
          <Text style={styles.tagline}>Real people. Happier conversations.</Text>
        </View>

        {/* Primary Native Social Sign-In Controls */}
        <View style={styles.actionContainer}>
          <Button
            title="Sign in with Google"
            variant="outline"
            icon={<GoogleIcon />}
            onPress={handleGoogleSignIn}
            loading={loading}
            style={styles.googleButton}
            textStyle={{ color: Colors.plum, fontWeight: '700' }}
          />

          <Text style={styles.termsText}>
            By signing in, you agree to our Terms of Service & Privacy Policy.
          </Text>
        </View>

        {/* Custom Brand Dialog Modal */}
        <ConfirmDialog
          visible={modalConfig.visible}
          title={modalConfig.title}
          message={modalConfig.message}
          icon={modalConfig.icon}
          confirmText={modalConfig.confirmText}
          cancelText={modalConfig.cancelText}
          onConfirm={modalConfig.onConfirm}
          onCancel={modalConfig.onCancel}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  brandName: {
    ...Typography.display,
    color: Colors.magenta,
    fontSize: 44,
    fontWeight: '800',
    marginTop: 12,
  },
  tagline: {
    ...Typography.body,
    color: Colors.textMuted,
    fontSize: 16,
    marginTop: 6,
    textAlign: 'center',
  },
  actionContainer: {
    width: '100%',
    marginBottom: 40,
    gap: 14,
  },
  googleButton: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    borderColor: 'rgba(43, 22, 32, 0.2)',
    backgroundColor: Colors.white,
    shadowColor: Colors.plum,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  termsText: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    fontSize: 12,
    marginTop: 12,
    lineHeight: 18,
  },
});
