/**
 * Boot gate + persisted QueryClientProvider.
 *
 * 1. Renders a static splash while initStorage() resolves (Keychain read + MMKV
 *    open) — nothing that touches the query cache renders before that.
 * 2. Wraps the app in <PersistQueryClientProvider> so opt-in queries rehydrate
 *    from the encrypted disk cache before the first screen paints.
 * 3. If MMKV couldn't open (degraded device), falls back to a plain
 *    QueryClientProvider so the app still runs, just without persistence.
 */
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Colors } from '../theme/colors';
import { CACHE_VERSION, DECK_KEY, queryClient } from './queryClient';
import { initPersister } from './persister';
import { initStorage } from './storage';

const PING_ICON = require('../assets/images/ping_icon.png');

/** Restored decks older than this are dropped and refetched (location/filters may have changed server-side). */
const DISCOVER_MAX_AGE = 30 * 60 * 1000;
/** Must match queryClient gcTime — see the comment there for why. */
const PERSIST_MAX_AGE = 24 * 60 * 60 * 1000;

export const CacheGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    initStorage().finally(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!ready) return <BootSplash />;

  const persister = initPersister();
  if (!persister) {
    // MMKV unavailable → in-memory cache only, app still fully functional.
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        buster: CACHE_VERSION,
        maxAge: PERSIST_MAX_AGE,
        // Only successful queries marked meta.persist === true go to disk.
        // Anything sensitive or high-churn (messages, payments, assistant,
        // public profiles) must NOT be marked and therefore never persists.
        dehydrateOptions: {
          shouldDehydrateQuery: query =>
            query.state.status === 'success' && query.meta?.persist === true,
        },
      }}
      onSuccess={() => {
        // Restore finished → the deck was rehydrated. If it's older than
        // 30 min, drop it: the server (not the client) filters by location
        // and preferences, so a stale deck may show people already swiped.
        const deck = queryClient.getQueryState(DECK_KEY);
        if (deck?.dataUpdatedAt && Date.now() - deck.dataUpdatedAt > DISCOVER_MAX_AGE) {
          queryClient.removeQueries({ queryKey: DECK_KEY });
        }
        // Replay mutations that were paused offline (likes/dislikes, messages).
        queryClient.resumePausedMutations();
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
};

/** Static brand frame shown only while Keychain+MMKV initialise (~tens of ms). */
const BootSplash: React.FC = () => (
  <View style={styles.boot}>
    <Image source={PING_ICON} style={styles.logo} resizeMode="contain" />
  </View>
);

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 88, height: 88 },
});
