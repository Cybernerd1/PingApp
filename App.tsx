import React, { useState } from 'react';
import { StatusBar, StyleSheet, View, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from './src/theme/colors';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';

export type AppStep = 'onboarding' | 'auth' | 'home';

function App(): React.JSX.Element {
  const [currentStep, setCurrentStep] = useState<AppStep>('onboarding');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const handleOnboardingComplete = () => {
    setCurrentStep('auth');
  };

  const handleAuthSuccess = (userData: any) => {
    setCurrentUser(userData);
    setCurrentStep('home');
  };

  const handleOpenChat = () => {
    Alert.alert(
      'Matches & Chat',
      `Active Matches: 3\nUser: ${currentUser?.username || 'Alex'}\n\nSocket.IO real-time chat client connects to /chat namespace with JWT.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {currentStep === 'onboarding' && (
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        )}

        {currentStep === 'auth' && (
          <AuthScreen onSuccess={handleAuthSuccess} />
        )}

        {currentStep === 'home' && (
          <HomeScreen onOpenChat={handleOpenChat} />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
});

export default App;
