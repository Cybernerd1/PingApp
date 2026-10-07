/**
 * Device location → { latitude, longitude }.
 * Requires: npm i @react-native-community/geolocation  (then rebuild the Android app)
 */
import { NativeModules, PermissionsAndroid, Platform, TurboModuleRegistry } from 'react-native';

import { LocationCoordinates } from '../api/types';

type Geo = typeof import('@react-native-community/geolocation').default;

/** Thrown when the installed APK was built before the geolocation package was added. */
export class LocationUnavailable extends Error {
  constructor() {
    super('Location isn’t available in this build. Rebuild the app (npm run android) and try again.');
  }
}

/**
 * Loaded lazily, and only after checking the native module is compiled in —
 * requiring the package without it throws at import time (red screen in dev).
 */
let configured = false;
function getGeolocation(): Geo {
  const name = 'RNCGeolocation';
  if (!(NativeModules[name] ?? TurboModuleRegistry.get(name))) throw new LocationUnavailable();
  const geo = require('@react-native-community/geolocation').default as Geo;
  if (!configured) {
    configured = true;
    // Play Services provider shows Android's native "Turn on device location?" dialog
    // when GPS is off; 'auto' falls back to the plain Android API without it.
    geo.setRNConfiguration({ skipPermissionRequests: false, locationProvider: 'playServices' });
  }
  return geo;
}

export class LocationPermissionDenied extends Error {
  constructor() {
    super('Location permission denied');
  }
}

async function ensurePermission(): Promise<void> {
  if (Platform.OS !== 'android') {
    getGeolocation().requestAuthorization();
    return;
  }
  const fine = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
  if (await PermissionsAndroid.check(fine)) return;
  const result = await PermissionsAndroid.request(fine, {
    title: 'Find people near you',
    message: 'Ping uses your location to show people nearby and how far away they are.',
    buttonPositive: 'Allow',
    buttonNegative: 'Not now',
  });
  if (result !== PermissionsAndroid.RESULTS.GRANTED) throw new LocationPermissionDenied();
}

function getPosition(highAccuracy: boolean): Promise<LocationCoordinates> {
  return new Promise((resolve, reject) => {
    getGeolocation().getCurrentPosition(
      pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: highAccuracy, timeout: 15000, maximumAge: 5 * 60 * 1000 },
    );
  });
}

/** Asks for permission if needed, then returns the current coordinates (coarse fallback). */
export async function getCurrentCoords(): Promise<LocationCoordinates> {
  getGeolocation(); // fail fast with LocationUnavailable before prompting
  await ensurePermission();
  try {
    return await getPosition(true);
  } catch {
    return getPosition(false);
  }
}

/**
 * Run on app open: asks for location permission if missing, then, if the device's
 * location (GPS) is off, triggers the native "turn on location" dialog.
 * Resolves with coordinates when everything is on, otherwise null. Never throws.
 */
export async function ensureLocationReady(): Promise<LocationCoordinates | null> {
  try {
    await getCurrentCoords();
    return await getPosition(false);
  } catch {
    return null;
  }
}
