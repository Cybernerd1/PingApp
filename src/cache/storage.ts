/**
 * Encrypted local cache store backing TanStack Query persistence.
 *
 * - The MMKV file is AES-encrypted with a random 16-byte key (128-bit entropy,
 *   base64-encoded for Keychain storage — never Math.random).
 * - That key lives ONLY in the Keychain (service 'ping.mmkv') and is reused on
 *   later launches, so the cache survives app restarts on the device.
 * - Auth tokens are NOT stored here — they already live in the Keychain via
 *   ./src/session/authStorage.ts. Never add them to this store.
 */
import type { MMKV as MMKVInstance } from 'react-native-mmkv';

let Keychain: any = null;
let createMMKV: ((options: { id: string; encryptionKey: string }) => MMKVInstance) | null = null;
try {
  Keychain = require('react-native-keychain');
} catch { Keychain = null; }
try {
  const m = require('react-native-mmkv');
  createMMKV = m.createMMKV;
} catch { createMMKV = null; }

try {
  require('react-native-get-random-values');
} catch {
  // Native module unavailable — crypto.getRandomValues may be missing; storage will degrade.
}

const KEYCHAIN_SERVICE = 'ping.mmkv';
/** MMKV instance id. `createMMKV` must never be called twice for one instance. */
const MMKV_ID = 'ping-cache';

/** The app's one and only MMKV instance. It is assigned exactly once at boot. */
export let storage: MMKVInstance | null = null;
let initialization: Promise<void> | null = null;

/* eslint-disable no-bitwise -- base64 encoding of the random key needs bit ops */
/** Minimal base64 for raw bytes (Hermes has no Buffer/btoa). */
function base64(bytes: Uint8Array): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    out += chars[b0 >> 2] + chars[((b0 & 0b11) << 4) | (b1 >> 4)] + chars[((b1 & 0b1111) << 2) | (b2 >> 6)] + chars[b2 & 0b111111];
  }
  const pad = bytes.length % 3;
  if (pad === 1) return out.slice(0, -2) + '==';
  if (pad === 2) return out.slice(0, -1) + '=';
  return out;
}
/* eslint-enable no-bitwise */

/** Provided at runtime by the react-native-get-random-values import above. */
declare const crypto: {
  getRandomValues<T extends Uint8Array>(array: T): T;
};

/**
 * Keychain-first, random-on-first-launch encryption key.
 * The key represents 16 random bytes; it is stored base64-encoded so the
 * Keychain can hold it as a plain string.
 */
async function getEncryptionKey(): Promise<string> {
  if (!Keychain) throw new Error('Keychain unavailable');
  const stored = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
  if (stored && stored.password) return stored.password;
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) throw new Error('crypto unavailable');
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const key = base64(bytes);
  await Keychain.setGenericPassword('ping_mmkv_key', key, { service: KEYCHAIN_SERVICE });
  return key;
}

/**
 * Create the app's single encrypted MMKV instance. Must be awaited before any
 * screen that reads the query cache renders (see <CacheGate/> in index.js/App.tsx).
 * Resolves without throwing even if Keychain/MMKV fails — the app then runs with
 * an in-memory-only query client instead of crashing.
 */
export function initStorage(): Promise<void> {
  if (initialization) return initialization;
  initialization = (async () => {
    try {
      if (!createMMKV) throw new Error('MMKV unavailable');
      const key = await getEncryptionKey();
      // MMKV v4 API (createMMKV). The default AES-128 is exactly what a 16-byte
      // key targets; pass no `path` so MMKV writes into its default app dir.
      storage = createMMKV({ id: MMKV_ID, encryptionKey: key });
    } catch (e) {
      console.warn('[cache] MMKV unavailable — running without persistence:', e);
    }
  })();
  return initialization;
}

/**
 * The initialized store. Throws if initStorage() hasn't resolved yet — the boot
 * gate guarantees this never happens on a real app start.
 */
export function getStorage(): MMKVInstance {
  if (!storage) throw new Error('[cache] MMKV accessed before initStorage() resolved');
  return storage;
}
