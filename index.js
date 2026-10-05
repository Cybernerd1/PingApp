/**
 * @format
 */

// react-native-gesture-handler MUST be imported first before any other import
import 'react-native-gesture-handler';

import React from 'react';
import { AppRegistry } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { name as appName } from './app.json';
import { ErrorBoundary } from './src/ui/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const RootApp = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </ErrorBoundary>
);

AppRegistry.registerComponent(appName, () => RootApp);
