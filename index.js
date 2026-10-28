/**
 * @format
 */

// MUST be imported before other imports.
import 'react-native-gesture-handler';

import React from 'react';
import { AppRegistry } from 'react-native';

import App from './App';
import { name as appName } from './app.json';
import { ErrorBoundary } from './src/ui/ErrorBoundary';
import { setupFCMBackgroundHandler } from './src/native/fcm';
import { CacheGate } from './src/cache/CacheProvider';

// Register background handling before mounting the React application.
setupFCMBackgroundHandler();

const RootApp = () => (
  <ErrorBoundary>
    <CacheGate>
      <App />
    </CacheGate>
  </ErrorBoundary>
);

AppRegistry.registerComponent(appName, () => RootApp);
