import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { Colors } from '../theme/colors';
import { Radius } from '../theme/typography';
import { useAuth } from '../hooks/useAuth';
import { OTPVerifyScreen } from './OTPVerifyScreen';
// Static import — dynamic import() is unreliable with Metro bundler
import { signInWithGoogle } from '../services/authService';
import {
  EyeOpenIcon,
  EyeClosedIcon,
  BackArrowIcon,
} from '../components/illustrations/Icons';

const PING_ICON = require('../assets/images/ping_icon.png');
const PING_LOGO_FULL = require('../assets/images/ping_logo_full.png');

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AuthScreenProps {
  onSuccess?: (result: any) => void;
  onNavigateToOTP?: (username: string, isLogin: boolean) => void;
  onSkipToPrototype?: () => void;
}

// ─── SVG Icons (inline, no emoji) ─────────────────────────────────────────────

/** Google "G" logo SVG */
const GoogleSVGIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
);

/** Email envelope SVG */
const EmailSVGIcon = ({ size = 20, color = Colors.white }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x={2} y={4} width={20} height={16} rx={3}
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
    <Path
      d="M2 8l10 6 10-6"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

/** Check mark SVG */
const CheckIcon = ({ size = 14, color = Colors.white }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17l-5-5"
      stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

/** Pin / Location SVG */
const PinIcon = ({ size = 14, color = Colors.magenta }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
    <Circle cx={12} cy={9} r={2.5} stroke={color} strokeWidth={2} />
  </Svg>
);

/** Arrow Right SVG */
const ArrowRightIcon = ({ size = 18, color = Colors.white }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12h14M13 6l6 6-6 6"
      stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

// ─── Component ─────────────────────────────────────────────────────────────────

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSuccess,
  onNavigateToOTP,
  onSkipToPrototype,
}) => {
  // 'choice' | 'email-login' | 'email-signup'
  const [viewMode, setViewMode] = useState<'choice' | 'email-login' | 'email-signup'>('choice');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpView, setShowOtpView] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(true);

  const { signup, isSigningUp, signupError, login, isLoggingIn, loginError } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [viewMode]);

  // Reset animation when switching views
  const switchView = (mode: typeof viewMode) => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    setViewMode(mode);
  };

  const handleEmailAuth = async () => {
    if (!username.trim()) return;
    const isLogin = viewMode === 'email-login';
    if (isLogin) {
      const res = await login({ username: username.trim(), preferred_challenge: 'EMAIL_OTP' });
      if (res.status === 'success') {
        if (onNavigateToOTP) onNavigateToOTP(username.trim(), true);
        else setShowOtpView(true);
      }
    } else {
      const res = await signup({ username: username.trim(), preferred_challenge: 'EMAIL_OTP' });
      if (res.status === 'success') {
        if (onNavigateToOTP) onNavigateToOTP(username.trim(), false);
        else setShowOtpView(true);
      }
    }
  };

  // ── Google Sign-In — static import, no dynamic() ─────────────────────────
  const handleGoogleSignIn = async () => {
    setGoogleError(null);
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (onSuccess) onSuccess(result);
    } catch (err: any) {
      console.error('[AuthScreen] Google sign-in error:', err);
      // Don't show error for user-cancelled sign-in
      const code = err?.code ?? '';
      if (code !== 'SIGN_IN_CANCELLED' && code !== 'statusCodes.SIGN_IN_CANCELLED') {
        setGoogleError(err?.message ?? 'Google sign-in failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const currentError = viewMode === 'email-login' ? loginError : signupError;
  const isLoading = isSigningUp || isLoggingIn;

  // ── OTP View ──────────────────────────────────────────────────────────────
  if (showOtpView) {
    return (
      <OTPVerifyScreen
        username={username.trim()}
        isLogin={viewMode === 'email-login'}
        onSuccess={(profileExists) => {
          if (onSuccess) {
            onSuccess({ user: { username: username.trim() }, onboardingComplete: profileExists });
          }
        }}
        onBack={() => setShowOtpView(false)}
      />
    );
  }

  // ── Email Form (Login or Signup) ──────────────────────────────────────────
  if (viewMode === 'email-login' || viewMode === 'email-signup') {
    const isLogin = viewMode === 'email-login';
    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex1}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.emailScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Decorative blobs */}
            <View style={[styles.blob, styles.blobTR]} />
            <View style={[styles.blob, styles.blobBL]} />

            {/* Back */}
            <TouchableOpacity
              style={styles.backBtn}
              activeOpacity={0.7}
              onPress={() => switchView('choice')}
            >
              <BackArrowIcon size={22} color={Colors.plum} />
            </TouchableOpacity>

            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              <Text style={styles.emailFormTitle}>
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </Text>
              <Text style={styles.emailFormSubtitle}>
                {isLogin ? 'Sign in to your account' : 'Join Ping today'}
              </Text>

              {/* Full Name (signup only) */}
              {!isLogin && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ayush Jaiswal"
                    placeholderTextColor={Colors.textMuted}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              )}

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email address</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="ayush@gmail.com"
                  placeholderTextColor={Colors.textMuted}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                />
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.textInput, styles.passwordInput]}
                    placeholder="••••••••••"
                    placeholderTextColor={Colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    {showPassword
                      ? <EyeOpenIcon size={20} color={Colors.textMuted} />
                      : <EyeClosedIcon size={20} color={Colors.textMuted} />
                    }
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot password */}
              {isLogin && (
                <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.7}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              )}

              {/* Terms checkbox (signup only) */}
              {!isLogin && (
                <TouchableOpacity
                  style={styles.termsRow}
                  activeOpacity={0.8}
                  onPress={() => setTermsAccepted(!termsAccepted)}
                >
                  <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                    {termsAccepted && <CheckIcon size={12} color={Colors.white} />}
                  </View>
                  <Text style={styles.termsText}>
                    I agree to the{' '}
                    <Text style={styles.termsLink}>Terms of Service</Text>
                    {' '}and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>
              )}

              {/* Errors */}
              {currentError && (
                <Text style={styles.errorText}>{currentError.message}</Text>
              )}

              {/* Primary CTA */}
              <TouchableOpacity
                style={[styles.primaryBtn, (isLoading || !username.trim()) && styles.primaryBtnDisabled]}
                activeOpacity={0.88}
                onPress={handleEmailAuth}
                disabled={isLoading || !username.trim()}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>
                      {isLogin ? 'Sign In' : 'Create Account'}
                    </Text>
                    <ArrowRightIcon size={18} color={Colors.white} />
                  </>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google CTA */}
              <TouchableOpacity
                style={[styles.socialBtn, googleLoading && styles.socialBtnDisabled]}
                activeOpacity={0.88}
                onPress={handleGoogleSignIn}
                disabled={googleLoading}
              >
                {googleLoading
                  ? <ActivityIndicator size="small" color={Colors.plum} />
                  : <GoogleSVGIcon size={20} />
                }
                <Text style={styles.socialBtnText}>Continue with Google</Text>
              </TouchableOpacity>

              {/* Google error */}
              {googleError && (
                <Text style={styles.errorText}>{googleError}</Text>
              )}

              {/* Switch mode */}
              <View style={styles.switchModeRow}>
                <Text style={styles.switchModeText}>
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                </Text>
                <TouchableOpacity onPress={() => switchView(isLogin ? 'email-signup' : 'email-login')}>
                  <Text style={styles.switchModeLink}>
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Choice Screen (default) ───────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.choiceScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Decorative blobs */}
        <View style={[styles.blob, styles.blobTR]} />
        <View style={[styles.blob, styles.blobBL]} />

        {/* Logo section */}
        <Animated.View
          style={[
            styles.choiceLogoSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.logoBox}>
            <Image
              source={PING_ICON}
              style={styles.logoIconImg}
              resizeMode="contain"
            />
          </View>
          <Image
            source={PING_LOGO_FULL}
            style={styles.logoWordmarkImg}
            resizeMode="contain"
          />
          <View style={styles.taglineRow}>
            <PinIcon size={13} color={Colors.magenta} />
            <Text style={styles.logoTagline}>Chat. Connect. Be Real.</Text>
          </View>
        </Animated.View>

        {/* Actions */}
        <Animated.View
          style={[
            styles.choiceActions,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.choiceHeading}>Continue to Ping</Text>

          {/* Google Button */}
          <TouchableOpacity
            style={[styles.googleBtn, googleLoading && styles.googleBtnDisabled]}
            activeOpacity={0.88}
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color={Colors.plum} />
            ) : (
              <GoogleSVGIcon size={22} />
            )}
            <Text style={styles.googleBtnText}>
              {googleLoading ? 'Signing in...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          {/* Google error */}
          {googleError && (
            <Text style={styles.errorText}>{googleError}</Text>
          )}

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email Button */}
          <TouchableOpacity
            style={styles.emailBtn}
            activeOpacity={0.88}
            onPress={() => switchView('email-signup')}
          >
            <EmailSVGIcon size={20} color={Colors.coral} />
            <Text style={styles.emailBtnText}>Continue with Email</Text>
          </TouchableOpacity>

          {/* Switch to Login */}
          <View style={styles.switchModeRow}>
            <Text style={styles.switchModeText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => switchView('email-login')}>
              <Text style={styles.switchModeLink}>Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Legal */}
          <Text style={styles.legalText}>
            By continuing, you agree to our{' '}
            <Text style={styles.legalLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Text>

          {/* Demo mode */}
          {onSkipToPrototype && (
            <TouchableOpacity
              style={styles.demoBtn}
              activeOpacity={0.8}
              onPress={onSkipToPrototype}
            >
              <Text style={styles.demoBtnText}>Explore Demo Mode</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  flex1: {
    flex: 1,
  },

  // ── Blobs ──────────────────────────────────────────────────────────────────
  blob: {
    position: 'absolute',
    borderRadius: 130,
    opacity: 0.15,
  },
  blobTR: {
    width: 240,
    height: 240,
    top: -60,
    right: -70,
    backgroundColor: Colors.coral,
  },
  blobBL: {
    width: 200,
    height: 200,
    bottom: 80,
    left: -80,
    backgroundColor: Colors.peach,
  },

  // ── Choice Screen ──────────────────────────────────────────────────────────
  choiceScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 48,
  },
  choiceLogoSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 52,
  },
  logoBox: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: Colors.magenta,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.magenta,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 14,
    overflow: 'hidden',
  },
  logoIconImg: {
    width: 52,
    height: 52,
  },
  logoWordmarkImg: {
    width: 140,
    height: 44,
    marginBottom: 6,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoTagline: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
  choiceHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.plum,
    textAlign: 'center',
    marginBottom: 20,
  },
  choiceActions: {
    width: '100%',
  },

  // Google button
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.09)',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 14,
  },
  googleBtnDisabled: {
    opacity: 0.7,
  },
  googleBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.plum,
  },

  // Email button
  emailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.09)',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  emailBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.plum,
  },

  // ── Divider ────────────────────────────────────────────────────────────────
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  dividerText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },

  // ── Switch mode ─────────────────────────────────────────────────────────────
  switchModeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  switchModeText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  switchModeLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.magenta,
  },

  // ── Legal ─────────────────────────────────────────────────────────────────
  legalText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 18,
  },
  legalLink: {
    color: Colors.magenta,
    fontWeight: '600',
  },

  // ── Demo ──────────────────────────────────────────────────────────────────
  demoBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    marginTop: 24,
  },
  demoBtnText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },

  // ── Email Form ─────────────────────────────────────────────────────────────
  emailScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 48,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    marginLeft: -8,
  },
  emailFormTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.plum,
    marginBottom: 4,
  },
  emailFormSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 32,
  },

  // Input fields
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.plum,
    marginBottom: 7,
  },
  textInput: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.09)',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    fontSize: 15,
    color: Colors.plum,
    fontWeight: '500',
  },
  passwordRow: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 52,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
  },

  // Forgot password
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    marginTop: -8,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.magenta,
  },

  // Terms
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 22,
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.magenta,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
    backgroundColor: Colors.white,
  },
  checkboxChecked: {
    backgroundColor: Colors.magenta,
    borderColor: Colors.magenta,
  },
  termsText: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 19,
    flex: 1,
  },
  termsLink: {
    color: Colors.magenta,
    fontWeight: '600',
  },

  // Error
  errorText: {
    fontSize: 13,
    color: Colors.danger,
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Primary CTA button
  primaryBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.magenta,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.magenta,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnDisabled: {
    opacity: 0.55,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },

  // Social button (Google on email form)
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.09)',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  socialBtnDisabled: {
    opacity: 0.7,
  },
  socialBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.plum,
  },
});
