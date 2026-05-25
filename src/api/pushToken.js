import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform, TurboModuleRegistry } from 'react-native';

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

async function fallbackToken() {
  const existing = await AsyncStorage.getItem(KEY);
  if (existing) return existing;
  const token = randomToken();
  await AsyncStorage.setItem(KEY, token);
  return token;
}

export async function getOrCreatePushToken() {
  try {
    const messaging = tryFcmMessaging();
    if (messaging) {
      try {
        if (Platform.OS === 'ios') {
          await messaging().requestPermission();
        }
        const token = await messaging().getToken();
        if (token && typeof token === 'string') {
          await AsyncStorage.setItem(KEY, token);
          return token;
        }
      } catch {
        // fall through to placeholder token
      }
    }
  } catch {
    // Native Firebase not configured — use local device token.
  }
  return fallbackToken();
}
