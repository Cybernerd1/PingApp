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
function getGeolocation(): Geo {
  const name = 'RNCGeolocation';
  if (!(NativeModules[name] ?? TurboModuleRegistry.get(name))) throw new LocationUnavailable();
  return require('@react-native-community/geolocation').default as Geo;
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
