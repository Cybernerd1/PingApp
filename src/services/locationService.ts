/**
 * Device location → { latitude, longitude }.
 * Requires: npm i @react-native-community/geolocation  (then rebuild the Android app)
 */
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { LocationCoordinates } from '../api/types';

export class LocationPermissionDenied extends Error {
  constructor() {
    super('Location permission denied');
  }
}

async function ensurePermission(): Promise<void> {
  if (Platform.OS !== 'android') {
    Geolocation.requestAuthorization();
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
    Geolocation.getCurrentPosition(
      pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: highAccuracy, timeout: 15000, maximumAge: 5 * 60 * 1000 },
    );
  });
}

/** Asks for permission if needed, then returns the current coordinates (coarse fallback). */
export async function getCurrentCoords(): Promise<LocationCoordinates> {
  await ensurePermission();
  try {
    return await getPosition(true);
  } catch {
    return getPosition(false);
  }
}
