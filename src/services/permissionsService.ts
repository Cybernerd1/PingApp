/**
 * Runtime Permissions Service
 *
 * Requests all permissions required by Ping on Android.
 * iOS permissions are declared in Info.plist; the OS prompts automatically.
 */
import { Platform, PermissionsAndroid } from 'react-native';

type PermissionStatus = 'granted' | 'denied' | 'never_ask_again';

interface PermissionsResult {
  camera: PermissionStatus;
  location: PermissionStatus;
  microphone: PermissionStatus;
  readMedia: PermissionStatus;
}

/**
 * Request all app permissions at once.
 * On Android 13+ uses READ_MEDIA_IMAGES/VIDEO.
 * On Android ≤12 falls back to READ_EXTERNAL_STORAGE.
 * Returns a map of permission → status so callers can react if needed.
 */
export const requestAllPermissions = async (): Promise<PermissionsResult | null> => {
  if (Platform.OS !== 'android') {
    // iOS: permissions are requested lazily by each feature (camera, location, etc.)
    return null;
  }

  const apiLevel = Platform.Version as number;

  // Build the list of permissions to request
  const permissionsToRequest: string[] = [
    PermissionsAndroid.PERMISSIONS.CAMERA,
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  ];

  // Media permissions differ by Android version
  if (apiLevel >= 33) {
    permissionsToRequest.push(
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
    );
  } else {
    permissionsToRequest.push(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    );
    if (apiLevel <= 28) {
      permissionsToRequest.push(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
    }
  }

  try {
    const results = await PermissionsAndroid.requestMultiple(
      permissionsToRequest as any[],
    );

    const get = (...keys: string[]): PermissionStatus => {
      for (const key of keys) {
        const val = results[key as keyof typeof results];
        if (val) return val as PermissionStatus;
      }
      return 'denied';
    };

    const mediaKey =
      apiLevel >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

    return {
      camera: get(PermissionsAndroid.PERMISSIONS.CAMERA),
      location: get(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION),
      microphone: get(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO),
      readMedia: get(mediaKey),
    };
  } catch (err) {
    console.warn('[Permissions] requestAllPermissions failed:', err);
    return null;
  }
};

/**
 * Request only camera + media for photo picker flows.
 * Called lazily when the user taps a photo slot.
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  try {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Access',
        message: 'Ping needs camera access so you can take your profile photos.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
};
