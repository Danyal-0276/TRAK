import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, PermissionsAndroid, Platform, TurboModuleRegistry } from 'react-native';

function hasNativeModule(name) {
  if (NativeModules[name]) return true;
  try {
    return TurboModuleRegistry.get(name) != null;
  } catch {
    return false;
  }
}

const KEY = 'trak_device_token';

function randomToken() {
  return `trak-mobile-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

/** True only when the native @react-native-firebase/app module is in the binary. */
function isFirebaseNativeLinked() {
  return hasNativeModule('RNFBAppModule');
}

function tryFcmMessaging() {
  if (!isFirebaseNativeLinked()) return null;
  try {
    // Optional: requires google-services.json / GoogleService-Info.plist + native rebuild.
    // eslint-disable-next-line global-require, import/no-unresolved
    const messaging = require('@react-native-firebase/messaging').default;
    return messaging;
  } catch {
    return null;
  }
}

export function isRealFcmToken(token) {
  const t = String(token || '').trim();
  return (
    t.length >= 32
    && !t.startsWith('trak-mobile-')
    && !t.startsWith('trak-web-')
  );
}

async function fallbackToken() {
  const existing = await AsyncStorage.getItem(KEY);
  if (existing) return existing;
  const token = randomToken();
  await AsyncStorage.setItem(KEY, token);
  return token;
}

async function requestNotificationPermission() {
  if (Platform.OS === 'ios') {
    const messaging = tryFcmMessaging();
    if (!messaging) return false;
    const status = await messaging().requestPermission();
    return (
      status === messaging.AuthorizationStatus.AUTHORIZED
      || status === messaging.AuthorizationStatus.PROVISIONAL
    );
  }
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
}

export async function getOrCreatePushToken() {
  try {
    const messaging = tryFcmMessaging();
    if (messaging) {
      try {
        await requestNotificationPermission();
        const token = await messaging().getToken();
        if (token && typeof token === 'string') {
          await AsyncStorage.setItem(KEY, token);
          return token;
        }
      } catch (err) {
        if (__DEV__) {
          console.warn('[push] FCM token unavailable, using local fallback:', err?.message || err);
        }
      }
    } else if (__DEV__) {
      console.warn('[push] @react-native-firebase/messaging not linked — rebuild the native app');
    }
  } catch {
    // Native Firebase not configured — use local device token.
  }
  return fallbackToken();
}

/** Register only a real FCM token with the backend (skips local fallback placeholders). */
export async function syncPushTokenWithBackend(registerFn) {
  const token = await getOrCreatePushToken();
  if (!isRealFcmToken(token)) {
    if (__DEV__) {
      console.warn('[push] Skipping backend registration — not a real FCM token');
    }
    return null;
  }
  await registerFn(token, 'mobile');
  return token;
}

/** Remove the stored FCM token from the backend (e.g. on logout). */
export async function unregisterPushTokenFromBackend(unregisterFn) {
  const token = await AsyncStorage.getItem(KEY);
  if (!isRealFcmToken(token)) return null;
  await unregisterFn(token);
  return token;
}
